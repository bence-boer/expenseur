import type { PageLoad } from "./$types";
import { supabase } from "../../supabase-client";
import { goto } from "$app/navigation";

export const load: PageLoad = async () => {
    if (supabase.auth.getSession() === null) {
        goto('/login');
        return {};
    }

    const data = supabase.from('all_tables_view').select('*').order('date', { ascending: false });

    return { purchases: (await data).data };
};