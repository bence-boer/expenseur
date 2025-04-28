import { z } from 'zod';

export const user_validator = z.object({
    email: z.string(),
    password: z.string(),
});

export const session_validator = z.object({
    refresh_token: z.string(),
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
    days_interval: z.coerce.number().int().positive(),
});

export const name_validator = z.object({
    name: z.string(),
});

export const category_validator = name_validator.extend({
    color: z.string().optional(),
});

export const tag_validator = name_validator.extend({
    color: z.string(),
});

export const item_validator = name_validator.extend({
    category_id: z.coerce.number().int(),
    unit_id: z.coerce.number().int(),
});

export const id_validator = z.object({
    id: z.coerce.number().int().positive(),
});

export const expense_validator = z.object({
    brand_id: z.coerce.number().int().optional().nullish(),
    date: z.string().date(),
    details: z.string().array().optional().nullish(),
    item_id: z.coerce.number().int(),
    price: z.coerce.number(),
    quantity: z.coerce.number(),
    store_id: z.coerce.number().int(),
    tag_ids: z.array(z.coerce.number().int()).optional().nullish(),
});

const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const AVATAR_ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const avatar_upload_validator = z.object({
    avatar: z
        .instanceof(File)
        .refine((file) => file?.size <= MAX_AVATAR_FILE_SIZE, `Max image size is 5MB.`)
        .refine(
            (file) => AVATAR_ACCEPTED_IMAGE_TYPES.includes(file?.type),
            'Only .jpg, .png and .webp images are accepted.',
        ),
});

export const AI_ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'] as const;
type AIMimeType = typeof AI_ACCEPTED_IMAGE_TYPES[number];
export const ai_images_form_validator = z.object({
    // images: z.array(
    image: z
        .instanceof(File, { message: 'Each item must be a file.' })
        .refine((file) => file?.size <= MAX_AVATAR_FILE_SIZE, `Max image size is 5MB.`)
        .refine(
            (file) => AI_ACCEPTED_IMAGE_TYPES.includes(file?.type as AIMimeType),
            'Only .jpg, .png, .webp, .heic and .heif images are accepted.',
        ),
    // )
    //     .min(1, { message: 'At least one image is required.' })
    //     .max(5, { message: 'Maximum 5 images allowed.' }),
});

export const ai_expense_prediction_schema = z.object({
    date: z.string().nullish(),

    store_id: z.number().int().nullish(),

    expenses: z.object({
        brand_id: z.number().int().nullish(),
        details: z.string().array().nullish(),
        item_id: z.number().int().nullish(),
        price: z.number().nullish(),
        quantity: z.number().nullish(),
        tags: z.array(z.number().int()).nullish(),
    }).array().nullish(),

    brands: z.object({
        id: z.number().int(),
        name: z.string(),
    }).array(),

    categories: z.object({
        id: z.number().int(),
        name: z.string(),
    }).array(),

    items: z.object({
        id: z.number().int(),
        name: z.string(),
        category_id: z.number().int(),
        unit_id: z.number().int(),
    }).array(),

    units: z.object({
        id: z.number().int(),
        name: z.string(),
    }).array(),

    stores: z.object({
        id: z.number().int(),
        name: z.string(),
    }).array(),
});
