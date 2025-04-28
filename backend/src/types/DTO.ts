import type z from 'zod';
import type { Tables, TablesInsert } from '../../supabase/types.ts';
import type { ai_expense_prediction_schema } from '../utils/validators.ts';

export type SpendingsInInterval = {
    dates: string[];
    data: {
        category: string;
        color: string;
        values: number[];
    }[];
};

export type ExpenseCreatePayload = TablesInsert<'expenses'>[];
export type ExpenseResponse = Tables<'all_tables_view'>[];

export type PredictedExpense = z.infer<typeof ai_expense_prediction_schema>;
