import { zValidator } from '@hono/zod-validator';
import type { AuthError, AuthResponse } from '@supabase/supabase-js';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { session, supabase } from '../../supabase/auth.middleware.ts';
import type { Empty } from '../types/local.ts';
import type { DeleteUserPayload } from '../types/public.ts';
import type { SupabaseResponse } from '../types/supabase-helper.ts';
import { delete_user_validator, session_validator } from '../utils/validators.ts';

const app = new Hono()
    .get('/avatar', async (context: Context) => {
        const { data, error } = await supabase(context).storage
            .from('avatars')
            .createSignedUrl(`${session(context)!.user.id}/image.png`, 60);

        if (error) throw new HTTPException(401, error);
        return context.json(data, 200);
    })
    .post('/avatar', zValidator('json', session_validator), async (context: Context) => {
        const payload: { refresh_token: string } = await context.req.json();
        const { data, error }: AuthResponse = await supabase(context).auth.refreshSession(payload);

        if (error) throw new HTTPException(401, error);
        return context.json(data, 200);
    })
    .delete('/avatar', zValidator('json', delete_user_validator), async (context: Context) => {
        const payload: DeleteUserPayload = await context.req.json();
        const { error }: SupabaseResponse<Empty, AuthError> = await supabase(context).auth.unlinkIdentity(payload);

        if (error) throw new HTTPException(401, error);
        return context.body(null, 204);
    });

export default app;
