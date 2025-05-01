import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { supabase } from '../../supabase/auth.middleware.ts';
import type { TablesInsert } from '../../supabase/types.ts';
import { id_validator, item_validator } from '../utils/validators.ts';

const app = new Hono()
    .get('/', async (context: Context) => {
        const { data, error } = await supabase(context)
            .from('items')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching items:', error);
            throw new HTTPException(500, { message: 'Failed to fetch items.', cause: error });
        }
        return context.json(data);
    })
    .get('/:id', zValidator('param', id_validator), async (context: Context) => {
        const item_id = Number(context.req.param('id'));

        const { data, error } = await supabase(context).rpc('item_details', { item_id });

        if (error) {
            console.error(`Error fetching item details for ID ${item_id}:`, error);
            throw new HTTPException(500, { message: 'Failed to fetch item details.', cause: error });
        }
        if (!data || data.length === 0) throw new HTTPException(404, { message: `Item with ID ${item_id} not found.` });

        return context.json(data[0]);
    })
    .post('/', zValidator('json', item_validator), async (context: Context) => {
        const item: TablesInsert<'items'> = await context.req.json();

        const { data, error } = await supabase(context)
            .from('items')
            .insert(item)
            .select()
            .single();

        if (error) {
            console.error('Error creating item:', error);
            throw new HTTPException(500, { message: 'Failed to create item.', cause: error });
        }
        return context.json(data);
    })
    .patch('/:id', zValidator('param', id_validator), zValidator('json', item_validator.partial()), async (context: Context) => {
        const id = Number(context.req.param('id'));
        const item: Partial<TablesInsert<'items'>> = await context.req.json();

        if (Object.keys(item).length === 0) throw new HTTPException(400, { message: 'No data provided for update.' });

        const { data, error, status } = await supabase(context)
            .from('items')
            .update(item)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (status === 404 || error.code === 'PGRST116') {
                throw new HTTPException(404, { message: `Item with ID ${id} not found for update.`, cause: error });
            }
            console.error(`Error updating item ID ${id}:`, error);
            throw new HTTPException(500, { message: 'Failed to update item.', cause: error });
        }

        if (data) return context.json(data);
        return context.body(null, 204);
    })
    .delete('/:id', zValidator('param', id_validator), async (context: Context) => {
        const id = Number(context.req.param('id'));

        const { error, count } = await supabase(context)
            .from('items')
            .delete()
            .eq('id', id);

        if (error) {
            if (count === 0) throw new HTTPException(404, { message: `Item with ID ${id} not found for deletion.`, cause: error });
            console.error(`Error deleting item ID ${id}:`, error);
            throw new HTTPException(500, { message: 'Failed to delete item.', cause: error });
        }

        return context.body(null, 204);
    });

export default app;
