import { type GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiModel } from '../types/local.ts';
import type { Tables } from '../../supabase/types.ts';
import type { ai_allowed_image_types } from './validators.ts';

const GEMINI_API_KEY: string = Deno.env.get('GEMINI_API_KEY')!;
const GEMINI_MODEL: GeminiModel = Deno.env.get('GEMINI_MODEL') as GeminiModel;

const AI: GoogleGenerativeAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const gemini: GenerativeModel = AI.getGenerativeModel({ model: GEMINI_MODEL });

export const prompt = (
    brands: Tables<'brands'>[] | null,
    categories: Tables<'categories'>[] | null,
    items: Tables<'items'>[] | null,
    units: Tables<'units'>[] | null,
    vendors: Tables<'stores'>[] | null,
    purchases: Tables<'latest_purchases'>[] | null,
    tags: Tables<'tags'>[] | null,
): string => {
    return `The image is a list of purchases. The items on the list are sometimes abbreviated. The following text contains the user's database elements. Predict the list of purchase items. If a purhcase seems to have been made already in the past, include it the same way as the user. Otherwise, look through the brands, categories, items, units, vendors and tags to predict the purchase. If you create any new database elements, include their id as negative numbers, and list the new elements in their respective arrays. For existing databse elements, DO NOT include them in their respective arrays.
A response should be a JSON object in plain text in the following format, and nothing else, except for the JSON object itself:
{date?:string,store_id?:number,purchases:{brand_id?:number,details?:string[],item_id?:number,price?:number,quantity?:number}[],brands:{id:number,name:string}[],categories:{id:number,name:string}[],items:{id:number,name:string,category_id:number,unit_id:number}[],units:{id:number,name:string}[],stores:{id:number,name:string}[],tags:{id:number,name:string,color:string}[]}
data:
brands:${JSON.stringify(brands)},
categories:${JSON.stringify(categories)},
items:${JSON.stringify(items)},
units:${JSON.stringify(units)},
vendors:${JSON.stringify(vendors)},
tags:${JSON.stringify(tags)},
latest_purchases:${JSON.stringify(purchases)}`;
};

export type MimeType = typeof ai_allowed_image_types[number];
