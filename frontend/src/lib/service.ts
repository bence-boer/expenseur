import { PUBLIC_API_URL } from '$env/static/public';
import { ClientResponse, hc, InferRequestType, InferResponseType } from 'hono/client';
import type { API } from '@expenseur/backend';
import { ServiceCache } from './types.ts';

const client = hc<API>(PUBLIC_API_URL, {});

const cache: ServiceCache = memory_cache;
console.log('Using cache:', cache.name);

// TODO: Implement getting user info

const extract_data = <Data>(response: ClientResponse<Data>): Promise<Data> =>
    response.ok
        ? response.json() as Promise<Data>
        : Promise.reject(new Error(response.statusText));

/* SERVICE FUNCTIONS */
//-------------------------------------------------------------------------------------

const $get_item_details = client.api.items[':id'].$get;
export type ItemDetails = InferResponseType<typeof $get_item_details>;
export type ItemDetailsParam = InferRequestType<typeof $get_item_details>['param'];

export const get_item_details =
    (param: ItemDetailsParam): Promise<ItemDetails> =>
        $get_item_details({ param }).then(extract_data);

//-------------------------------------------------------------------------------------

const $get_spendings_by_category = client.api.spendings.categorized.$get;
export type SpendingsByCategory = InferResponseType<typeof $get_spendings_by_category>;
export type SpendingsByCategoryParam = InferRequestType<typeof $get_spendings_by_category>

export const get_spendings_by_category =
    (param: SpendingsByCategoryParam): Promise<SpendingsByCategory> =>
        $get_spendings_by_category({ param }).then(extract_data);

//-------------------------------------------------------------------------------------

const $get_spendings_by_category_interval = client.api.spendings.categorized.intervalled.$get;
export type SpendingsByCategoryInterval = InferResponseType<typeof $get_spendings_by_category_interval>;
export type SpendingsByCategoryIntervalParam = InferRequestType<typeof $get_spendings_by_category_interval>;

export const get_spendings_by_category_interval =
    (param: SpendingsByCategoryIntervalParam): Promise<SpendingsByCategoryInterval> =>
        $get_spendings_by_category_interval({ param }).then(extract_data);

//-------------------------------------------------------------------------------------

const $get_brands = client.api.brands.$get;
export type Brands = InferResponseType<typeof $get_brands>;

export const get_brands = (): Promise<Brands> =>
    $get_brands().then(extract_data);

//-------------------------------------------------------------------------------------

const $get_categories = client.api.categories.$get;
export type Categories = InferResponseType<typeof $get_categories>;

export const get_categories = (): Promise<Categories> =>
    $get_categories().then(extract_data);

//-------------------------------------------------------------------------------------

const $get_vendors = client.api.vendors.$get;
export type Vendors = InferResponseType<typeof $get_vendors>;

export const get_vendors = (): Promise<Vendors> =>
    $get_vendors().then(extract_data);

//-------------------------------------------------------------------------------------

const $get_units = client.api.units.$get;
export type Units = InferResponseType<typeof $get_units>;

export const get_units = (): Promise<Units> =>
    $get_units().then(extract_data);

//-------------------------------------------------------------------------------------

const $get_items = client.api.items.$get;
export type Items = InferResponseType<typeof $get_items>;

export const get_items = (): Promise<Items> =>
    $get_items().then(extract_data);

//-------------------------------------------------------------------------------------

const $create_purchases = client.api.purchases.$post;
export type CreatePurchases = InferResponseType<typeof $create_purchases>;
export type CreatePurchasesPayload = InferRequestType<typeof $create_purchases>;

export const create_purchases =
    (payload: CreatePurchasesPayload): Promise<CreatePurchases> =>
        $create_purchases({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------

const $create_item = client.api.items.$post;
export type CreateItem = InferResponseType<typeof $create_item>;
export type CreateItemPayload = InferRequestType<typeof $create_item>;

export const create_item =
    (payload: CreateItemPayload): Promise<CreateItem> =>
        $create_item({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------

const $create_vendor = client.api.vendors.$post;
export type CreateVendor = InferResponseType<typeof $create_vendor>;
export type CreateVendorPayload = InferRequestType<typeof $create_vendor>;

export const create_vendor =
    (payload: CreateVendorPayload): Promise<CreateVendor> =>
        $create_vendor({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------

const $create_brand = client.api.brands.$post;
export type CreateBrand = InferResponseType<typeof $create_brand>;
export type CreateBrandPayload = InferRequestType<typeof $create_brand>;

export const create_brand =
    (payload: CreateBrandPayload): Promise<CreateBrand> =>
        $create_brand({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------

const $create_category = client.api.categories.$post;
export type CreateCategory = InferResponseType<typeof $create_category>;
export type CreateCategoryPayload = InferRequestType<typeof $create_category>;

export const create_category =
    (payload: CreateCategoryPayload): Promise<CreateCategory> =>
        $create_category({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------

const $create_unit = client.api.units.$post;
export type CreateUnit = InferResponseType<typeof $create_unit>;
export type CreateUnitPayload = InferRequestType<typeof $create_unit>;

export const create_unit =
    (payload: CreateUnitPayload): Promise<CreateUnit> =>
        $create_unit({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------

const $delete_purchase = client.api.purchases[':id'].$delete;
export type DeletePurchase = InferResponseType<typeof $delete_purchase>;
export type DeletePurchaseParam = InferRequestType<typeof $delete_purchase>['param'];

export const delete_purchase =
    (param: DeletePurchaseParam): Promise<DeletePurchase> =>
        $delete_purchase({ param }).then(extract_data);

//-------------------------------------------------------------------------------------

const $get_purchases = client.api.purchases.$get;
export type Purchase = InferResponseType<typeof $get_purchases>[number];
export type GetPurchasesParam = InferRequestType<typeof $get_purchases>;

export const get_purchases =
    (param: GetPurchasesParam): Promise<Purchase[]> =>
        $get_purchases({ param }).then(extract_data);
