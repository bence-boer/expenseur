import type { PageLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { form_schema } from "./form-schema";
import { zod } from "sveltekit-superforms/adapters";
import { supabase } from "../../supabase-client";

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
        supabase.from('brands').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('stores').select('*'),
        supabase.from('units').select('*'),
        supabase.from('items').select('*'),
        superValidate(zod(form_schema))
    ]);

    return {
        brands: brands.data,
        categories: categories.data,
        stores: stores.data,
        units: units.data,
        items: items.data,
        data
    };
};