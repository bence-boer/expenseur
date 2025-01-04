import { zValidator } from "@hono/zod-validator";
import { type Context, Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { supabase } from "../../supabase/auth.middleware.ts";
import type { TablesInsert } from "../../supabase/types.ts";
import { id_validator, period_validator, purchase_validator } from "../utils/validators.ts";

const app = new Hono()
    .get('/', zValidator('param', period_validator),
        async (context: Context) => {
            const { start_date, end_date } = context.req.param();
            const { data, error } = await supabase(context)
                .from('all_tables_view')
                .select()
                .gte('date', start_date)
                .lte('date', end_date)
                .order('date', { ascending: false });

            if (error) throw new HTTPException(500, error);
            return context.json(data);
        })

    .post('/', zValidator('json', purchase_validator),
        async (context: Context) => {
            const payload: TablesInsert<'purchases'> = await context.req.json();
            const { data, error } = await supabase(context)
                .from('purchases')
                .insert(payload)
                .select();

            if (error) throw new HTTPException(500, error);
            return context.json(data, 201);
        })

    .delete('/:id', zValidator('param', id_validator),
        async (context: Context) => {
            const id = context.req.param('id');
            const { data, error } = await supabase(context)
                .from('purchases')
                .delete()
                .eq('id', Number(id))
                .select();

            if (error) throw new HTTPException(500, error);
            return context.json(data);
        })

export default app;