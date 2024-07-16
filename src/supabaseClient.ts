import { createClient } from "@supabase/supabase-js";
import type { Database } from './types/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private'

export const supabase = createClient<Database, 'public', Database['public']>(SUPABASE_URL, SUPABASE_ANON_KEY);