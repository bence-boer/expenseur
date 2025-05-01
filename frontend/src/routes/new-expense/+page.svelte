<script lang="ts">
    import { AiUploadDialog } from '$lib/components/common/ai-upload-dialog';
    import { ExpenseCard } from '$lib/components/common/expense-card';
    import { ExpenseMaintainDialog, type ExpenseView } from '$lib/components/common/expense-maintain-dialog';
    import { InfoCard } from '$lib/components/common/info-card';
    import { ProcessedImagesDialog } from '$lib/components/common/processed-images-dialog';
    import ComboBox from '$lib/components/ui-custom/combo-box/combo-box.svelte';
    import DatePicker from '$lib/components/ui-custom/date-picker/date-picker.svelte';
    import { Button } from '$lib/components/ui/button';
    import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
    import { Separator } from '$lib/components/ui/separator';
    import { currency_formatter } from '$lib/consts';
    import { service, ServiceTypes } from '$lib/service';
    import type { AIExpensePrediction } from '$lib/service/_manual-types';
    import { store } from '$lib/store';
    import type { LabelValue } from '$lib/types';
    import { format_currency, label_value_transform, sanitize_string } from '$lib/utils';
    import { type DateValue, getLocalTimeZone, parseDate, today } from '@internationalized/date';
    import { Images, Plus, ScanText } from '@lucide/svelte';
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';

    let expenses: ExpenseView[] = $state([]);
    let expense_to_update: ExpenseView | undefined = $state();
    let expense_to_update_index: number = $state(-1);
    let expense_maintain_dialog_open: boolean = $state(false);
    let expense_maintain_dialog_mode: 'CREATE' | 'UPDATE' = $state('CREATE');
    let ai_upload_dialog_open: boolean = $state(false);
    let processed_images_dialog_open: boolean = $state(false);
    let processed_images: string[] = $state([]);
    let date: DateValue | undefined = $state();
    let selected_vendor: number | undefined = $state();

    let items_map = $state(new Map<number, ServiceTypes.Item>());
    let brands_map = $state(new Map<number, ServiceTypes.Brand>());
    let categories_map = $state(new Map<number, ServiceTypes.Category>());
    let units_map = $state(new Map<number, ServiceTypes.Unit>());
    let tags_map = $state(new Map<number, ServiceTypes.Tag>());
    let vendors_map = $state(new Map<number, ServiceTypes.Vendor>());

    let selectable_vendors: LabelValue<number>[] = $state([]);

    let new_brands: ServiceTypes.Brand[] = $state([]);
    let new_categories: ServiceTypes.Category[] = $state([]);
    let new_items: ServiceTypes.Item[] = $state([]);
    let new_units: ServiceTypes.Unit[] = $state([]);
    let new_vendors: ServiceTypes.Vendor[] = $state([]);
    let new_tags: ServiceTypes.Tag[] = $state([]);

    const total = $derived(currency_formatter.format(expenses.reduce((total, expense) => total + expense.price, 0)));
    let on_expense_submitted = $derived(expense_maintain_dialog_mode === 'CREATE' ? on_new_expense : on_expense_edited);

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
                vendors_map = new Map(vendors_res.value.map((v) => [v.id, v]));
                selectable_vendors = vendors_res.value.map(label_value_transform);
            }

            [items_res, brands_res, categories_res, units_res, tags_res, vendors_res].forEach((res) => {
                if (res.status === 'rejected') console.error('Failed to load initial data:', res.reason);
            });
        });
    });

    function create_expense() {
        expense_to_update = undefined;
        expense_maintain_dialog_mode = 'CREATE';
        expense_maintain_dialog_open = true;
    }

    async function on_new_expense(expense: ExpenseView) {
        const temp_id = Math.min(0, ...expenses.map((p) => p.id)) - 1;
        expenses = [...expenses, { ...expense, id: temp_id }];
        expense_maintain_dialog_open = false;
    }

    function edit_expense(index: number) {
        expense_to_update = expenses[index];
        expense_to_update_index = index;
        expense_maintain_dialog_mode = 'UPDATE';
        expense_maintain_dialog_open = true;
    }

    async function on_expense_edited(expense: ExpenseView) {
        if (expense_to_update_index === -1) return;
        expenses = [...expenses.slice(0, expense_to_update_index), expense, ...expenses.slice(expense_to_update_index + 1)];
        expense_maintain_dialog_open = false;
        expense_to_update_index = -1;
        expense_to_update = undefined;
    }

    async function create_vendor(label: string | null): Promise<number> {
        label = sanitize_string(label);
        if (!label) {
            toast.error('Vendor name should contain characters other than whitespaces!');
            return Promise.reject();
        }

        const suggested = new_vendors.find((s) => s.name === label && s.id < 0);
        if (suggested) {
            toast.info(`Using suggested vendor: ${label}`);
            if (!selectable_vendors.some((s) => s.value === suggested.id)) {
                selectable_vendors = [...selectable_vendors, { label, value: suggested.id }];
                if (!vendors_map.has(suggested.id)) {
                    vendors_map.set(suggested.id, suggested);
                }
            }
            return Promise.resolve(suggested.id);
        }

        return service.create_vendor({ name: label }).then((vendor) => {
            vendors_map.set(vendor.id, vendor);
            selectable_vendors = [...selectable_vendors, { label, value: vendor.id }];
            toast.success(`Vendor "${label}" created successfully!`);
            return vendor.id;
        });
    }

    function duplicate_expense(index: number) {
        const original_expense = expenses[index];
        const temp_id = Math.min(0, ...expenses.map((p) => p.id)) - 1;
        expenses = [...expenses.slice(0, index + 1), { ...original_expense, id: temp_id }, ...expenses.slice(index + 1)];
        toast.success(`Item ${original_expense.item_name} duplicated!`);
    }

    function delete_expense(index: number) {
        expenses = [...expenses.slice(0, index), ...expenses.slice(index + 1)];
    }

    async function handle_submit(event: Event) {
        event.preventDefault();

        const errors: string[] = [];
        if (!date) errors.push('Date is required!');
        if (selected_vendor === undefined || selected_vendor === null) errors.push('Vendor is required!');
        if (expenses.length === 0) errors.push('At least one expense item is required!');

        if (errors.length > 0) {
            errors.forEach((message) => toast.error(message));
            return false;
        }

        try {
            const category_id_map = new Map<number, number>();
            const unit_id_map = new Map<number, number>();
            const brand_id_map = new Map<number, number>();
            const vendor_id_map = new Map<number, number>();
            const tag_id_map = new Map<number, number>();
            const item_id_map = new Map<number, number>();

            const category_promises = new_categories.map(({ id, ...category }) =>
                service.create_category(category).then((new_cat) => category_id_map.set(id, new_cat.id))
            );
            const unit_promises = new_units.map(({ id, ...unit }) => service.create_unit(unit).then((new_unit) => unit_id_map.set(id, new_unit.id)));
            const brand_promises = new_brands.map(({ id, ...brand }) => service.create_brand(brand).then((new_brand) => brand_id_map.set(id, new_brand.id)));
            const vendor_promises = new_vendors.map(({ id, ...vendor }) =>
                service.create_vendor(vendor).then((new_vendor) => vendor_id_map.set(id, new_vendor.id))
            );
            const tag_promises = new_tags.map(({ id, ...tag }) => service.create_tag(tag).then((new_tag) => tag_id_map.set(id, new_tag.id)));

            await Promise.all([...category_promises, ...unit_promises, ...brand_promises, ...vendor_promises, ...tag_promises]);

            const item_promises = new_items.map((item) => {
                const payload: ServiceTypes.CreateItemPayload = {
                    name: item.name,
                    category_id: item.category_id < 0 ? category_id_map.get(item.category_id)! : item.category_id,
                    unit_id: item.unit_id < 0 ? unit_id_map.get(item.unit_id)! : item.unit_id
                };
                return service.create_item(payload).then((new_item) => item_id_map.set(item.id, new_item.id));
            });
            await Promise.all(item_promises);

            const final_selected_vendor = selected_vendor! < 0 ? vendor_id_map.get(selected_vendor!)! : selected_vendor!;
            const final_expenses = expenses.map((p) => ({
                item_id: p.item_id < 0 ? item_id_map.get(p.item_id)! : p.item_id,
                brand_id: p.brand_id && p.brand_id < 0 ? brand_id_map.get(p.brand_id)! : p.brand_id,
                tag_ids: p.tag_ids?.map((tid) => (tid < 0 ? tag_id_map.get(tid)! : tid)) ?? null,
                details: p.details,
                price: p.price,
                quantity: p.quantity
            }));

            const formatted_date = date!.toString();
            const data: ServiceTypes.CreateExpensesPayload = final_expenses.map((expense) => ({
                brand_id: expense.brand_id ?? null,
                date: formatted_date,
                details:
                    expense.details
                        ?.split(', ')
                        .map((detail) => sanitize_string(detail))
                        .filter(Boolean) ?? null,
                item_id: expense.item_id,
                price: expense.price,
                quantity: expense.quantity,
                store_id: final_selected_vendor,
                tag_ids: expense.tag_ids ?? null
            }));

            await service.create_expenses(data);

            toast.success(`Expense of ${total} registered successfully!`);
            reset_page_state();
        } catch (error: any) {
            console.error('Submission Error:', error);
            toast.error(`Failed to submit expense: ${error.message || 'Unknown error'}`);
        }
    }

    function open_ai_upload_dialog() {
        ai_upload_dialog_open = true;
    }

    function open_processed_images_dialog() {
        processed_images_dialog_open = true;
    }

    function reset_page_state() {
        // Reset form state
        expenses = [];
        date = undefined;
        selected_vendor = undefined;

        // Reset dialog states
        processed_images = [];
        expense_to_update = undefined;
        expense_to_update_index = -1;
        expense_maintain_dialog_open = false;
        expense_maintain_dialog_mode = 'CREATE';
        ai_upload_dialog_open = false;
        processed_images_dialog_open = false;

        // Reset new entities arrays
        new_brands = [];
        new_categories = [];
        new_items = [];
        new_units = [];
        new_vendors = [];
        new_tags = [];
    }

    function on_ai_upload_complete(response: AIExpensePrediction, processed_image_urls: string[]) {
        processed_images = [...processed_image_urls];

        new_brands = response.new_brands ?? [];
        new_categories = response.new_categories ?? [];
        new_items = response.new_items ?? [];
        new_units = response.new_units ?? [];
        new_vendors = response.new_stores ?? [];
        new_tags = [];

        new_brands.forEach((brand) => {
            brands_map.set(brand.id, brand);
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
        new_vendors.forEach((vendor) => {
            if (!vendors_map.has(vendor.id)) {
                vendors_map.set(vendor.id, vendor);
                if (!selectable_vendors.some((ss) => ss.value === vendor.id)) {
                    selectable_vendors = [...selectable_vendors, { label: vendor.name, value: vendor.id }];
                }
            }
        });

        date = response.date ? parseDate(response.date) : undefined;
        selected_vendor = response.store_id;

        const ai_expenses = response.expenses ?? [];
        expenses = ai_expenses.map((expense, index) => {
            const item = items_map.get(expense.item_id ?? -1);
            const brand = brands_map.get(expense.brand_id ?? -1);
            const unit = units_map.get(item?.unit_id ?? -1);

            const expense_tag_ids: number[] = [];

            return {
                id: -(index + 1),
                item_id: expense.item_id ?? 0,
                item_name: item?.name ?? `Unknown Item (${expense.item_id})`,
                item_unit: unit?.name ?? '',
                details: expense.details?.join(', ') ?? '',
                brand_id: expense.brand_id,
                brand_name: brand?.name ?? '',
                quantity: expense.quantity ?? 0,
                price: expense.price ?? 0,
                tag_ids: expense_tag_ids
            };
        });

        ai_upload_dialog_open = false;
    }
</script>

<div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold sm:text-4xl">New Expense</h1>

    {#if store.auth.beta.value}
        <Button variant="ghost" size="icon" onclick={open_processed_images_dialog} disabled={processed_images.length === 0} title="View processed images">
            <Images size={20} class="text-muted-foreground" />
        </Button>
    {/if}
</div>

<Separator />

<div class="flex flex-row flex-wrap gap-4">
    <ComboBox data={selectable_vendors} bind:value={selected_vendor} placeholder="Select vendor..." create={create_vendor} class="sm:w-48"></ComboBox>
    <DatePicker bind:value={date} title="Pick date..." placeholder={today(getLocalTimeZone())} class="flex-1 sm:min-w-48 sm:max-w-64"></DatePicker>
</div>
<ScrollArea class="flex-auto gap-2" orientation="vertical">
    {#each expenses as expense, index (expense.id)}
        <ExpenseCard
            class="mb-2"
            {expense}
            all_tags={[...tags_map.values()]}
            duplicate={() => duplicate_expense(index)}
            delete={() => delete_expense(index)}
            edit={() => edit_expense(index)}
        />
    {:else}
        <InfoCard>No Expense logged for this Expense yet</InfoCard>
    {/each}
</ScrollArea>
<div class="flex flex-col gap-2">
    <div class="flex justify-stretch py-2 gap-2">
        <Button onclick={open_ai_upload_dialog} variant="outline" class="flex-1">
            <ScanText size={16} class="text-muted-foreground" />
            Scan
        </Button>
        <Button onclick={create_expense} variant="ghost" class="flex-1">
            <Plus class="text-muted-foreground" />
            Add Item
        </Button>
    </div>
    <div class="flex items-center justify-between border border-primary bg-primary-foreground rounded-md p-1 pl-4">
        <span>Total: {total}</span>
        <Button type="submit" class="w-24" size="lg" onclick={handle_submit}>Submit</Button>
    </div>
</div>

<ExpenseMaintainDialog
    bind:open={expense_maintain_dialog_open}
    expense={expense_to_update}
    mode={expense_maintain_dialog_mode}
    submit={on_expense_submitted}
    suggested_brands={new_brands}
    suggested_items={new_items.map((i) => ({ ...i, id: i.id, name: i.name }))}
    suggested_tags={new_tags}
    suggested_categories={new_categories}
    suggested_units={new_units}
/>

<AiUploadDialog bind:open={ai_upload_dialog_open} on_upload_complete={on_ai_upload_complete} />

<ProcessedImagesDialog bind:open={processed_images_dialog_open} {processed_images} />
