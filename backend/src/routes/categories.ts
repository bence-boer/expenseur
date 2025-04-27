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

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    })
    .post('/', zValidator('json', category_validator), async (context: Context) => {
        const category: TablesInsert<'categories'> = await context.req.json();

        const { data, error } = await supabase(context)
            .from('categories')
            .insert(category)
            .select()
            .single();

        if (error) throw new HTTPException(500, error);
        return context.json(data, 201);
    })
    .patch('/:id', zValidator('param', id_validator), zValidator('json', category_validator.partial()), async (context: Context) => {
        const id = Number(context.req.param('id'));
        const category: TablesInsert<'categories'> = await context.req.json();

        if (Object.keys(category).length === 0) throw new HTTPException(400, { message: 'No data provided' });

        const { data, error } = await supabase(context)
            .from('categories')
            .update(category)
            .eq('id', id);

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    })
    .delete('/:id', zValidator('param', id_validator), async (context: Context) => {
        const id = Number(context.req.param('id'));

        const { data, error } = await supabase(context)
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    });

export default app;
