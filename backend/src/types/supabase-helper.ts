import type { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "../../supabase/types.ts";

export type Functions = Database['public']['Functions'];
export type FunctionName = keyof Functions;
export type FunctionParameters = { [K in keyof Functions]: Database['public']['Functions'][K]['Args'] };
export type FunctionReturns = { [K in keyof Functions]: Database['public']['Functions'][K]['Returns'] };

export type Route = {
    name: string;
    path: string;
}

export type SupabaseResponse<DATA = unknown, ERROR = PostgrestError | null> =
    {
        data: DATA;
        error: null;
    } | {
        data: null;
        error: ERROR;
    };