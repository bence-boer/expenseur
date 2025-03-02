import { cors } from 'hono/cors'

const origin: string = Deno.env.get('CORS_ORIGIN') || 'http://localhost:3000';

export const cors_middleware = () => cors({
    origin,
    credentials: true
});