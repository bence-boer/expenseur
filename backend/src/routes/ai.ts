import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";

const app = new Hono()
    .post('/suggest_items', (context: Context) => {
        // TODO: Implement
        throw new HTTPException(501, { message: 'Not Implemented' });
    });

export default app;