import * as service from '$lib/service/service.ts';
import * as auth from '$lib/service/auth.ts';

export type Session = Awaited<ReturnType<typeof auth.session>>;
export type LoginResponse = Awaited<ReturnType<typeof auth.login>>;
export type RegisterResponse = Awaited<ReturnType<typeof auth.register>>;

export type ItemDetails = Awaited<ReturnType<typeof service.get_item_details>>;
export type Item = Awaited<ReturnType<typeof service.get_items>>[number];
export type CreateItemResponse = Awaited<ReturnType<typeof service.create_item>>;
export type CreateItemPayload = Parameters<typeof service.create_item>[0];
export type UpdatedItem = Awaited<ReturnType<typeof service.update_item>>;
export type UpdateItemPayload = Parameters<typeof service.update_item>[0];
export type DeleteItem = Awaited<ReturnType<typeof service.delete_item>>;
export type DeleteItemParam = Parameters<typeof service.delete_item>[0];

export type SpendingsByCategory = Awaited<ReturnType<typeof service.get_spendings_by_category>>[number];
export type SpendingsByCategoryInterval = Awaited<ReturnType<typeof service.get_spendings_by_category_interval>>;

export type Brand = Awaited<ReturnType<typeof service.get_brands>>[number];
export type CreateBrandResponse = Awaited<ReturnType<typeof service.create_brand>>;
export type CreateBrandPayload = Parameters<typeof service.create_brand>[0];
export type UpdatedBrand = Awaited<ReturnType<typeof service.update_brand>>;
export type UpdateBrandPayload = Parameters<typeof service.update_brand>[0];
export type DeleteBrand = Awaited<ReturnType<typeof service.delete_brand>>;
export type DeleteBrandParam = Parameters<typeof service.delete_brand>[0];

export type Category = Awaited<ReturnType<typeof service.get_categories>>[number];
export type CreateCategory = Awaited<ReturnType<typeof service.create_category>>;
export type CreateCategoryPayload = Parameters<typeof service.create_category>[0];
export type UpdatedCategory = Awaited<ReturnType<typeof service.update_category>>;
export type UpdateCategoryPayload = Parameters<typeof service.update_category>[0];
export type DeleteCategory = Awaited<ReturnType<typeof service.delete_category>>;
export type DeleteCategoryParam = Parameters<typeof service.delete_category>[0];

export type Vendor = Awaited<ReturnType<typeof service.get_vendors>>[number];
export type CreateVendorResponse = Awaited<ReturnType<typeof service.create_vendor>>;
export type CreateVendorPayload = Parameters<typeof service.create_vendor>[0];
export type UpdatedVendor = Awaited<ReturnType<typeof service.update_vendor>>;
export type UpdateVendorPayload = Parameters<typeof service.update_vendor>[0];
export type DeleteVendor = Awaited<ReturnType<typeof service.delete_vendor>>;
export type DeleteVendorParam = Parameters<typeof service.delete_vendor>[0];

export type Unit = Awaited<ReturnType<typeof service.get_units>>[number];
export type CreatedUnit = Awaited<ReturnType<typeof service.create_unit>>;
export type CreateUnitPayload = Parameters<typeof service.create_unit>[0];
export type UpdatedUnit = Awaited<ReturnType<typeof service.update_unit>>;
export type UpdateUnitPayload = Parameters<typeof service.update_unit>[0];

export type Purchase = Awaited<ReturnType<typeof service.get_purchases>>[number];
export type GetPurchasesParam = Parameters<typeof service.get_purchases>[0];
export type CreatedPurchase = Awaited<ReturnType<typeof service.create_purchases>>[number];
export type CreatePurchasesPayload = Parameters<typeof service.create_purchases>[0];
export type DeletedPurchase = Awaited<ReturnType<typeof service.delete_purchase>>;
export type DeletePurchaseParam = Parameters<typeof service.delete_purchase>[0];

export type AISuggestion = Awaited<ReturnType<typeof service.get_ai_suggestions>>;
export type AISuggestionPayload = Parameters<typeof service.get_ai_suggestions>[0];
