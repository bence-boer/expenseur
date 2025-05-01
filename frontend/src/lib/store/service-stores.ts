import { service_store } from '$lib/utils/index.ts';
import { service } from '$lib/service/index.ts';

export const [brands] = service_store({
    get: service.get_brands,
    create: service.create_brand,
    update: service.update_brand,
    delete_: service.delete_brand,
    refreshes: [],
});

export const [categories] = service_store({
    get: service.get_categories,
    create: service.create_category,
    update: service.update_category,
    delete_: service.delete_category,
    refreshes: [],
});

export const [tags] = service_store({
    get: service.get_tags,
    create: service.create_tag,
    update: service.update_tag,
    delete_: service.delete_tag,
    refreshes: [],
});

export const [units] = service_store({
    get: service.get_units,
    create: service.create_unit,
    update: service.update_unit,
    delete_: service.delete_unit,
    refreshes: [],
});

export const [vendors] = service_store({
    get: service.get_vendors,
    create: service.create_vendor,
    update: service.update_vendor,
    delete_: service.delete_vendor,
    refreshes: [],
});

export const [items] = service_store({
    get: service.get_items,
    create: service.create_item,
    update: service.update_item,
    delete_: service.delete_item,
    refreshes: [],
});
