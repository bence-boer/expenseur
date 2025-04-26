import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { supabase } from '../../supabase/auth.middleware.ts';
import { gemini, type MimeType, prompt } from '../utils/gemini.ts';
import { ai_images_form_validator, ai_purchase_prediction_schema } from '../utils/validators.ts';
import { to_base64_string } from '../utils/files.ts';

const app = new Hono()
    .post('/suggest_items', zValidator('form', ai_images_form_validator), async (context: Context) => {
        const { image } = context.req.valid('form' as any as never) as { image: File };

        const supabase_client = supabase(context);

        const [
            { data: brands, error: brands_error },
            { data: categories, error: categories_error },
            { data: items, error: items_error },
            { data: units, error: units_error },
            { data: vendors, error: vendors_error },
            { data: tags, error: tags_error },
            { data: purchases, error: purchases_error },
        ] = await Promise.all([
            supabase_client.from('brands').select('*'),
            supabase_client.from('categories').select('*'),
            supabase_client.from('items').select('*'),
            supabase_client.from('units').select('*'),
            supabase_client.from('stores').select('*'),
            supabase_client.from('tags').select('*'),
            supabase_client.from('latest_purchases').select('*'),
        ]);

        const errors = [brands_error, categories_error, items_error, units_error, vendors_error, tags_error, purchases_error].filter(Boolean);
        if (errors.length) throw new HTTPException(500, { cause: errors });

        // const image_parts = await Promise.all([image].map(async (file) => ({
        //     inlineData: {
        //         data: await to_base64(file),
        //         mimeType: file.type as MimeType,
        //     },
        // })));

        const response = await gemini.generateContent([
            // ...image_parts,
            {
                inlineData: {
                    data: await to_base64_string(image),
                    mimeType: image.type as MimeType,
                },
            },
            prompt(brands, categories, items, units, vendors, purchases, tags),
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
