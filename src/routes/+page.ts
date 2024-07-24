import * as service from "$lib/service";
import { supabase } from "../supabase-client";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
    if (supabase.auth.getSession() === null) return {};

    const today: string = new Date().toISOString().split('T')[0];
    // const one_month_ago: string = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
    const one_year_ago: string = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];

    const [
        spendings_by_category
    ] = await Promise.all([
        service.get_spendings_by_category(one_year_ago, today)
    ]);

    return { spendings_by_category };
};