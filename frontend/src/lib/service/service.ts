import { client } from '$lib/service/utils.ts';
import type { Brand, Category, Expense, ExpenseFull, IntervalQuery, Item, PeriodQuery, Tag, Unit, UpdatedExpense, Vendor } from './_manual-types.ts';

// ITEMS
export const get_item_details = (id: string) => client.api.items[':id'].$get({ param: { id } });
export const get_items = () => client.api.items.$get(undefined);
export const create_item = (item: Item) => client.api.items.$post({ json: item });
export const update_item = (id: number, item: Partial<Item>) => client.api.items[':id'].$patch({ param: { id }, json: item } as any);
export const delete_item = (id: number) => client.api.items[':id'].$delete({ param: { id: String(id) } });

// BRANDS
export const get_brands = () => client.api.brands.$get(undefined);
export const create_brand = (brand: Brand) => client.api.brands.$post({ json: brand });
export const update_brand = (id: number, brand: Partial<Brand>) => client.api.brands[':id'].$patch({ param: { id }, json: brand } as any);
export const delete_brand = (id: number) => client.api.brands[':id'].$delete({ param: { id: String(id) } });

// CATEGORIES
export const get_categories = () => client.api.categories.$get();
export const create_category = (category: Category) => client.api.categories.$post({ json: category });
export const update_category = (id: number, category: Partial<Category>) => client.api.categories[':id'].$patch({ param: { id }, json: category } as any);
export const delete_category = (id: number) => client.api.categories[':id'].$delete({ param: { id: String(id) } });

// TAGS
export const get_tags = (): Promise<Tag[]> => client.api.tags.$get();
export const create_tag = (tag: { name: string; color: string }) => client.api.tags.$post({ json: tag });
export const update_tag = (id: number, tag: Partial<{ name: string; color: string }>) => client.api.tags[':id'].$patch({ param: { id }, json: tag } as any);
export const delete_tag = (id: number) => client.api.tags[':id'].$delete({ param: { id: String(id) } });

// VENDORS
export const get_vendors = () => client.api.vendors.$get();
export const create_vendor = (vendor: Vendor) => client.api.vendors.$post({ json: vendor });
export const update_vendor = (id: number, vendor: Partial<Vendor>) => client.api.vendors[':id'].$patch({ param: { id }, json: vendor } as any);
export const delete_vendor = (id: number) => client.api.vendors[':id'].$delete({ param: { id: String(id) } });

// UNITS
export const get_units = () => client.api.units.$get();
export const create_unit = (unit: Unit) => client.api.units.$post({ json: unit });
export const update_unit = (id: number, unit: Partial<Unit>) => client.api.units[':id'].$patch({ param: { id }, json: unit } as any);
export const delete_unit = (id: number) => client.api.units[':id'].$delete({ param: { id: String(id) } });

// EXPENSES
export const get_expenses = (query: PeriodQuery): Promise<ExpenseFull[]> => client.api.expenses.$get({ query }) as unknown as Promise<ExpenseFull[]>;
export const create_expenses = (expenses: Expense[]) => client.api.expenses.$post({ json: expenses });
export const update_expense = (id: number, expense: Partial<Expense>): Promise<UpdatedExpense> =>
    client.api.expenses[':id'].$patch({ param: { id }, json: expense } as any) as unknown as Promise<UpdatedExpense>;
export const delete_expense = (id: number) => client.api.expenses[':id'].$delete({ param: { id: String(id) } });
export const get_expenses_by_category = (query: PeriodQuery) => client.api.expenses.categorized.$get({ query });
export const get_expenses_by_category_interval = (query: IntervalQuery) => client.api.expenses.categorized.intervalled.$get({ query });

// AI SUGGESTIONS
export const get_ai_suggestions = (images: File[]) => client.api.ai.suggest_items.$post({ form: { image: images[0] } });

// PROFILE
export const get_profile_data = () => client.api.profile.$get();
export const get_avatar_url = () => client.api.profile.avatar.$get();
export const upload_avatar = (avatar_file: File) => client.api.profile.avatar.$put({ form: { avatar: avatar_file } });
export const delete_avatar = () => client.api.profile.avatar.$delete();

// ADMIN
export const get_users = () => client.api.admin.users.$get();
