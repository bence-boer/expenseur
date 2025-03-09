import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { supabase } from '../../supabase/auth.middleware.ts';
import type { TablesInsert } from '../../supabase/types.ts';
import { name_validator } from '../utils/validators.ts';

const app = new Hono()
    .get('/', async (context: Context) => {
        const { data, error } = await supabase(context)
            .from('units')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    })
    .post('/', zValidator('json', name_validator), async (context: Context) => {
        const unit: TablesInsert<'units'> = await context.req.json();

        const { data, error } = await supabase(context)
            .from('units')
            .insert(unit)
            .select()
            .single();

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    })
    .patch('/:id', zValidator('param', name_validator), zValidator('json', name_validator), async (context: Context) => {
        const id = Number(context.req.param('id'));
        const unit: TablesInsert<'units'> = await context.req.json();

        const { data, error } = await supabase(context)
            .from('units')
            .update(unit)
            .eq('id', id);

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    })
    .delete('/:id', zValidator('param', name_validator), async (context: Context) => {
        const id = Number(context.req.param('id'));

        const { data, error } = await supabase(context)
            .from('units')
            .delete()
            .eq('id', id);

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    });

export default app;
