import { zValidator } from "@hono/zod-validator";
import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { supabase } from "../../supabase/auth.middleware.ts";
import type { TablesInsert } from "../../supabase/types.ts";
import { category_validator } from "../utils/validators.ts";

const app = new Hono()
    .get('/', async (context: Context) => {
        const { data, error } = await supabase(context)
            .from('categories')
            .select('*');

        if (error) throw new HTTPException(500, error);
        return context.json(data);
    })

    .post('/', zValidator('json', category_validator),
        async (context: Context) => {
            const category: TablesInsert<'categories'> = await context.req.json();

            const { data, error } = await supabase(context)
                .from('categories')
                .insert(category)
                .select()
                .single();

            if (error) throw new HTTPException(500, error);
            return context.json(data, 201);
        })

export default app;