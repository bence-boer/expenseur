import { Hono } from 'hono';
import { logger } from 'hono/logger';

import admin from './src/routes/admin.ts';
import ai from './src/routes/ai.ts';
import auth from './src/routes/auth.ts';
import brands from './src/routes/brands.ts';
import categories from './src/routes/categories.ts';
import expenses from './src/routes/expenses.ts';
import items from './src/routes/items.ts';
import profile from './src/routes/profile.ts';
import tags from './src/routes/tags.ts';
import units from './src/routes/units.ts';
import vendors from './src/routes/vendors.ts';
import { cors_middleware } from './src/utils/cors.middleware.ts';
import { session_middleware, supabase_middleware } from './supabase/auth.middleware.ts';

const app = new Hono()
    // Configuration
    .use(
        cors_middleware(),
        supabase_middleware(),
        session_middleware(),
        logger(),
    )
    .basePath('/api')
    // Routes
    .route('/admin', admin)
    .route('/ai', ai)
    .route('/auth', auth)
    .route('/brands', brands)
    .route('/categories', categories)
    .route('/expenses', expenses)
    .route('/items', items)
    .route('/profile', profile)
    .route('/tags', tags)
    .route('/vendors', vendors)
    .route('/units', units);

Deno.serve({ hostname: Deno.env.get('HOST'), port: 8000 }, app.fetch);

export type AppType = typeof app;
