import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { supabase } from '../../supabase/auth.middleware.ts';

const app = new Hono()
    .get('/users', async (context: Context) => {
        const { data, error } = await supabase(context).rpc('get_users');

        if (error) throw new HTTPException(500, { message: 'Failed to get users', cause: error });
        return context.json(data, 200);
    });

export default app;
