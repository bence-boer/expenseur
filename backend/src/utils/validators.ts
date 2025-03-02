import { z } from "zod";

export const user_validator = z.object({
    email: z.string(),
    password: z.string()
});

export const session_validator = z.object({
    refresh_token: z.string()
});

export const logout_validator = z.object({
    JWT: z.string()
});

export const delete_user_validator = z.object({
    id: z.string(),
    user_id: z.string(),
    provider_id: z.string(),
    provider: z.string(),
});

export const period_validator = z.object({
    start_date: z.string().date(),
    end_date: z.string().date(),
});

export const interval_validator = period_validator.extend({
    days_interval: z.number().int().positive()
});

export const name_validator = z.object({
    name: z.string(),
});

export const category_validator = name_validator.extend({
    color: z.string().optional()
});

export const item_validator = name_validator.extend({
    category_id: z.number().int(),
    price: z.number(),
});

export const id_validator = z.object({
    id: z.number().int().positive()
});

export const purchase_validator = z.object({
    brand_id: z.number().int().optional(),
    date: z.string().date(),
    details: z.string().array().optional(),
    item_id: z.number().int(),
    price: z.number(),
    quantity: z.number(),
    store_id: z.number().int(),
}).array();