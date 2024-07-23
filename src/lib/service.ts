import { supabase } from "../supabase-client";
import type { FunctionName, FunctionParameters, FunctionReturns, Tables } from "./types";

const cache: Map<string, unknown> = new Map();

const get_function = async <Function extends FunctionName>(key: Function, args: FunctionParameters[Function]): Promise<FunctionReturns[Function]> => {
    const cache_key = JSON.stringify([key, args]);
    if (cache.has(cache_key)) return cache.get(cache_key) as FunctionReturns[Function];

    return supabase
        .rpc(key, args)
        .then(({ data, error }: { data: unknown, error: unknown }) => {
            if (error) return Promise.reject(error);

            cache.set(cache_key, data);
            return Promise.resolve(data as FunctionReturns[Function]);
        });
};

const get_table = async <Table extends keyof Tables>(table: Table): Promise<Tables[Table]['Row'][]> => {
    return supabase
        .from(table)
        .select('*')
        .then(({ data, error }: { data: unknown, error: unknown }) => {
            if (error) return Promise.reject(error);

            return Promise.resolve(data as Tables[Table]['Row'][]);
        });
};

const create_single = async <Table extends keyof Tables>(
    table: Table,
    data: Tables[Table]['Insert']
): Promise<Tables[Table]['Row']> => {
    return supabase
        .from(table)
        .insert(data as never)
        .select('*')
        .single()
        .then(({ data, error }: { data: unknown, error: unknown }) => {
            if (error) return Promise.reject(error);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cache_key = JSON.stringify([table, (data as any).id]);
            cache.set(cache_key, data);
            return Promise.resolve(data as Tables[Table]['Row']);
        });
}

/** SERVICE FUNCTIONS */
export const get_item_details = async (item_id: FunctionParameters['item_details']['item_id']): Promise<FunctionReturns['item_details'][number]> => {
    return get_function('item_details', { item_id }).then(data => data[0]);
}

export const get_items = async (): Promise<Tables['items']['Row'][]> => {
    return get_table('items');
}

export const get_stores = async (): Promise<Tables['stores']['Row'][]> => {
    return get_table('stores');
}

export const get_units = async (): Promise<Tables['units']['Row'][]> => {
    return get_table('units');
}

export const get_categories = async (): Promise<Tables['categories']['Row'][]> => {
    return get_table('categories');
}

export const create_item = async (item: Tables['items']['Insert']): Promise<Tables['items']['Row']> => {
    return create_single('items', item);
}

export const create_store = async (store_name: string): Promise<Tables['stores']['Row']> => {
    return create_single('stores', { name: store_name });
}

export const create_brand = async (brand_name: string): Promise<Tables['brands']['Row']> => {
    return create_single('brands', { name: brand_name });
}

export const create_category = async (category_name: string): Promise<Tables['categories']['Row']> => {
    return create_single('categories', { name: category_name });
}

export const create_unit = async (unit_name: string): Promise<Tables['units']['Row']> => {
    return create_single('units', { name: unit_name });
}