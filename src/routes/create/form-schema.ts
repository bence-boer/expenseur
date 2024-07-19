import { z } from "zod";

export const form_schema = z.object({
    date: z.string().refine((v) => v, { message: "Purchase date is required." }),
    store: z.string().min(2).max(20)
});

export type FormSchema = typeof form_schema;