<script lang="ts">
    import { AiUploadDialog } from '$lib/components/common/ai-upload-dialog';
    import { InfoCard } from '$lib/components/common/info-card';
    import PurchaseCard from '$lib/components/common/purchase-card/purchase-card.svelte';
    import { PurchaseMaintainDialog, type PurchaseView } from '$lib/components/common/purchase-maintain-dialog';
    import ComboBox from '$lib/components/ui-custom/combo-box/combo-box.svelte';
    import DatePicker from '$lib/components/ui-custom/date-picker/date-picker.svelte';
    import { Button } from '$lib/components/ui/button';
    import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
    import { Separator } from '$lib/components/ui/separator';
    import { currency_formatter, number_formatter } from '$lib/consts';
    import { service, ServiceTypes } from '$lib/service';
    import type { LabelValue } from '$lib/types';
    import { format_currency, label_value_transform, sanitize_string } from '$lib/utils';
    import { type DateValue, getLocalTimeZone, parseDate, today } from '@internationalized/date';
    import { Plus, ScanText, Upload } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';
    import { onMount } from 'svelte';

    type FormSchema = {
        date: string;
        store_id: number;
        purchases: PurchaseView[];
    };

    let purchases: PurchaseView[] = $state([]);
    let purchase_to_update: PurchaseView | undefined = $state();
    let purchase_to_update_index: number = $state(-1);
    let purchase_maintain_dialog_open: boolean = $state(false);
    let purchase_maintain_dialog_mode: 'CREATE' | 'UPDATE' = $state('CREATE');
    let ai_upload_dialog_open: boolean = $state(false);
    let date: DateValue | undefined = $state();
    let selected_store: number | undefined = $state();

    let items_map = $state(new Map<number, ServiceTypes.Item>());
    let brands_map = $state(new Map<number, ServiceTypes.Brand>());
    let categories_map = $state(new Map<number, ServiceTypes.Category>());
    let units_map = $state(new Map<number, ServiceTypes.Unit>());
    let tags_map = $state(new Map<number, ServiceTypes.Tag>());
    let stores_map = $state(new Map<number, ServiceTypes.Vendor>());

    let selectable_stores: LabelValue<number>[] = $state([]);

    let new_brands: ServiceTypes.Brand[] = $state([]);
    let new_categories: ServiceTypes.Category[] = $state([]);
    let new_items: ServiceTypes.Item[] = $state([]);
    let new_units: ServiceTypes.Unit[] = $state([]);
    let new_stores: ServiceTypes.Vendor[] = $state([]);
    let new_tags: ServiceTypes.Tag[] = $state([]);

    const total = $derived(currency_formatter.format(purchases.reduce((total, purchase) => total + purchase.price, 0)));
    let on_purchase_submitted = $derived(purchase_maintain_dialog_mode === 'CREATE' ? on_new_purchase : on_purchase_edited);

    onMount(() => {
        Promise.allSettled([
            service.get_items(),
            service.get_brands(),
            service.get_categories(),
            service.get_units(),
            service.get_tags(),
            service.get_vendors()
        ]).then(([items_res, brands_res, categories_res, units_res, tags_res, vendors_res]) => {
            if (items_res.status === 'fulfilled') items_map = new Map(items_res.value.map((i) => [i.id, i]));
            if (brands_res.status === 'fulfilled') brands_map = new Map(brands_res.value.map((b) => [b.id, b]));
            if (categories_res.status === 'fulfilled') categories_map = new Map(categories_res.value.map((c) => [c.id, c]));
            if (units_res.status === 'fulfilled') units_map = new Map(units_res.value.map((u) => [u.id, u]));
            if (tags_res.status === 'fulfilled') tags_map = new Map(tags_res.value.map((t) => [t.id, t]));
            if (vendors_res.status === 'fulfilled') {
                stores_map = new Map(vendors_res.value.map((v) => [v.id, v]));
                selectable_stores = vendors_res.value.map(label_value_transform);
            }

            [items_res, brands_res, categories_res, units_res, tags_res, vendors_res].forEach((res) => {
                if (res.status === 'rejected') console.error('Failed to load initial data:', res.reason);
            });
        });
    });

    function create_purchase() {
        purchase_to_update = undefined;
        purchase_maintain_dialog_mode = 'CREATE';
        purchase_maintain_dialog_open = true;
    }

    async function on_new_purchase(purchase: PurchaseView) {
        const temp_id = Math.min(0, ...purchases.map((p) => p.id)) - 1;
        purchases = [...purchases, { ...purchase, id: temp_id }];
        purchase_maintain_dialog_open = false;
    }

    function edit_purchase(index: number) {
        purchase_to_update = purchases[index];
        purchase_to_update_index = index;
        purchase_maintain_dialog_mode = 'UPDATE';
        purchase_maintain_dialog_open = true;
    }

    async function on_purchase_edited(purchase: PurchaseView) {
        if (purchase_to_update_index === -1) return;
        purchases = [...purchases.slice(0, purchase_to_update_index), purchase, ...purchases.slice(purchase_to_update_index + 1)];
        purchase_maintain_dialog_open = false;
        purchase_to_update_index = -1;
        purchase_to_update = undefined;
    }

    async function create_store(label: string | null): Promise<number> {
        label = sanitize_string(label);
        if (!label) {
            toast.error('Store name should contain characters other than whitespaces!');
            return Promise.reject();
        }

        const suggested = new_stores.find((s) => s.name === label && s.id < 0);
        if (suggested) {
            toast.info(`Using suggested store: ${label}`);
            if (!selectable_stores.some((s) => s.value === suggested.id)) {
                selectable_stores = [...selectable_stores, { label, value: suggested.id }];
                if (!stores_map.has(suggested.id)) {
                    stores_map.set(suggested.id, suggested);
                }
            }
            return Promise.resolve(suggested.id);
        }

        return service
            .create_vendor({ name: label })
            .then((store) => {
                stores_map.set(store.id, store);
                selectable_stores = [...selectable_stores, { label, value: store.id }];
                toast.success(`Store "${label}" created successfully!`);
                return store.id;
            })
            .catch((error) => {
                toast.error(error.message);
                throw error;
            });
    }

    function duplicate_purchase(index: number) {
        const original_purchase = purchases[index];
        const temp_id = Math.min(0, ...purchases.map((p) => p.id)) - 1;
        purchases = [...purchases.slice(0, index + 1), { ...original_purchase, id: temp_id }, ...purchases.slice(index + 1)];
        toast.success(`Item ${original_purchase.item_name} duplicated!`);
    }

    function delete_purchase(index: number) {
        purchases = [...purchases.slice(0, index), ...purchases.slice(index + 1)];
    }

    async function handle_submit(event: Event) {
        event.preventDefault();

        const errors: string[] = [];
        if (!date) errors.push('Date is required!');
        if (selected_store === undefined || selected_store === null) errors.push('Store is required!');
        if (purchases.length === 0) errors.push('At least one purchase item is required!');

        if (errors.length > 0) {
            errors.forEach((message) => toast.error(message));
            return false;
        }

        try {
            const category_id_map = new Map<number, number>();
            const unit_id_map = new Map<number, number>();
            const brand_id_map = new Map<number, number>();
            const store_id_map = new Map<number, number>();
            const tag_id_map = new Map<number, number>();
            const item_id_map = new Map<number, number>();

            const category_promises = new_categories.map(({ id, ...category }) =>
                service.create_category(category).then((new_cat) => category_id_map.set(id, new_cat.id))
            );
            const unit_promises = new_units.map(({ id, ...unit }) => service.create_unit(unit).then((new_unit) => unit_id_map.set(id, new_unit.id)));
            const brand_promises = new_brands.map(({ id, ...brand }) => service.create_brand(brand).then((new_brand) => brand_id_map.set(id, new_brand.id)));
            const store_promises = new_stores.map(({ id, ...store }) => service.create_vendor(store).then((new_store) => store_id_map.set(id, new_store.id)));
            const tag_promises = new_tags.map(({ id, ...tag }) => service.create_tag(tag).then((new_tag) => tag_id_map.set(id, new_tag.id)));

            await Promise.all([...category_promises, ...unit_promises, ...brand_promises, ...store_promises, ...tag_promises]);

            const item_promises = new_items.map((item) => {
                const payload: ServiceTypes.CreateItemPayload = {
                    name: item.name,
                    category_id: item.category_id < 0 ? category_id_map.get(item.category_id)! : item.category_id,
                    unit_id: item.unit_id < 0 ? unit_id_map.get(item.unit_id)! : item.unit_id
                };
                return service.create_item(payload).then((new_item) => item_id_map.set(item.id, new_item.id));
            });
            await Promise.all(item_promises);

            const final_selected_store = selected_store! < 0 ? store_id_map.get(selected_store!)! : selected_store!;
            const final_purchases = purchases.map((p) => ({
                item_id: p.item_id < 0 ? item_id_map.get(p.item_id)! : p.item_id,
                brand_id: p.brand_id && p.brand_id < 0 ? brand_id_map.get(p.brand_id)! : p.brand_id,
                tag_ids: p.tag_ids?.map((tid) => (tid < 0 ? tag_id_map.get(tid)! : tid)) ?? null,
                details: p.details,
                price: p.price,
                quantity: p.quantity
            }));

            const formatted_date = date!.toString();
            const data: ServiceTypes.CreatePurchasesPayload = final_purchases.map((purchase) => ({
                brand_id: purchase.brand_id ?? null,
                date: formatted_date,
                details:
                    purchase.details
                        ?.split(', ')
                        .map((detail) => sanitize_string(detail))
                        .filter(Boolean) ?? null,
                item_id: purchase.item_id,
                price: purchase.price,
                quantity: purchase.quantity,
                store_id: final_selected_store,
                tag_ids: purchase.tag_ids ?? null
            }));

            await service.create_purchases(data);

            const sum = total;
            purchases = [];
            date = undefined;
            selected_store = undefined;
            new_brands = [];
            new_categories = [];
            new_items = [];
            new_units = [];
            new_stores = [];
            new_tags = [];

            toast.success(`Purchase of ${format_currency(sum)} registered successfully!`);
            window.location.reload();
        } catch (error: any) {
            console.error('Submission Error:', error);
            toast.error(`Failed to submit expense: ${error.message || 'Unknown error'}`);
        }
    }

    function open_ai_upload_dialog() {
        ai_upload_dialog_open = true;
    }

    function on_ai_upload_complete(response: ServiceTypes.AISuggestion) {
        new_brands = response.brands ?? [];
        new_categories = response.categories ?? [];
        new_items = response.items ?? [];
        new_units = response.units ?? [];
        new_stores = response.stores ?? [];
        new_tags = response.tags ?? [];

        new_brands.forEach((brand) => {
            if (!brands_map.has(brand.id)) brands_map.set(brand.id, brand);
        });
        new_categories.forEach((category) => {
            if (!categories_map.has(category.id)) categories_map.set(category.id, category);
        });
        new_items.forEach((item) => {
            if (!items_map.has(item.id)) {
                items_map.set(item.id, {
                    id: item.id,
                    name: item.name,
                    category_id: item.category_id,
                    unit_id: item.unit_id
                });
            }
        });
        new_units.forEach((unit) => {
            if (!units_map.has(unit.id)) units_map.set(unit.id, unit);
        });
        new_tags.forEach((tag) => {
            if (!tags_map.has(tag.id)) tags_map.set(tag.id, tag);
        });
        new_stores.forEach((store) => {
            if (!stores_map.has(store.id)) {
                stores_map.set(store.id, store);
                if (!selectable_stores.some((ss) => ss.value === store.id)) {
                    selectable_stores = [...selectable_stores, { label: store.name, value: store.id }];
                }
            }
        });

        date = response.date ? parseDate(response.date) : undefined;
        selected_store = response.store_id;

        const ai_purchases = response.purchases ?? [];
        purchases = ai_purchases.map((purchase, index) => {
            const item = items_map.get(purchase.item_id ?? -1);
            const brand = brands_map.get(purchase.brand_id ?? -1);
            const unit = units_map.get(item?.unit_id ?? -1);

            const purchase_tag_ids: number[] = [];

            return {
                id: -(index + 1),
                item_id: purchase.item_id ?? 0,
                item_name: item?.name ?? `Unknown Item (${purchase.item_id})`,
                item_unit: unit?.name ?? '',
                details: purchase.details?.join(', ') ?? '',
                brand_id: purchase.brand_id,
                brand_name: brand?.name ?? '',
                quantity: purchase.quantity ?? 0,
                price: purchase.price ?? 0,
                tag_ids: purchase_tag_ids
            };
        });

        ai_upload_dialog_open = false;
    }
</script>

<h1 class="text-2xl font-bold sm:text-4xl">New Expense</h1>

<Separator />

<div class="flex flex-row flex-wrap gap-4">
    <ComboBox data={selectable_stores} bind:value={selected_store} placeholder="Select store..." create={create_store} class="sm:w-48"></ComboBox>
    <DatePicker bind:value={date} title="Pick date..." placeholder={today(getLocalTimeZone())} class="flex-1 sm:min-w-48 sm:max-w-64"></DatePicker>
</div>
<ScrollArea class="flex-auto gap-2" orientation="vertical">
    {#each purchases as purchase, index (purchase.id)}
        <PurchaseCard
            class="mb-2"
            {purchase}
            all_tags={[...tags_map.values()]}
            duplicate={() => duplicate_purchase(index)}
            delete={() => delete_purchase(index)}
            edit={() => edit_purchase(index)}
        />
    {:else}
        <InfoCard>No Purchase logged for this Expense yet</InfoCard>
    {/each}
</ScrollArea>
<div class="flex flex-col gap-2">
    <div class="flex justify-stretch py-2 gap-2">
        <Button onclick={open_ai_upload_dialog} variant="outline" class="flex-1">
            <ScanText size={16} class="text-muted-foreground" />
            Scan
        </Button>
        <Button onclick={create_purchase} variant="ghost" class="flex-1">
            <Plus class="text-muted-foreground" />
            Add Item
        </Button>
    </div>
    <div class="flex items-center justify-between border border-primary bg-primary-foreground rounded-md p-1 pl-4">
        <span>Total: {total}</span>
        <Button type="submit" class="w-24" size="lg" onclick={handle_submit}>Submit</Button>
    </div>
</div>

<PurchaseMaintainDialog
    bind:open={purchase_maintain_dialog_open}
    purchase={purchase_to_update}
    mode={purchase_maintain_dialog_mode}
    submit={on_purchase_submitted}
    suggested_brands={new_brands}
    suggested_items={new_items.map((i) => ({ ...i, id: i.id, name: i.name }))}
    suggested_tags={new_tags}
    suggested_categories={new_categories}
    suggested_units={new_units}
/>

<AiUploadDialog bind:open={ai_upload_dialog_open} on_upload_complete={on_ai_upload_complete} />
