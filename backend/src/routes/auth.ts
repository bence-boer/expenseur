import { zValidator } from '@hono/zod-validator';
import type { AuthError, AuthResponse, AuthTokenResponsePassword } from '@supabase/supabase-js';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { supabase } from '../../supabase/auth.middleware.ts';
import type { Empty } from '../types/local.ts';
import type { DeleteUserPayload, LoginPayload, RegisterPayload } from '../types/public.ts';
import type { SupabaseResponse } from '../types/supabase-helper.ts';
import { delete_user_validator, session_validator, user_validator } from '../utils/validators.ts';

const app = new Hono()
    .post('/session', async (context: Context) => {
        const { data, error } = await supabase(context).auth.getSession();

        if (error) throw new HTTPException(401, { message: 'Failed to get session', cause: error });
        return context.json(data.session, 200);
    })
    .post('/refresh-session', zValidator('json', session_validator), async (context: Context) => {
        const payload: { refresh_token: string } = await context.req.json();
        const { data, error }: AuthResponse = await supabase(context).auth.refreshSession(payload);

        if (error) throw new HTTPException(401, { message: 'Failed to refresh session', cause: error });
        return context.json(data, 200);
    })
    .post('/login', zValidator('json', user_validator), async (context: Context) => {
        const payload: LoginPayload = await context.req.json();
        const { data, error }: AuthTokenResponsePassword = await supabase(context).auth.signInWithPassword(payload);

        if (error) throw new HTTPException(401, { message: 'Login failed. Please check your credentials.', cause: error });
        return context.json(data, 200);
    })
    .post('/logout', async (context: Context) => {
        await supabase(context).auth.signOut();
        return context.body(null, 204);
    })
    .post('/register', zValidator('json', user_validator), async (context: Context) => {
        const payload: RegisterPayload = await context.req.json();
        const { data, error }: AuthResponse = await supabase(context).auth.signUp(payload);

        if (error) throw new HTTPException(400, { message: 'Registration failed. Please try again.', cause: error });
        return context.json(data, 201);
    })
    .delete('/delete', zValidator('json', delete_user_validator), async (context: Context) => {
        const payload: DeleteUserPayload = await context.req.json();
        const { error }: SupabaseResponse<Empty, AuthError> = await supabase(context).auth.unlinkIdentity(payload);

        if (error) throw new HTTPException(400, { message: 'Failed to process request.', cause: error });
        return context.body(null, 204);
    });

export default app;
