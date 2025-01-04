import type { PostgrestError } from "@supabase/supabase-js";

export type Environment = {
    PUBLIC_SUPABASE_URL: string;
    PUBLIC_SUPABASE_ANON_KEY: string;
    GEMINI_API_KEY: string;
};

export type Empty = Record<string | number | symbol, never>;

export type GeminiModel =
    | 'gemini-1.5-pro'
    | 'gemini-1.5-flash'
    | 'gemini-1.5-flash-8b'
    | 'gemini-2.0-flash-exp'
    | 'gemini-exp-1206'
    | 'gemini-2.0-flash-thinking-exp-01-21'
    | 'learnlm-1.5-pro-experimental'
    | 'gemma-2-2b-it'
    | 'gemma-2-9b-it'
    | 'gemma-2-27b-it'