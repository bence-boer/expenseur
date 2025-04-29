import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { supabase } from '../../supabase/auth.middleware.ts';
import type { SpendingsInInterval } from '../types/DTO.ts';
import type { SupabaseResponse } from '../types/supabase-helper.ts';
import { interval_validator, period_validator } from '../utils/validators.ts';

const app = new Hono()
    .get('/categorized', zValidator('query', period_validator), async (context: Context) => {
        const { start_date, end_date } = context.req.query();
        if (new Date(start_date) > new Date(end_date)) throw new HTTPException(400, { message: 'Start date must be before end date.' });

        const { data, error } = await supabase(context)
            .rpc('spendings_by_category', { start_date, end_date });

        if (error) {
            console.error('Supabase error fetching categorized spendings:', error);
            throw new HTTPException(500, { message: 'Failed to retrieve categorized spendings. Please try again later.', cause: error });
        }
        return context.json(data);
    })
    .get('/categorized/intervalled', zValidator('query', interval_validator), async (context: Context) => {
        const { start_date, end_date, days_interval } = context.req.query();
        if (new Date(start_date) > new Date(end_date)) throw new HTTPException(400, { message: 'Start date must be before end date.' });

        const { data, error }: SupabaseResponse<SpendingsInInterval> = await supabase(context)
            .rpc('spendings_by_category_interval', {
                start_date,
                end_date,
                days_interval: Number(days_interval),
            }) as SupabaseResponse<SpendingsInInterval>;

        if (error) {
            console.error('Supabase error fetching intervalled spendings:', error);
            throw new HTTPException(500, { message: 'Failed to retrieve spendings by interval. Please try again later.', cause: error });
        }
        return context.json(data!);
    });

export default app;
