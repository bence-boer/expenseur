import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { supabase } from '../../supabase/auth.middleware.ts';
import type { TablesInsert } from '../../supabase/types.ts';
import { id_validator, tag_validator } from '../utils/validators.ts';

const app = new Hono()
    .get('/', async (context: Context) => {
        const { data, error } = await supabase(context)
            .from('tags')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    })
    .post('/', zValidator('json', tag_validator), async (context: Context) => {
        const tag: TablesInsert<'tags'> = await context.req.json();

        const { data, error } = await supabase(context)
            .from('tags')
            .insert(tag)
            .select()
            .single();

        if (error) throw new HTTPException(500, error);
        return context.json(data, 201);
    })
    .patch('/:id', zValidator('param', id_validator), zValidator('json', tag_validator.partial()), async (context: Context) => {
        const id = Number(context.req.param('id'));
        const tag: TablesInsert<'tags'> = await context.req.json();

        if (Object.keys(tag).length === 0) throw new HTTPException(400, { message: 'No data provided' });

        const { data, error } = await supabase(context)
            .from('tags')
            .update(tag)
            .eq('id', id);

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    })
    .delete('/:id', zValidator('param', id_validator), async (context: Context) => {
        const id = Number(context.req.param('id'));

        const { data, error } = await supabase(context)
            .from('tags')
            .delete()
            .eq('id', id);

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    });

export default app;
