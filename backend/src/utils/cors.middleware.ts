import { cors } from 'hono/cors';

type CORSOptions = Exclude<Parameters<typeof cors>[0], undefined>['origin'];
const origin: CORSOptions = Deno.env.get('CORS_ORIGIN') || ((origin: string) => origin);

export const cors_middleware = () =>
    cors({
        origin,
        credentials: true,
    });
