export type {
    SignInWithPasswordCredentials as LoginPayload,
    SignUpWithPasswordCredentials as RegisterPayload,
    UserIdentity as DeleteUserPayload
} from "@supabase/supabase-js";


import { Hono, Context, Next, type TypedResponse } from 'hono';
import { z } from 'zod';

// 1. Define Route Handlers Separately
const getHandler = (c: Context) => {
    return c.json({ message: 'Hello from GET!' });
};

const postHandler = async (c: Context, next: Next) => {
    const body = await c.req.json();
    await next();
    return c.json({ message: 'Received POST data', data: body }, 201);
};

const schema = z.object({
    id: z.number(),
    name: z.string()
})


// 2. Use `DefineRoute` (Optional but good for clarity) - This isn't strictly necessary, but helpful
// type GetRoute = DefineRoute<typeof getHandler>;
// type PostRoute = DefineRoute<typeof postHandler>;

// 3. Infer Handler Types
type GetHandlerType = typeof getHandler;
type PostHandlerType = typeof postHandler;

// 4. Custom Type to Extract Response Type
type ExtractResponseType<T> = T extends (
    ...args: any[]
) => infer R
    ? R extends Promise<infer AsyncR>
    ? AsyncR extends TypedResponse<infer Data>
    ? Data
    : AsyncR
    : R extends TypedResponse<infer Data>
    ? Data
    : R
    : never;

// Now apply the extraction
type GetResponseType = ExtractResponseType<GetHandlerType>;
type PostResponseType = ExtractResponseType<PostHandlerType>;

// Example Usage in the Hono App
const app = new Hono();

app.get('/', getHandler);
app.post('/', postHandler);

// You can now use GetResponseType and PostResponseType elsewhere in your code!
const processGetResponse = (data: GetResponseType) => {
    console.log(data.message.toUpperCase()); // No type errors!
};

const processPostResponse = (data: PostResponseType) => {
    console.log(data.data);
    console.log(data.message.length); // No type errors!
};
