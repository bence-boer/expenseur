import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { supabase } from '../../supabase/auth.middleware.ts';
import type { TablesInsert } from '../../supabase/types.ts';
import { category_validator, id_validator } from '../utils/validators.ts';

const app = new Hono()
    .get('/', async (context: Context) => {
        const { data, error } = await supabase(context)
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw new HTTPException(500, { message: 'Failed to fetch categories', cause: error });
        return context.json(data);
    })
    .post('/', zValidator('json', category_validator), async (context: Context) => {
        const category: TablesInsert<'categories'> = await context.req.json();

        const { data, error } = await supabase(context)
            .from('categories')
            .insert(category)
            .select()
            .single();

        if (error) throw new HTTPException(500, { message: 'Failed to create category', cause: error });
        return context.json(data, 201);
    })
    .patch('/:id', zValidator('param', id_validator), zValidator('json', category_validator.partial()), async (context: Context) => {
        const id = Number(context.req.param('id'));
        const category: TablesInsert<'categories'> = await context.req.json();

        if (Object.keys(category).length === 0) throw new HTTPException(400, { message: 'No data provided' });

        const { data, error } = await supabase(context)
            .from('categories')
            .update(category)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') throw new HTTPException(404, { message: 'Category not found', cause: error });
            throw new HTTPException(500, { message: 'Failed to update category', cause: error });
        }
        if (!data) throw new HTTPException(404, { message: 'Category not found' });

        return context.json(data);
    })
    .delete('/:id', zValidator('param', id_validator), async (context: Context) => {
        const id = Number(context.req.param('id'));

        const { error, count } = await supabase(context)
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw new HTTPException(500, { message: 'Failed to delete category', cause: error });
        if (count === 0) throw new HTTPException(404, { message: 'Category not found' });

        return context.body(null, 204);
    });

export default app;
