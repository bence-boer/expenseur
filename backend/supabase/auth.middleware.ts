import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { Context, MiddlewareHandler } from 'hono';
import { env } from 'hono/adapter';
import { setCookie } from 'hono/cookie';
import { cookie_options_mapper } from './cookie-mapper.ts';
import type { Database } from './types.ts';
import type { Environment } from '../src/types/local.ts';

declare module 'hono' {
    interface ContextVariableMap {
        supabase: SupabaseClient<Database, 'public', Database['public']>;
        session: Session | null;
    }
}

export const supabase = (context: Context): SupabaseClient<Database, 'public', Database['public']> => context.get('supabase');
export const session = (context: Context): Session | null => context.get('session');

export const supabase_middleware = (): MiddlewareHandler => {
    return async (context, next) => {
        const environment = env<Environment>(context);
        const url = environment.SUPABASE_URL ?? Deno.env.get('SUPABASE_URL')!;
        const key = environment.SUPABASE_ANON_KEY ?? Deno.env.get('SUPABASE_ANON_KEY')!;

        if (!url) throw new Error('SUPABASE_URL missing!');
        if (!key) throw new Error('SUPABASE_ANON_KEY missing!');

        const supabase = createServerClient<Database, 'public', Database['public']>(url, key, {
            cookies: {
                getAll: () => parseCookieHeader(context.req.header('Cookie') ?? ''),
                setAll: (cookies) =>
                    cookies.forEach(({ name, value, options }) => {
                        const mapped_options = {
                            ...cookie_options_mapper(options),
                            secure: true,
                            sameSite: 'none' as const,
                        };
                        setCookie(context, name, value, mapped_options);
                    }),
            },
        });

        context.set('supabase', supabase);

        await next();
    };
};

export const session_middleware = (): MiddlewareHandler => {
    return async (context, next) => {
        const cookie_header = context.req.header('Cookie');

        if (!cookie_header) {
            context.set('session', null);
            console.error('No cookie header found');
            await next();
            return;
        }

        const cookies = cookie_header.split('; ').reduce((acc: Record<string, string>, cookie) => {
            const [key, value] = cookie.split('=');
            acc[key.trim()] = value;
            return acc;
        }, {});

        const auth_token = cookies['sb-atmchajrexboccdgntma-auth-token'];

        if (!auth_token) {
            context.set('session', null);
            console.error('No auth token found');
            await next();
            return;
        }

        try {
            const base64 = auth_token.split('-')[1];
            if (base64) {
                const decoded = atob(base64);
                const session = JSON.parse(decoded);
                context.set('session', session);
            } else {
                context.set('session', null);
                console.error('No base64 payload found');
            }
        } catch (error) {
            console.error('Error decoding session:', error);
            context.set('session', null);
        }

        await next();
    };
};
