import * as service from "$lib/service";
import { supabase } from "../../supabase-client";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
    if (supabase.auth.getSession() === null) return {};

    const [
        brands,
        categories,
        stores,
        units,
        items,
    ] = await Promise.all([
        service.get_brands(),
        service.get_categories(),
        service.get_stores(),
        service.get_units(),
        service.get_items(),
    ]);

    return { brands, categories, stores, units, items };
};