import type { InferRequestType, InferResponseType } from 'hono/client';
// import { ServiceCache } from "$lib/types";
import { type Client, get_client } from '$lib/service/client.ts';
import { extract_data } from '$lib/service/utils.ts';

const client: Client = get_client();

// const cache: ServiceCache = memory_cache;
// console.log('Using cache:', cache.name);

// TODO: helyette clientet wrapelni

/* SERVICE FUNCTIONS */
//-------------------------------------------------------------------------------------

const $get_item_details = client.api.items[':id'].$get;
export type ItemDetails = InferResponseType<typeof $get_item_details, 200>;
export type ItemDetailsParam = InferRequestType<typeof $get_item_details>['param'];

export const get_item_details = (param: ItemDetailsParam): Promise<ItemDetails> => $get_item_details({ param }).then(extract_data);

//-------------------------------------------------------------------------------------

const $get_spendings_by_category = client.api.spendings.categorized.$get;
export type SpendingsByCategory = InferResponseType<typeof $get_spendings_by_category, 200>[number];
export type SpendingsByCategoryParams = InferRequestType<typeof $get_spendings_by_category>;

export const get_spendings_by_category = (query: SpendingsByCategoryParams): Promise<SpendingsByCategory[]> => $get_spendings_by_category({ query }).then(extract_data);

//-------------------------------------------------------------------------------------

const $get_spendings_by_category_interval = client.api.spendings.categorized.intervalled.$get;
export type SpendingsByCategoryInterval = InferResponseType<typeof $get_spendings_by_category_interval, 200>;
export type SpendingsByCategoryIntervalParam = InferRequestType<typeof $get_spendings_by_category_interval>;

export const get_spendings_by_category_interval = (query: SpendingsByCategoryIntervalParam): Promise<SpendingsByCategoryInterval> => $get_spendings_by_category_interval({ query }).then(extract_data);

//-------------------------------------------------------------------------------------

const $get_brands = client.api.brands.$get;
export type Brand = InferResponseType<typeof $get_brands, 200>[number];

export const get_brands = (): Promise<Brand[]> => $get_brands().then(extract_data);

//-------------------------------------------------------------------------------------

const $get_categories = client.api.categories.$get;
export type Category = InferResponseType<typeof $get_categories>[number];

export const get_categories = (): Promise<Category[]> => $get_categories().then(extract_data);

//-------------------------------------------------------------------------------------

const $get_vendors = client.api.vendors.$get;
export type Vendor = InferResponseType<typeof $get_vendors>[number];

export const get_vendors = (): Promise<Vendor[]> => $get_vendors().then(extract_data);

//-------------------------------------------------------------------------------------

const $get_units = client.api.units.$get;
export type Unit = InferResponseType<typeof $get_units>[number];

export const get_units = (): Promise<Unit[]> => $get_units().then(extract_data);

//-------------------------------------------------------------------------------------

const $get_items = client.api.items.$get;
export type Item = InferResponseType<typeof $get_items>[number];

export const get_items = (): Promise<Item[]> => $get_items().then(extract_data);

//-------------------------------------------------------------------------------------

const $create_purchases = client.api.purchases.$post;
export type CreatedPurchase = InferResponseType<typeof $create_purchases>[number];
export type CreatePurchasesPayload = InferRequestType<typeof $create_purchases>;

export const create_purchases = (payload: CreatePurchasesPayload): Promise<CreatedPurchase[]> => $create_purchases({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------

const $create_item = client.api.items.$post;
export type CreateItemResponse = InferResponseType<typeof $create_item>;
export type CreateItemPayload = InferRequestType<typeof $create_item>;

export const create_item = (payload: CreateItemPayload): Promise<CreateItemResponse> => $create_item({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------

const $create_vendor = client.api.vendors.$post;
export type CreateVendorResponse = InferResponseType<typeof $create_vendor>;
export type CreateVendorPayload = InferRequestType<typeof $create_vendor>;

export const create_vendor = (payload: CreateVendorPayload): Promise<CreateVendorResponse> => $create_vendor({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------

const $create_brand = client.api.brands.$post;
export type CreateBrandResponse = InferResponseType<typeof $create_brand>;
export type CreateBrandPayload = InferRequestType<typeof $create_brand>;

export const create_brand = (payload: CreateBrandPayload): Promise<CreateBrandResponse> => $create_brand({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------

const $create_category = client.api.categories.$post;
export type CreateCategory = InferResponseType<typeof $create_category>;
export type CreateCategoryPayload = InferRequestType<typeof $create_category>;

export const create_category = (payload: CreateCategoryPayload): Promise<CreateCategory> => $create_category({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------

const $create_unit = client.api.units.$post;
export type CreatedUnit = InferResponseType<typeof $create_unit>;
export type CreateUnitPayload = InferRequestType<typeof $create_unit>;

export const create_unit = (payload: CreateUnitPayload): Promise<CreatedUnit> => $create_unit({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------

const $delete_purchase = client.api.purchases[':id'].$delete;
export type DeletedPurchase = InferResponseType<typeof $delete_purchase>;
export type DeletePurchaseParam = InferRequestType<typeof $delete_purchase>['param'];

export const delete_purchase = (param: DeletePurchaseParam): Promise<DeletedPurchase> => $delete_purchase({ param }).then(extract_data);

//-------------------------------------------------------------------------------------

const $get_purchases = client.api.purchases.$get;
export type Purchase = InferResponseType<typeof $get_purchases>[number];
export type GetPurchasesParam = InferRequestType<typeof $get_purchases>;

export const get_purchases = (param: GetPurchasesParam): Promise<Purchase[]> => $get_purchases({ param }).then(extract_data);
