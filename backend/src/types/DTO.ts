import type z from 'zod';
import type { Tables, TablesInsert } from '../../supabase/types.ts';
import type { ai_purchase_prediction_schema } from '../utils/validators.ts';

export type SpendingsInInterval = {
    dates: string[];
    data: {
        category: string;
        color: string;
        values: number[];
    }[];
};

export type PurchaseCreatePayload = TablesInsert<'purchases'>[];
export type PurchaseResponse = Tables<'all_tables_view'>[];

export type PredictedPurchase = z.infer<typeof ai_purchase_prediction_schema>;
