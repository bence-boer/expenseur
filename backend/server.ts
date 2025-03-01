import { Hono } from 'hono';
import { logger } from 'hono/logger';

import ai from "./src/routes/ai.ts";
import auth from "./src/routes/auth.ts";
import brands from "./src/routes/brands.ts";
import categories from "./src/routes/categories.ts";
import items from "./src/routes/items.ts";
import purchases from "./src/routes/purchases.ts";
import spendings from "./src/routes/spendings.ts";
import units from "./src/routes/units.ts";
import vendors from "./src/routes/vendors.ts";
import { cors_middleware } from './src/utils/cors.middleware.ts';
import { supabase_middleware } from "./supabase/auth.middleware.ts";

const app = new Hono()
    // Configuration
    .use(
        cors_middleware(),
        supabase_middleware(),
        logger()
    )
    .basePath('/api')
    // Routes
    .route('/ai', ai)
    .route('/auth', auth)
    .route('/brands', brands)
    .route('/categories', categories)
    .route('/items', items)
    .route('/purchases', purchases)
    .route('/spendings', spendings)
    .route('/vendors', vendors)
    .route('/units', units)


Deno.serve(app.fetch)

export type AppType = typeof app;