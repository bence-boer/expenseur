import { ServiceTypes } from '$lib/service/index.ts';

export type ExpenseGroup = {
    date: string;
    total: number;
    expenses: ServiceTypes.Expense[];
};
