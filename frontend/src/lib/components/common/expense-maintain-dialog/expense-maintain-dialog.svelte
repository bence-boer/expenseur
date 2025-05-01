<script lang="ts" generics="MODE extends 'CREATE' | 'UPDATE'">
    import { ItemMaintainDialog } from '$lib/components/common/item-maintain-dialog';
    import { TagSelector } from '$lib/components/common/tag-selector/index.ts';
    import ComboBox from '$lib/components/ui-custom/combo-box/combo-box.svelte';
    import { Input } from '$lib/components/ui-custom/input';
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { currency_formatter, currency_parser, number_formatter, number_parser } from '$lib/consts';
    import { service, ServiceTypes } from '$lib/service';
    import type { LabelValue } from '$lib/types';
    import { label_value_transform, sanitize_string } from '$lib/utils';
    import { toast } from 'svelte-sonner';
    import type { ExpenseView } from './types.ts';
    import { store } from '$lib/store/index.ts';

    type Props = {
        open: boolean;
        mode: MODE;
        expense?: MODE extends 'UPDATE' ? ExpenseView : never;
        submit?: (expense: ExpenseView) => Promise<void>;
        suggested_brands?: ServiceTypes.Brand[];
        suggested_items?: ServiceTypes.Item[];
        suggested_tags?: ServiceTypes.Tag[];
        suggested_categories?: ServiceTypes.Category[];
        suggested_units?: ServiceTypes.Unit[];
    };

    let {
        open = $bindable(),
        mode,
        expense,
        submit = void 0,
        suggested_brands = [],
        suggested_items = [],
        suggested_tags = [],
        suggested_categories = [],
        suggested_units = []
    }: Props = $props();

    type TextResource = {
        [key in MODE]: {
            title: string;
            description: string;
        };
    };
    const text: TextResource[MODE] = $derived(
        {
            CREATE: { title: 'Create Expense', description: 'Enter the details of the expense you want to create.' },
            UPDATE: { title: 'Update Expense', description: 'Modify the details of the expense to update it.' }
        }[mode]
    );

    let item_maintain_dialog_open: boolean = $state(false);
    let create_item_label: string = $state();
    let on_item_created: (item_id: number) => void = $state(() => void 0);

    let selectable_items: LabelValue<number>[] = $state([]);
    let selectable_brands: LabelValue<number>[] = $state([]);
    let selectable_tags: LabelValue<number>[] = $state([]);

    const merge_with_suggested = <T extends { id: number; name: string }>(
        fetched: T[],
        suggested: T[],
        transform: (item: T) => LabelValue<number>
    ): LabelValue<number>[] => {
        const suggested_map = new Map(suggested.map((s) => [s.id, transform(s)]));
        const fetched_transformed = fetched.map(transform);
        const existing_values = new Set(fetched_transformed.map((f) => f.value));

        for (const [id, labelValue] of suggested_map) {
            if (!existing_values.has(id)) {
                fetched_transformed.push(labelValue);
                existing_values.add(id);
            }
        }
        return fetched_transformed;
    };

    const map_suggested = <T extends { id: number; name: string }>(suggested: T[]): Map<number, T> => {
        return new Map(suggested.map((s) => [s.id, s]));
    };

    let suggested_brands_map = $derived(map_suggested(suggested_brands));
    let suggested_items_map = $derived(map_suggested(suggested_items));
    let suggested_tags_map = $derived(map_suggested(suggested_tags));
    let suggested_units_map = $derived(map_suggested(suggested_units));
    let suggested_categories_map = $derived(map_suggested(suggested_categories));

    $effect(() => {
        Promise.all([service.get_brands(), service.get_items(), service.get_tags()]).then(([brands, items, tags]) => {
            selectable_brands = merge_with_suggested(brands, suggested_brands, label_value_transform);
            selectable_items = merge_with_suggested(items, suggested_items as any, label_value_transform);
            selectable_tags = merge_with_suggested(tags, suggested_tags, label_value_transform);
        });
    });

    let item_id: number = $state(expense?.item_id);
    let details: string = $state(expense?.details);
    let brand_id: number = $state(expense?.brand_id);
    let quantity: number = $state(expense?.quantity);
    let price: number = $state(expense?.price);
    let tag_ids: number[] = $state(expense?.tag_ids ?? []);

    $effect(() => {
        item_id = expense?.item_id;
        details = expense?.details;
        brand_id = expense?.brand_id;
        quantity = expense?.quantity;
        price = expense?.price;
        tag_ids = expense?.tag_ids ?? [];
        if (expense?.item_id) update_item_detail(expense?.item_id);
    });

    const reset = () => {
        item_id = undefined;
        details = undefined;
        brand_id = undefined;
        quantity = undefined;
        price = undefined;
        tag_ids = [];
        item_details = {};
        formatters = {};
    };

    let disabled = $state(false);

    let item_details: Record<number, ServiceTypes.ItemDetails | { unit: string; category: string; name: string }> = $state({});
    let formatters: Record<number, Intl.NumberFormat> = $state({});

    const update_item_detail = (id: number) => {
        if (!id || item_details[id]) return;

        if (id < 0) {
            const suggested_item = suggested_items_map.get(id);
            if (suggested_item) {
                const unit = suggested_units_map.get(suggested_item.unit_id)?.name ?? 'unknown';
                const category = suggested_categories_map.get(suggested_item.category_id)?.name ?? 'unknown';
                item_details[id] = {
                    name: suggested_item.name,
                    unit: unit,
                    category: category
                };
                formatters[id] = formatter_for_unit(unit);
            } else {
                console.warn(`Suggested item details not found for ID: ${id}`);
                item_details[id] = { name: `Unknown Suggested (${id})`, unit: '', category: '' };
                formatters[id] = number_formatter;
            }
        } else {
            service
                .get_item_details(String(id))
                .then((details) => {
                    if (!details) {
                        toast.error('Item details not found!');
                        item_details[id] = { name: `Unknown Existing (${id})`, unit: '', category: '' };
                        formatters[id] = number_formatter;
                        return;
                    }
                    item_details[id] = details;
                    formatters[id] = formatter_for_unit(details.unit);
                })
                .catch(() => {
                    item_details[id] = { name: `#error`, unit: '', category: '' };
                    formatters[id] = number_formatter;
                });
        }
    };

    const formatter_for_unit = (unit: string) =>
        ({
            format: (value: number) => `${number_formatter.format(value)} ${unit}`
        }) as Intl.NumberFormat;

    const get_label_for_id = (id: number | undefined, collection: LabelValue<number>[], suggested_map: Map<number, { name: string }>): string => {
        if (id === undefined || id === null) return '';
        const existing = collection.find((item) => item.value === id);
        if (existing) return existing.label;
        const suggested = suggested_map.get(id);
        return suggested?.name ?? `Unknown (ID: ${id})`;
    };

    const submit_expense = () => {
        const errors: string[] = [];

        if (!item_id) errors.push('A Expense should have an item chosen!');
        if (!(quantity >= 0)) errors.push('A Expense should have a quantity specified!');
        if (!(price >= 0)) errors.push('A Expense should have a price specified!');

        if (errors.length) {
            toast.error(errors.join('\n'));
            return;
        }

        disabled = true;

        const item_name = get_label_for_id(item_id, selectable_items, suggested_items_map);
        const brand_name = get_label_for_id(brand_id, selectable_brands, suggested_brands_map);
        const item_unit = item_details[item_id]?.unit || '';

        const expense_data: ExpenseView = {
            id: mode === 'UPDATE' ? expense?.id : -1,
            item_id,
            item_name,
            item_unit,
            details,
            brand_id,
            brand_name,
            quantity,
            price,
            tag_ids
        };

        submit(expense_data)
            .then(() => {
                open = false;
                if (mode === 'CREATE') reset();
            })
            .finally(() => {
                disabled = false;
            });
    };

    const create_item = async (label: string | null): Promise<number> => {
        label = sanitize_string(label);
        if (!label) {
            toast.error('Item name should contain characters other than whitespaces!');
            return Promise.reject();
        }

        item_maintain_dialog_open = true;
        create_item_label = label;

        return new Promise((resolve, reject) => {
            on_item_created = (created_item_id: number) => {
                if (created_item_id) {
                    service
                        .get_items()
                        .then((items) => {
                            selectable_items = merge_with_suggested(
                                items,
                                suggested_items.map((i) => ({ ...i, id: i.id, name: i.name })),
                                label_value_transform
                            );
                            toast.success(`Item "${label}" created successfully!`);
                            update_item_detail(created_item_id);
                            resolve(created_item_id);
                        })
                        .catch(reject);
                } else {
                    reject(new Error('Item creation failed or was cancelled.'));
                }
            };
        });
    };

    const create_brand = async (label: string | null): Promise<number> => {
        label = sanitize_string(label);
        if (!label) {
            toast.error('Brand name should contain characters other than whitespaces!');
            return Promise.reject();
        }

        const suggested = suggested_brands.find((b) => b.name === label && b.id < 0);
        if (suggested) {
            toast.info(`Using suggested brand: ${label}`);
            if (!selectable_brands.some((b) => b.value === suggested.id)) {
                selectable_brands = [...selectable_brands, { label, value: suggested.id }];
            }
            return Promise.resolve(suggested.id);
        }

        return service.create_brand({ name: label }).then((brand) => {
            const new_brand_entry = { id: brand.id, name: label };
            selectable_brands = merge_with_suggested(
                [new_brand_entry],
                selectable_brands.map((lv) => ({ id: lv.value, name: lv.label })),
                label_value_transform
            );
            toast.success(`Brand "${label}" created successfully!`);
            return brand.id;
        });
    };

    $effect(() => {
        if (!open) {
            setTimeout(() => {
                if (!open && (mode === 'CREATE' || !expense)) reset();
            }, 150);
        } else {
            if (mode === 'CREATE') reset();
            Promise.all([store.brands.data, store.items.data, store.tags.data]).then(([brands, items, tags]) => {
                selectable_brands = merge_with_suggested(brands, suggested_brands, label_value_transform);
                selectable_items = merge_with_suggested(items, suggested_items, label_value_transform);
                selectable_tags = merge_with_suggested(tags as any, suggested_tags, label_value_transform);
            });
        }
    });
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]" escapeKeydownBehavior="close" interactOutsideBehavior="ignore">
        <Dialog.Header>
            <Dialog.Title>{text.title}</Dialog.Title>
            <Dialog.Description>{text.description}</Dialog.Description>
        </Dialog.Header>

        <div class="flex flex-col gap-2">
            <div class="flex flex-row items-center gap-2">
                <ComboBox
                    data={selectable_items}
                    bind:value={item_id}
                    placeholder="Select item..."
                    create={create_item}
                    onchange={update_item_detail}
                    class="sm:w-48 flex-grow"
                    {disabled}
                ></ComboBox>
                <TagSelector bind:value={tag_ids} {disabled} create={true} />
            </div>
            <ComboBox data={selectable_brands} bind:value={brand_id} placeholder="Select brand..." create={create_brand} class="sm:w-48" {disabled}></ComboBox>
            <div class="flex flex-row flex-nowrap gap-2">
                <Input
                    placeholder={`Quantity ${item_id && item_details[item_id] ? '(' + item_details[item_id]?.unit + ')' : ''}`}
                    bind:value={quantity}
                    class="min-w-24 max-w-48"
                    formatter={item_id && formatters[item_id] ? formatters[item_id] : number_formatter}
                    parser={number_parser}
                    {disabled}
                ></Input>
                <Input placeholder="Price" bind:value={price} class="min-w-24 max-w-48" formatter={currency_formatter} parser={currency_parser} {disabled}
                ></Input>
            </div>
            <Input placeholder="Details" bind:value={details} class="w-full sm:w-48" {disabled}></Input>
        </div>

        <Dialog.Footer class="flex flex-row justify-stretch gap-2">
            <Button variant="outline" onclick={() => (open = false)} class="w-full" {disabled}>Cancel</Button>
            <Button variant="default" onclick={submit_expense} class="w-full" {disabled}>{mode === 'CREATE' ? 'Apply' : 'Update'}</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<ItemMaintainDialog bind:open={item_maintain_dialog_open} {on_item_created} item={{ name: create_item_label }} mode="CREATE" />
