import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Context, MiddlewareHandler } from 'hono';
import { env } from 'hono/adapter';
import { setCookie } from 'hono/cookie';
import { cookie_options_mapper } from "./cookie-mapper.ts";
import type { Database } from "./types.ts";
import type { Environment } from '../src/types/local.ts';

declare module 'hono' {
  interface ContextVariableMap {
    supabase: SupabaseClient<Database, 'public', Database['public']>;
  }
}

export const supabase = (context: Context): SupabaseClient<Database, 'public', Database['public']> => context.get('supabase');

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
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => {
          const mapped_options = {
            ...cookie_options_mapper(options),
            secure: true,
            sameSite: 'none' as const,
          };
          setCookie(context, name, value, mapped_options)
        }),
      },
    });

    context.set('supabase', supabase);

    await next();
  };
};
