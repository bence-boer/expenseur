import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { session, supabase } from '../../supabase/auth.middleware.ts';
import type { Tables, TablesInsert } from '../../supabase/types.ts';
import { expense_validator, id_validator, interval_validator, period_validator } from '../utils/validators.ts';
import { SupabaseResponse } from '../types/supabase-helper.ts';
import { SpendingsInInterval } from '../types/DTO.ts';

const app = new Hono()
    .get('/', zValidator('query', period_validator), async (context: Context) => {
        const { start_date, end_date } = context.req.query();

        const { data, error } = await supabase(context)
            .from('all_tables_view')
            .select()
            .gte('date', start_date)
            .lte('date', end_date)
            .order('date', { ascending: false })
            .eq('user_id', session(context)!.user.id);

        if (error) {
            console.error('Failed to fetch expenses:', error);
            throw new HTTPException(500, { message: 'Failed to fetch expenses.', cause: error });
        }
        return context.json(data);
    })
    .post('/', zValidator('json', expense_validator.array()), async (context: Context) => {
        const payload: (TablesInsert<'purchases'> & { tag_ids?: number[] })[] = await context.req.json();
        const supabase_client = supabase(context);
        const user_id = session(context)!.user.id;

        const expenses_to_insert = payload.map(({ tag_ids, ...expense }) => ({ ...expense, user_id }));

        const { data: inserted_expenses, error: insert_expense_error } = await supabase_client
            .from('purchases')
            .insert(expenses_to_insert)
            .select('id');

        if (insert_expense_error) {
            console.error('Failed to insert expenses:', insert_expense_error);
            throw new HTTPException(500, { message: 'Failed to insert expenses.', cause: insert_expense_error });
        }
        if (!inserted_expenses) {
            console.error('Failed to insert expenses or retrieve IDs: No data returned after insert.');
            throw new HTTPException(500, { message: 'Failed to insert expenses or retrieve IDs.' });
        }

        const expense_tags_to_insert: TablesInsert<'purchase_tags'>[] = [];
        inserted_expenses.forEach((inserted_expense, index) => {
            const tag_ids = payload[index].tag_ids;
            if (!tag_ids || tag_ids.length === 0) return;

            tag_ids.forEach((tag_id) =>
                expense_tags_to_insert.push({
                    purchase_id: inserted_expense.id,
                    tag_id: tag_id,
                    user_id: user_id,
                })
            );
        });

        if (expense_tags_to_insert.length > 0) {
            const { error: insert_tags_error } = await supabase_client
                .from('purchase_tags')
                .insert(expense_tags_to_insert);

            if (insert_tags_error) {
                console.error('Failed to insert expense tags:', insert_tags_error);
                throw new HTTPException(500, { message: 'Expenses created, but failed to associate tags.', cause: insert_tags_error });
            }
        }

        return context.body(null, 204);
    })
    .patch('/:id', zValidator('param', id_validator), zValidator('json', expense_validator.partial()), async (context: Context) => {
        const expense_id = Number(context.req.param('id'));
        const payload: Partial<Tables<'purchases'> & { tag_ids?: number[] }> = await context.req.json();
        const supabase_client = supabase(context);
        const user_id = session(context)!.user.id;

        if (Object.keys(payload).length === 0) throw new HTTPException(400, { message: 'No data provided for update.' });

        const { tag_ids, ...expense_data } = payload;

        let expense: Tables<'purchases'> | null = null;
        if (Object.keys(expense_data).length > 0) {
            const { data, error: update_expense_error } = await supabase_client
                .from('purchases')
                .update(expense_data)
                .eq('id', expense_id)
                .eq('user_id', user_id)
                .select()
                .single();

            if (update_expense_error) {
                console.error(`Failed to update expense ${expense_id}:`, update_expense_error);
                throw new HTTPException(500, { message: 'Failed to update expense details.', cause: update_expense_error });
            }
            expense = data;
        }

        if (tag_ids !== undefined) {
            const { error: delete_tags_error } = await supabase_client
                .from('purchase_tags')
                .delete()
                .eq('purchase_id', expense_id)
                .eq('user_id', user_id);

            if (delete_tags_error) {
                console.error(`Failed to delete old tags for expense ${expense_id}:`, delete_tags_error);
                throw new HTTPException(500, { message: 'Failed to update tags (removal step).', cause: delete_tags_error });
            }

            if (tag_ids.length > 0) {
                const expense_tags_to_insert: TablesInsert<'purchase_tags'>[] = tag_ids.map((tag_id) => ({
                    purchase_id: expense_id,
                    tag_id,
                    user_id,
                }));

                const { error: insert_tags_error } = await supabase_client
                    .from('purchase_tags')
                    .insert(expense_tags_to_insert);

                if (insert_tags_error) {
                    console.error(`Failed to insert new tags for expense ${expense_id}:`, insert_tags_error);
                    throw new HTTPException(500, { message: 'Failed to update tags (insertion step).', cause: insert_tags_error });
                }
            }
        }

        if (!expense && tag_ids !== undefined) {
            const { data: fetched_expense, error: fetch_error } = await supabase_client
                .from('purchases')
                .select()
                .eq('id', expense_id)
                .eq('user_id', user_id)
                .single();
            if (fetch_error) {
                console.error(`Failed to fetch updated expense ${expense_id} after tag update:`, fetch_error);
                throw new HTTPException(500, { message: 'Failed to retrieve updated expense after tag update.', cause: fetch_error });
            }
            expense = fetched_expense;
        }

        return context.json({ ...expense, tag_ids: payload.tag_ids ?? [] }, 200);
    })
    .delete('/:id', zValidator('param', id_validator), async (context: Context) => {
        const expense_id = Number(context.req.param('id'));
        const supabase_client = supabase(context);
        const user_id = session(context)!.user.id;

        const { error: delete_tags_error } = await supabase_client
            .from('purchase_tags')
            .delete()
            .eq('purchase_id', expense_id)
            .eq('user_id', user_id);

        if (delete_tags_error) console.error(`Failed to delete tags for expense ${expense_id}:`, delete_tags_error);

        const { error: delete_expense_error, count } = await supabase_client
            .from('purchases')
            .delete()
            .eq('id', expense_id)
            .eq('user_id', user_id);

        if (delete_expense_error) {
            console.error(`Failed to delete expense ${expense_id}:`, delete_expense_error);
            throw new HTTPException(500, { message: 'Failed to delete expense.', cause: delete_expense_error });
        }
        if (count === 0) {
            console.warn(`Expense ${expense_id} not found or already deleted.`);
            throw new HTTPException(404, { message: 'Expense not found or already deleted.' });
        }

        if (delete_tags_error) console.warn(`Expense ${expense_id} deleted, but failed to delete associated tags.`);

        return context.body(null, 204);
    })
    .get('/categorized', zValidator('query', period_validator), async (context: Context) => {
        const { start_date, end_date } = context.req.query();
        if (new Date(start_date) > new Date(end_date)) throw new HTTPException(400, { message: 'Start date must be before end date.' });

        const { data, error } = await supabase(context)
            .rpc('spendings_by_category', { start_date, end_date });

        if (error) {
            console.error('Supabase error fetching categorized spendings:', error);
            throw new HTTPException(500, { message: 'Failed to retrieve categorized spendings. Please try again later.', cause: error });
        }
        return context.json(data);
    })
    .get('/categorized/intervalled', zValidator('query', interval_validator), async (context: Context) => {
        const { start_date, end_date, days_interval } = context.req.query();
        if (new Date(start_date) > new Date(end_date)) throw new HTTPException(400, { message: 'Start date must be before end date.' });

        const { data, error }: SupabaseResponse<SpendingsInInterval> = await supabase(context)
            .rpc('spendings_by_category_interval', {
                start_date,
                end_date,
                days_interval: Number(days_interval),
            }) as SupabaseResponse<SpendingsInInterval>;

        if (error) {
            console.error('Supabase error fetching intervalled spendings:', error);
            throw new HTTPException(500, { message: 'Failed to retrieve spendings by interval. Please try again later.', cause: error });
        }
        return context.json(data!);
    });

export default app;
