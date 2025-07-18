import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { supabase } from '../../supabase/auth.middleware.ts';
import type { TablesInsert } from '../../supabase/types.ts';
import { id_validator, name_validator } from '../utils/validators.ts';

const app = new Hono()
    .get('/', async (context: Context) => {
        const { data, error } = await supabase(context)
            .from('brands')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw new HTTPException(500, { message: 'Failed to fetch brands.', cause: error });

        return context.json(data);
    })
    .post('/', zValidator('json', name_validator), async (context: Context) => {
        const brand: TablesInsert<'brands'> = await context.req.json();

        const { data, error } = await supabase(context)
            .from('brands')
            .insert(brand)
            .select()
            .single();

        if (error) throw new HTTPException(500, { message: 'Failed to create brand.', cause: error });

        return context.json(data);
    })
    .patch('/:id', zValidator('param', id_validator), zValidator('json', name_validator), async (context: Context) => {
        const id = Number(context.req.param('id'));
        const brand: TablesInsert<'brands'> = await context.req.json();

        const { data, error } = await supabase(context)
            .from('brands')
            .update(brand)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new HTTPException(500, { message: 'Failed to update brand.', cause: error });
        if (!data) throw new HTTPException(404, { message: 'Brand not found.' });

        return context.json(data);
    })
    .delete('/:id', zValidator('param', id_validator), async (context: Context) => {
        const id = Number(context.req.param('id'));

        const { error, count } = await supabase(context)
            .from('brands')
            .delete()
            .eq('id', id);

        if (error) throw new HTTPException(500, { message: 'Failed to delete brand.', cause: error });
        if (count === 0) throw new HTTPException(404, { message: 'Brand not found.' });

        return context.body(null, 204);
    });

export default app;
