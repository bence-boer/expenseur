import { supabase } from "../supabaseClient";

export async function load() {
    const { data, error } = await supabase
        .from('units')
        .select('*');

    if (error) throw error;
    return { units: data };
}
