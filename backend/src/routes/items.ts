import { zValidator } from "@hono/zod-validator";
import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { supabase } from "../../supabase/auth.middleware.ts";
import type { TablesInsert } from "../../supabase/types.ts";
import { id_validator, item_validator } from "../utils/validators.ts";

const app = new Hono()
    .get('/', async (context: Context) => {
        const { data, error } = await supabase(context)
            .from('items')
            .select('*');

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    })

    .post('/', zValidator('json', item_validator),
        async (context: Context) => {
            const item: TablesInsert<'items'> = await context.req.json();

            const { data, error } = await supabase(context)
                .from('items')
                .insert(item)
                .select()
                .single();

            if (error) throw new HTTPException(500, error);
            return context.json(data);
        })

    .get('/:id', zValidator('param', id_validator),
        async (context: Context) => {
            const item_id = Number(context.req.param('id'));

            const { data, error } = await supabase(context).rpc('item_details', { item_id });
            if (error) throw new HTTPException(500, error);

            return context.json(data[0]);
        })

export default app;