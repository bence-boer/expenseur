import { client } from '$lib/service/utils.ts';
import type { Brand, Category, IntervalQuery, Item, PeriodQuery, Purchase, Unit, Vendor } from './_manual-types.ts';

// ITEMS
export const get_item_details = (id: string) => client.api.items[':id'].$get({ param: { id } });
export const get_items = () => client.api.items.$get(undefined);
export const create_item = (item: Item) => client.api.items.$post({ json: item });
export const update_item = (id: string, item: Partial<Item>) => client.api.items[':id'].$patch({ param: { id }, json: item } as any);
export const delete_item = (id: string) => client.api.items[':id'].$delete({ param: { id } });

// SPENDINGS
export const get_spendings_by_category = (query: PeriodQuery) => client.api.spendings.categorized.$get({ query });
export const get_spendings_by_category_interval = (query: IntervalQuery) => client.api.spendings.categorized.intervalled.$get({ query });

// BRANDS
export const get_brands = () => client.api.brands.$get(undefined);
export const create_brand = (brand: Brand) => client.api.brands.$post({ json: brand });
export const update_brand = (id: string, brand: Partial<Brand>) => client.api.brands[':id'].$patch({ param: { id }, json: brand } as any);
export const delete_brand = (id: string) => client.api.brands[':id'].$delete({ param: { id } });

// CATEGORIES
export const get_categories = () => client.api.categories.$get();
export const create_category = (category: Category) => client.api.categories.$post({ json: category });
export const update_category = (id: string, category: Partial<Category>) => client.api.categories[':id'].$patch({ param: { id }, json: category } as any);
export const delete_category = (id: string) => client.api.categories[':id'].$delete({ param: { id } });

// TAGS
export const get_tags = () => client.api.tags.$get();
export const create_tag = (tag: { name: string; color: string }) => client.api.tags.$post({ json: tag });
export const update_tag = (id: string, tag: Partial<{ name: string; color: string }>) => client.api.tags[':id'].$patch({ param: { id }, json: tag } as any);
export const delete_tag = (id: string) => client.api.tags[':id'].$delete({ param: { id } });

// VENDORS
export const get_vendors = () => client.api.vendors.$get();
export const create_vendor = (vendor: Vendor) => client.api.vendors.$post({ json: vendor });
export const update_vendor = (id: string, vendor: Partial<Vendor>) => client.api.vendors[':id'].$patch({ param: { id }, json: vendor } as any);
export const delete_vendor = (id: string) => client.api.vendors[':id'].$delete({ param: { id } });

// UNITS
export const get_units = () => client.api.units.$get();
export const create_unit = (unit: Unit) => client.api.units.$post({ json: unit });
export const update_unit = (id: string, unit: Partial<Unit>) => client.api.units[':id'].$patch({ param: { id }, json: unit } as any);

// PURCHASES
export const get_purchases = (query: PeriodQuery) => client.api.purchases.$get({ query });
export const create_purchases = (purchases: Purchase[]) => client.api.purchases.$post({ json: purchases });
export const update_purchase = (id: string, purchase: Partial<Purchase>) => client.api.purchases[':id'].$patch({ param: { id }, json: purchase } as any);
export const delete_purchase = (id: string) => client.api.purchases[':id'].$delete({ param: { id } });

// AI SUGGESTIONS
export const get_ai_suggestions = (images: File[]) => client.api.ai.suggest_items.$post({ form: { image: images[0] } });

// PROFILE
export const get_profile_data = () => client.api.profile.$get();
export const get_avatar_url = () => client.api.profile.avatar.$get();
export const upload_avatar = (avatar_file: File) => client.api.profile.avatar.$put({ form: { avatar: avatar_file } });
export const delete_avatar = () => client.api.profile.avatar.$delete();
