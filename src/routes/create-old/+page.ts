import type { PageLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { form_schema } from "./form-schema";
import { zod } from "sveltekit-superforms/adapters";
import { supabase } from "../../supabase-client";
import * as service from "$lib/service";

export const load: PageLoad = async () => {
    if (supabase.auth.getSession() === null) return {};

    const [
        brands,
        categories,
        stores,
        units,
        items,
        data
    ] = await Promise.all([
        service.get_brands(),
        service.get_categories(),
        service.get_stores(),
        service.get_units(),
        service.get_items(),
        superValidate(zod(form_schema))
    ]);

    return {
        brands: brands,
        categories: categories,
        stores: stores,
        units: units,
        items: items,
        data
    };
};