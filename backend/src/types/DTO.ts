import type { Tables, TablesInsert } from '../../supabase/types.ts';

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
