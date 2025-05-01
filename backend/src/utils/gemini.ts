import { type FunctionDeclaration, type GenerativeModel, GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { GeminiModel } from '../types/local.ts';
import type { Tables } from '../../supabase/types.ts';
import type { AI_ACCEPTED_IMAGE_TYPES } from './validators.ts';

const GEMINI_API_KEY: string = Deno.env.get('GEMINI_API_KEY')!;
const GEMINI_MODEL: GeminiModel = Deno.env.get('GEMINI_MODEL') as GeminiModel;

const AI: GoogleGenerativeAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const expense_prediction_functions: FunctionDeclaration[] = [
    {
        name: 'predict_expenses',
        description: 'Predict expenses from receipt/shopping list image with associated database items',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                date: {
                    type: SchemaType.STRING,
                    description: 'Purchase date in YYYY-MM-DD format, if visible in the image',
                },
                store_id: {
                    type: SchemaType.INTEGER,
                    description: 'ID of the store from the provided list, if identifiable',
                },
                expenses: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            brand_id: {
                                type: SchemaType.INTEGER,
                                description: 'ID of the brand from the provided list, if identifiable',
                            },
                            details: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                                description: 'Additional details about the item',
                            },
                            item_id: {
                                type: SchemaType.INTEGER,
                                description: 'ID of the item from the provided list',
                            },
                            price: {
                                type: SchemaType.NUMBER,
                                description: 'Price of the item',
                            },
                            quantity: {
                                type: SchemaType.NUMBER,
                                description: 'Quantity purchased',
                            },
                            tags: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.INTEGER },
                                description: 'Array of tag IDs from the provided list',
                            },
                        },
                        required: ['item_id', 'price', 'quantity'],
                    },
                    description: 'Array of expense items identified in the image',
                },
                new_brands: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            id: { type: SchemaType.INTEGER, description: 'Negative ID for new brand' },
                            name: { type: SchemaType.STRING, description: 'Brand name' },
                        },
                        required: ['id', 'name'],
                    },
                    description: 'New brands to create (use negative IDs)',
                },
                new_categories: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            id: { type: SchemaType.INTEGER, description: 'Negative ID for new category' },
                            name: { type: SchemaType.STRING, description: 'Category name' },
                        },
                        required: ['id', 'name'],
                    },
                    description: 'New categories to create (use negative IDs)',
                },
                new_items: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            id: { type: SchemaType.INTEGER, description: 'Negative ID for new item' },
                            name: { type: SchemaType.STRING, description: 'Item name' },
                            category_id: { type: SchemaType.INTEGER, description: 'Category ID (can be negative if new)' },
                            unit_id: { type: SchemaType.INTEGER, description: 'Unit ID (can be negative if new)' },
                        },
                        required: ['id', 'name', 'category_id', 'unit_id'],
                    },
                    description: 'New items to create (use negative IDs)',
                },
                new_units: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            id: { type: SchemaType.INTEGER, description: 'Negative ID for new unit' },
                            name: { type: SchemaType.STRING, description: "Unit name (e.g., 'piece', 'kg', 'liter')" },
                        },
                        required: ['id', 'name'],
                    },
                    description: 'New units to create (use negative IDs)',
                },
                new_stores: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            id: { type: SchemaType.INTEGER, description: 'Negative ID for new store' },
                            name: { type: SchemaType.STRING, description: 'Store name' },
                        },
                        required: ['id', 'name'],
                    },
                    description: 'New stores to create (use negative IDs)',
                },
            },
            required: ['expenses'],
        },
    },
];

export const gemini: GenerativeModel = AI.getGenerativeModel({
    model: GEMINI_MODEL,
    tools: [{ functionDeclarations: expense_prediction_functions }],
});

export const expense_prediction_prompt = (
    brands: Tables<'brands'>[] | null,
    categories: Tables<'categories'>[] | null,
    items: Tables<'items'>[] | null,
    units: Tables<'units'>[] | null,
    vendors: Tables<'stores'>[] | null,
    expenses: Tables<'latest_purchases'>[] | null,
    tags: Tables<'tags'>[] | null,
): string => {
    return `Analyze this receipt or shopping list image and predict the expenses using the predict_expenses function.

CONTEXT DATA:
- Existing brands: ${JSON.stringify(brands)}
- Existing categories: ${JSON.stringify(categories)}
- Existing items: ${JSON.stringify(items)}
- Existing units: ${JSON.stringify(units)}
- Existing stores: ${JSON.stringify(vendors)}
- Existing tags: ${JSON.stringify(tags)}
- Recent purchases: ${JSON.stringify(expenses)}

INSTRUCTIONS:
1. Identify all items in the image (receipts, shopping lists, etc.)
2. Match items to existing database entries when possible
3. For new items that don't exist, create them with negative IDs
4. Always create required categories/units for new items
5. Use the same language as shown in the image
6. If you recognize the store, set the store_id
7. Extract prices and quantities accurately
8. Use recent purchase history to inform your predictions

Call the predict_expenses function with the identified items and any new database entries needed.`;
};

export type MimeType = typeof AI_ACCEPTED_IMAGE_TYPES[number];
