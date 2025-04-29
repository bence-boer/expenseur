import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { supabase } from '../../supabase/auth.middleware.ts';
import { gemini, type MimeType, prompt } from '../utils/gemini.ts';
import { ai_expense_prediction_schema, ai_images_form_validator } from '../utils/validators.ts';
import { to_base64_string } from '../utils/files.ts';

const app = new Hono()
    .post('/suggest_items', zValidator('form', ai_images_form_validator), async (context: Context) => {
        const { image } = context.req.valid('form' as any as never) as { image: File };

        const supabase_client = supabase(context);

        let brands, categories, items, units, vendors, tags, expenses;
        try {
            const results = await Promise.all([
                supabase_client.from('brands').select('*'),
                supabase_client.from('categories').select('*'),
                supabase_client.from('items').select('*'),
                supabase_client.from('units').select('*'),
                supabase_client.from('stores').select('*'),
                supabase_client.from('tags').select('*'),
                supabase_client.from('latest_purchases').select('*'),
            ]);

            const errors = results.map((r) => r.error).filter(Boolean);
            if (errors.length) {
                console.error('Supabase errors:', errors);
                throw new HTTPException(500, { message: 'Failed to fetch required data from the database.', cause: errors });
            }

            [
                { data: brands },
                { data: categories },
                { data: items },
                { data: units },
                { data: vendors },
                { data: tags },
                { data: expenses },
            ] = results;
        } catch (error) {
            if (error instanceof HTTPException) throw error;

            console.error('Unexpected error fetching Supabase data:', error);
            throw new HTTPException(500, { message: 'An unexpected error occurred while fetching data.', cause: error });
        }

        let ai_model_response;
        try {
            ai_model_response = await gemini.generateContent([
                {
                    inlineData: {
                        data: await to_base64_string(image),
                        mimeType: image.type as MimeType,
                    },
                },
                prompt(brands, categories, items, units, vendors, expenses, tags),
            ]);
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw new HTTPException(502, { message: 'Failed to get suggestion from the AI service.', cause: error });
        }

        const raw_json_text = ai_model_response.response.candidates?.[0].content.parts[0].text?.replace('```json', '').replaceAll('```', '') ?? '';

        let parsed_json;
        try {
            parsed_json = JSON.parse(raw_json_text);
        } catch (error) {
            console.error('Error parsing JSON response from AI:', error);
            console.error('Raw AI response text:', raw_json_text);
            throw new HTTPException(500, { message: 'Failed to parse the AI response (invalid JSON format).', cause: error });
        }

        const { success, data, error: validation_error } = ai_expense_prediction_schema.safeParse(parsed_json);

        if (!success) {
            console.error('Error validating AI response structure:', validation_error);
            console.error('Parsed AI JSON:', parsed_json);
            throw new HTTPException(400, { message: 'The AI response did not match the expected format.', cause: validation_error.format() });
        }

        return context.json(data);
    });

export default app;
