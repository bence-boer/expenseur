import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { supabase } from '../../supabase/auth.middleware.ts';
import type { TablesInsert } from '../../supabase/types.ts';
import { id_validator, name_validator } from '../utils/validators.ts';

const app = new Hono()
    .get('/', async (context: Context) => {
        const { data, error } = await supabase(context)
            .from('stores')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    })
    .post('/', zValidator('json', name_validator), async (context: Context) => {
        const store: TablesInsert<'stores'> = await context.req.json();

        const { data, error } = await supabase(context)
            .from('stores')
            .insert(store)
            .select()
            .single();

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    })
    .patch('/:id', zValidator('param', id_validator), zValidator('json', name_validator), async (context: Context) => {
        const id = Number(context.req.param('id'));
        const store: TablesInsert<'stores'> = await context.req.json();

        const { data, error } = await supabase(context)
            .from('stores')
            .update(store)
            .eq('id', id);

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    })
    .delete('/:id', zValidator('param', id_validator), async (context: Context) => {
        const id = Number(context.req.param('id'));

        const { data, error } = await supabase(context)
            .from('stores')
            .delete()
            .eq('id', id);

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    });

export default app;
