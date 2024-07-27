import type { Database } from "../types/supabase";

export type Tables = Database['public']['Tables'];

export type Functions = Database['public']['Functions'];
export type FunctionName = keyof Functions;
export type FunctionParameters = { [K in keyof Functions]: Database['public']['Functions'][K]['Args'] };
export type FunctionReturns = { [K in keyof Functions]: Database['public']['Functions'][K]['Returns'] };

export type Views = Database['public']['Views'];

export type LabelValue = { label: string; value: string | number };

export type Route = {
    name: string;
    path: string;
}

export type ServiceCache = {
    name: string;
    get: <Data>(key: string) => Data | null;
    set: (key: string, data: unknown) => void;
    clear: (key?: string) => void;
}

export type QueryParameters<View extends keyof Views> = {
    order?: {
        by: keyof Views[View]['Row'] extends string ? keyof Views[View]['Row'] : never;
        direction: 'ascending' | 'descending';
    }[]
}