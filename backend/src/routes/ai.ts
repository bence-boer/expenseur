import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { supabase } from '../../supabase/auth.middleware.ts';
import { gemini, type MimeType, prompt } from '../utils/gemini.ts';
import { encodeBase64 } from 'https://deno.land/std@0.224.0/encoding/base64.ts';
import { PredictedPurchase } from '../types/DTO.ts';
import { ai_purchase_prediction_schema } from '../utils/validators.ts';

const app = new Hono()
    .post('/suggest_items', async (context: Context) => {
        const { image, mime }: { image: number[]; mime: MimeType } = await context.req.json();

        const supabase_client = supabase(context);

        const [
            { data: brands, error: brands_error },
            { data: categories, error: categories_error },
            { data: items, error: items_error },
            { data: units, error: units_error },
            { data: vendors, error: vendors_error },
            { data: purchases, error: purchases_error },
        ] = await Promise.all([
            supabase_client.from('brands').select('*'),
            supabase_client.from('categories').select('*'),
            supabase_client.from('items').select('*'),
            supabase_client.from('units').select('*'),
            supabase_client.from('stores').select('*'),
            supabase_client.from('latest_purchases').select('*'),
        ]);

        const errors = [brands_error, categories_error, items_error, units_error, vendors_error, purchases_error].filter(Boolean);
        if (errors.length) throw new HTTPException(500, { cause: errors });

        const response = await gemini.generateContent([
            {
                inlineData: {
                    data: encodeBase64(new Uint8Array(image)),
                    mimeType: mime,
                },
            },
            prompt(brands, categories, items, units, vendors, purchases),
        ]);

        const json: string = response.response.candidates?.[0].content.parts[0].text?.replace('```json', '').replaceAll('```', '') ?? '';
        const { success, data, error } = ai_purchase_prediction_schema.safeParse(JSON.parse(json));

        if (!success) {
            console.error('Error parsing response:', error);
            throw new HTTPException(400, { cause: 'Invalid response from AI' });
        }

        return context.json(data);
    });

export default app;
