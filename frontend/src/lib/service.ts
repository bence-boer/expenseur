import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase-client";
import { memory_cache } from "./cache";
import type { FunctionName, FunctionParameters, FunctionReturns, QueryParameters, ServiceCache, Tables, Views } from "./types";
import type { CalendarDate } from "@internationalized/date";
import type { SpendingsInInterval } from "./DTO";
import { PUBLIC_API_URL } from '$env/static/public'

// import type { PostgrestSingleResponse } from '@supabase/supabase-js'

const cache: ServiceCache = memory_cache;
console.log('Using cache:', cache.name);


const user_promise: Promise<User> = supabase.auth.getUser().then(response => response.data.user!);


/*
const process_response = async <DATA>({ error, data }: PostgrestSingleResponse<DATA>, cache_key?: string): Promise<Exclude<DATA, null>> => {
    if (error) {
        console.error(error);
        return Promise.reject(error);
    }

    if (cache_key) cache.set(cache_key, data);
    return Promise.resolve(data!);
}

// Type '{ id: number; name: string; unit: string; category: string; }[] | { category: string; total: number; }[]' is not assignable to type 'FunctionReturns[Function]'
const sameShit1: PostgrestSingleResponse<FunctionReturns[FunctionName]>['data'] = undefined as unknown as PostgrestSingleResponse<FunctionReturns[FunctionName]>['data'];
const sameShit2: FunctionReturns[FunctionName] = undefined as unknown as FunctionReturns[FunctionName];

type wtf1 = Omit<typeof sameShit1, keyof typeof sameShit2>
type wtf2 = Omit<typeof sameShit2 | null, keyof typeof sameShit1>

const wtf1Obj: wtf1 = undefined as unknown as wtf1;
const wtf2Obj: wtf2 = undefined as unknown as wtf2;



const get_function = async <Function extends FunctionName>(key: Function, args: FunctionParameters[Function]): Promise<FunctionReturns[Function]> => {
    const cache_key = JSON.stringify([key, args]);
    const cached_data = cache.get<FunctionReturns[Function]>(cache_key);
    if (cached_data) return Promise.resolve(cached_data);

    const alma: FunctionReturns[Function] = null as unknown as FunctionReturns[Function];
    console.log(alma);
    

    return supabase
        .rpc(key, args)
        .then((response) => process_response(response, cache_key));
};
*/



const get_function = async <Function extends FunctionName>(key: Function, args: FunctionParameters[Function]): Promise<FunctionReturns[Function]> => {
    const cache_key = JSON.stringify([key, args]);
    const cached_data = cache.get<FunctionReturns[Function]>(cache_key);
    if (cached_data) return Promise.resolve(cached_data);

    return supabase
        .rpc(key, args)
        .then(({ data, error }: { data: unknown, error: unknown }) => {
            if (error) return Promise.reject(error);

            cache.set(cache_key, data);
            return Promise.resolve(data as FunctionReturns[Function]);
        });
};

const get_view = async <View extends keyof Views>(view: View, parameters: QueryParameters<typeof view>): Promise<Views[View]['Row'][]> => {
    const cache_key = JSON.stringify([view, parameters]);
    const cached_data = cache.get<Views[View]['Row'][]>(cache_key);
    if (cached_data) return Promise.resolve(cached_data);

    const user: User = await user_promise;
    let request = supabase
        .from(view)
        .select()
        .eq('user_id', user.id);

    if (parameters?.filter?.length) {
        for (const { by, value, min, max } of parameters.filter) {
            if (value) {
                request = request.eq(by, value);
                break;
            }
            if (min) request = request.gte(by, min);
            if (max) request = request.lte(by, max);
        }
    }

    if (parameters?.order?.length) {
        for (const { by, direction } of parameters.order) {
            request = request.order(by, { ascending: direction === 'ascending' });
        }
    };

    return request.then(({ data, error }: { data: unknown, error: unknown }) => {
        if (error) {
            console.error(error);
            return Promise.reject(error);
        }

        cache.set(cache_key, data);
        return Promise.resolve(data as Views[View]['Row'][]);
    });
}

const get_table = async <Table extends keyof Tables>(table: Table): Promise<Tables[Table]['Row'][]> => {
    const cache_key = table;
    const cached_data = cache.get<Tables[Table]['Row'][]>(cache_key);
    if (cached_data) return Promise.resolve(cached_data);

    const user: User = await user_promise;
    return supabase
        .from(table)
        .select()
        .eq('user_id', user?.id)
        .then(({ data, error }: { data: unknown, error: unknown }) => {
            if (error) {
                console.error(error);
                return Promise.reject(error);
            }

            cache.set(cache_key, data);
            return Promise.resolve(data as Tables[Table]['Row'][]);
        });
};

const create_single = async <Table extends keyof Tables>(
    table: Table,
    data: Tables[Table]['Insert']
): Promise<Tables[Table]['Row']> => {
    const cache_key = table;

    return supabase
        .from(table)
        .insert(data as never)
        .select()
        .single()
        .then(({ data, error }: { data: unknown, error: unknown }) => {
            if (error) {
                console.error(error);
                return Promise.reject(error);
            }

            cache.clear(cache_key);
            return Promise.resolve(data as Tables[Table]['Row']);
        });
}

const create_multiple = async <Table extends keyof Tables>(
    table: Table,
    data: Tables[Table]['Insert'][]
): Promise<Tables[Table]['Row'][]> => {
    return supabase
        .from(table)
        .insert(data as never)
        .select('*')
        .then(({ data, error }: { data: unknown, error: unknown }) => {
            if (error) {
                console.error(error);
                return Promise.reject(error);
            }

            cache.clear(table);
            return Promise.resolve(data as Tables[Table]['Row'][]);
        });
}

const delete_single = async <Table extends keyof Tables>(
    table: Table,
    id: number
) => {
    return supabase
        .from(table)
        .delete()
        .eq('id', id)
        .then(({ error }: { error: unknown }) => {
            if (error) {
                console.error(error);
                return Promise.reject(error);
            }

            cache.clear(table);
            return Promise.resolve();
        });
}

/** SERVICE FUNCTIONS */
export const get_item_details = async (item_id: FunctionParameters['item_details']['item_id']): Promise<FunctionReturns['item_details'][number]> => {
    return get_function('item_details', { item_id }).then(data => data[0]);
}

export const get_spendings_by_category = async (start_date: string, end_date: string): Promise<FunctionReturns['spendings_by_category']> => {
    return get_function('spendings_by_category', { start_date, end_date });
}

export const get_spendings_by_category_interval = async (start_date: string, end_date: string, days_interval: number): Promise<SpendingsInInterval> => {
    return get_function('spendings_by_category_interval', { start_date, end_date, days_interval }) as Promise<SpendingsInInterval>;
}

export const get_brands = async (): Promise<Tables['brands']['Row'][]> => {
    return get_table('brands');
}

export const get_categories = async (): Promise<Tables['categories']['Row'][]> => {
    return get_table('categories');
}

export const get_stores = async (): Promise<Tables['stores']['Row'][]> => {
    return get_table('stores');
}

export const get_units = async (): Promise<Tables['units']['Row'][]> => {
    return get_table('units');
}

export const get_items = async (): Promise<Tables['items']['Row'][]> => {
    return get_table('items');
}

export const create_purchases = async (purchases: Tables['purchases']['Insert'][]): Promise<Tables['purchases']['Row'][]> => {
    return create_multiple('purchases', purchases);
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

export const delete_purchase = async (purchase_id: number) => {
    return delete_single('purchases', purchase_id);
}

export const get_detailed_purchases = async (start_date: CalendarDate, end_date: CalendarDate): Promise<Views['all_tables_view']['Row'][]> => {
    return get_view('all_tables_view', {
        filter: [{ by: 'date', min: start_date.toString(), max: end_date.toString() }],
        order: [{ by: 'date', direction: 'descending' }]
    });
}
