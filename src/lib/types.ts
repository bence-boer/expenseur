import type { Database } from "../types/supabase";

export type Tables = Database['public']['Tables'];

export type Functions = Database['public']['Functions'];
export type FunctionName = keyof Functions;
export type FunctionParameters = { [K in keyof Functions]: Database['public']['Functions'][K]['Args'] };
export type FunctionReturns = { [K in keyof Functions]: Database['public']['Functions'][K]['Returns'] };

export type LabelValue = { label: string; value: string | number };

export type Route = {
    name: string;
    path: string;
}