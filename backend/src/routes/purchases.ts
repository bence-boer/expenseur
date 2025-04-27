import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { session, supabase } from '../../supabase/auth.middleware.ts';
import type { Tables, TablesInsert } from '../../supabase/types.ts';
import { id_validator, period_validator, purchase_validator } from '../utils/validators.ts';

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

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    })
    .post('/', zValidator('json', purchase_validator.array()), async (context: Context) => {
        const payload: (TablesInsert<'purchases'> & { tag_ids?: number[] })[] = await context.req.json();
        const supabase_client = supabase(context);
        const user_id = session(context)!.user.id;

        const purchases_to_insert = payload.map(({ tag_ids, ...purchase }) => ({ ...purchase, user_id }));

        const { data: inserted_purchases, error: insert_purchase_error } = await supabase_client
            .from('purchases')
            .insert(purchases_to_insert)
            .select('id');

        if (insert_purchase_error) throw new HTTPException(500, insert_purchase_error);
        if (!inserted_purchases) throw new HTTPException(500, { message: 'Failed to insert purchases or retrieve IDs' });

        const purchase_tags_to_insert: TablesInsert<'purchase_tags'>[] = [];
        inserted_purchases.forEach((inserted_purchase, index) => {
            const tag_ids = payload[index].tag_ids;
            if (!tag_ids || tag_ids.length === 0) return;

            tag_ids.forEach((tag_id) => {
                purchase_tags_to_insert.push({
                    purchase_id: inserted_purchase.id,
                    tag_id: tag_id,
                    user_id: user_id,
                });
            });
        });

        if (purchase_tags_to_insert.length > 0) {
            const { error: insert_tags_error } = await supabase_client
                .from('purchase_tags')
                .insert(purchase_tags_to_insert);

            if (insert_tags_error) {
                console.error('Failed to insert purchase tags:', insert_tags_error);
                throw new HTTPException(500, { message: 'Purchases inserted, but failed to associate tags.', cause: insert_tags_error });
            }
        }

        return context.body(null, 204);
    })
    .patch('/:id', zValidator('param', id_validator), zValidator('json', purchase_validator.partial()), async (context: Context) => {
        const purchase_id = Number(context.req.param('id'));
        const payload: Partial<Tables<'purchases'> & { tag_ids?: number[] }> = await context.req.json();
        const supabase_client = supabase(context);
        const user_id = session(context)!.user.id;

        if (Object.keys(payload).length === 0) throw new HTTPException(400, { message: 'No data provided' });

        const { tag_ids, ...purchase_data } = payload;

        let purchase;
        if (Object.keys(purchase_data).length > 0) {
            const { data, error: update_purchase_error } = await supabase_client
                .from('purchases')
                .update(purchase_data)
                .eq('id', purchase_id)
                .eq('user_id', user_id)
                .select()
                .single();

            if (update_purchase_error) throw new HTTPException(500, update_purchase_error);
            purchase = data;
        }

        if (tag_ids !== undefined) {
            const { error: delete_tags_error } = await supabase_client
                .from('purchase_tags')
                .delete()
                .eq('purchase_id', purchase_id)
                .eq('user_id', user_id);

            if (delete_tags_error) throw new HTTPException(500, { message: 'Failed to update tags (delete step).', cause: delete_tags_error });

            if (tag_ids.length > 0) {
                const purchase_tags_to_insert: TablesInsert<'purchase_tags'>[] = tag_ids.map((tag_id) => ({
                    purchase_id,
                    tag_id,
                    user_id,
                }));

                const { error: insert_tags_error } = await supabase_client
                    .from('purchase_tags')
                    .insert(purchase_tags_to_insert);

                if (insert_tags_error) throw new HTTPException(500, { message: 'Failed to update tags (insert step).', cause: insert_tags_error });
            }
        }

        return context.json({ ...purchase, tag_ids: payload.tag_ids }, 200);
    })
    .delete('/:id', zValidator('param', id_validator), async (context: Context) => {
        const purchase_id = Number(context.req.param('id'));
        const supabase_client = supabase(context);
        const user_id = session(context)!.user.id;

        const { error: delete_tags_error } = await supabase_client
            .from('purchase_tags')
            .delete()
            .eq('purchase_id', purchase_id)
            .eq('user_id', user_id);

        if (delete_tags_error) {
            console.error(`Failed to delete tags for purchase ${purchase_id}:`, delete_tags_error);
            throw new HTTPException(500, { message: 'Failed to delete tags.', cause: delete_tags_error });
        }

        const { error: delete_purchase_error } = await supabase_client
            .from('purchases')
            .delete()
            .eq('id', purchase_id)
            .eq('user_id', user_id)
            .select();

        if (delete_purchase_error) throw new HTTPException(500, delete_purchase_error);

        return context.body(null, 204);
    });

export default app;
