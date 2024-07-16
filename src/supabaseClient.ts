import { createClient } from "@supabase/supabase-js";
import type { Database } from './types/supabase';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

export const supabase = createClient<Database, 'public', Database['public']>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);