import { zValidator } from "@hono/zod-validator";
import type { AuthError, AuthResponse, AuthTokenResponsePassword } from "@supabase/supabase-js";
import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { supabase } from "../../supabase/auth.middleware.ts";
import type { Empty } from "../types/local.ts";
import type { DeleteUserPayload, LoginPayload, RegisterPayload } from '../types/public.ts';
import type { SupabaseResponse } from "../types/supabase-helper.ts";
import { delete_user_validator, user_validator } from "../utils/validators.ts";

const app = new Hono()
    .get('/session', async (context: Context) => {
        const { data, error } = await supabase(context).auth.getSession();
        if (error) throw new HTTPException(401, error);
        return context.json(data, 200);
    })

    .post('/login', zValidator('json', user_validator),
        async (context: Context) => {
            const payload: LoginPayload = await context.req.json();
            const { data, error }: AuthTokenResponsePassword = await supabase(context).auth.signInWithPassword(payload);

            if (error) throw new HTTPException(401, error)
            return context.json(data, 200);
        })

    .post('/logout',
        async (context: Context) => {
            const { error } = await supabase(context).auth.signOut();

            if (error) throw new HTTPException(401, error)
            return context.status(204);
        })

    .post('/register', zValidator('json', user_validator),
        async (context: Context) => {
            const payload: RegisterPayload = await context.req.json();
            const { data, error }: AuthResponse = await supabase(context).auth.signUp(payload);

            if (error) throw new HTTPException(401, error);
            return context.json(data, 201);
        })

    .delete('/delete', zValidator('json', delete_user_validator),
        async (context: Context) => {
            const payload: DeleteUserPayload = await context.req.json();
            const { error }: SupabaseResponse<Empty, AuthError> = await supabase(context).auth.unlinkIdentity(payload);

            if (error) throw new HTTPException(401, error);
            return context.status(200);
        })

export default app;