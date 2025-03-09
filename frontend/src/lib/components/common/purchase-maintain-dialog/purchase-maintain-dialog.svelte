<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { currency_formatter, currency_parser, number_formatter, number_parser } from '$lib/consts';
    import { service, ServiceTypes } from '$lib/service';
    import type { LabelValue } from '$lib/types';
    import { label_value_transform, sanitize_string } from '$lib/utils';
    import { toast } from 'svelte-sonner';
    import ComboBox from '../../ui-custom/combo-box/combo-box.svelte';
    import { Input } from '../../ui-custom/input';
    import { ItemMaintainDialog } from '../item-maintain-dialog';
    import type { PurchaseView } from './types.ts';

    type Props = {
        open: boolean;
        mode: 'CREATE' | 'UPDATE';
        purchase?: PurchaseView;
        submit?: (purchase: PurchaseView) => Promise<void>;
    };

    let { open = $bindable(), mode, purchase, submit = void 0, submit: update = void 0 }: Props = $props();

    let item_maintain_dialog_open: boolean = $state(false);
    let create_item_label: string = $state();
    let on_item_created: (item_id: number) => void = $state(() => void 0);

    let selectable_items: LabelValue<number>[] = $state([]);
    let selectable_brands: LabelValue<number>[] = $state([]);

    service.get_brands().then((brands) => (selectable_brands = brands.map(label_value_transform<number>)));
    service.get_items().then((items) => (selectable_items = items.map(label_value_transform<number>)));

    let item_id: number = $state(purchase?.item_id);
    let details: string = $state(purchase?.details);
    let brand_id: number = $state(purchase?.brand_id);
    let quantity: number = $state(purchase?.quantity);
    let price: number = $state(purchase?.price);

    $effect(() => {
        if (purchase?.item_id) item_id = purchase?.item_id;
        if (purchase?.details) details = purchase?.details;
        if (purchase?.brand_id) brand_id = purchase?.brand_id;
        if (purchase?.quantity) quantity = purchase?.quantity;
        if (purchase?.price) price = purchase?.price;
    });

    const reset = () => {
        item_id = undefined;
        details = undefined;
        brand_id = undefined;
        quantity = undefined;
        price = undefined;
    };

    let disabled = $state(false);

    const item_details: ServiceTypes.ItemDetails[] = $state([]);
    const formatters: Intl.NumberFormat[] = $state([]);
    const update_item_detail = (id: number) => {
        if (item_details[id]) return;

        service.get_item_details(String(id)).then((details) => {
            if (!details) {
                toast.error('Item details not found!');
                return;
            }

            item_details[id] = details;
            formatters[id] = formatter_for_unit(details.unit);
        });
    };
    const formatter_for_unit = (unit: string) =>
        ({
            format: (value: number) => `${number_formatter.format(value)} ${unit}`
        }) as Intl.NumberFormat;

    const submit_purchase = () => {
        const errors: string[] = [];

        if (!item_id) errors.push('A Purchase should have an item chosen!');
        if (!(quantity >= 0)) errors.push('A Purchase should have a qunatity specified!');
        if (!(price >= 0)) errors.push('A Purchase should have a price specified!');

        if (errors.length) {
            toast.error(errors.join('\n'));
            return;
        }

        disabled = true;
        const purchase: PurchaseView = {
            id: -1,
            item_id,
            item_name: selectable_items.find((item) => item.value === item_id)?.label || '',
            item_unit: item_details[item_id]?.unit || '',
            details,
            brand_id,
            brand_name: selectable_brands.find((brand) => brand.value === brand_id)?.label || '',
            quantity,
            price
        };

        submit(purchase)
            .then(() => {
                open = false;
                reset();
            })
            .catch((error) => {
                toast.error(error.message);
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

        return new Promise((resolve) => {
            on_item_created = (item_id: number) => {
                if (item_id) selectable_items = [...selectable_items, { label, value: item_id }];
                // TODO: refresh units and items
                toast.success(`Item "${label}" created successfully!`);
                resolve(item_id);
            };
        });
    };

    const create_brand = async (label: string | null): Promise<number> => {
        label = sanitize_string(label);
        if (!label) {
            toast.error('Store name should contain characters other than whitespaces!');
            return Promise.reject();
        }

        return service
            .create_brand({ name: label })
            .then((brand) => {
                selectable_brands = [...selectable_brands, { label, value: brand.id }];
                toast.success(`Brand "${label}" created successfully!`);
                return brand.id;
            })
            .catch((error) => {
                toast.error(error.message);
                throw error;
            });
    };
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]" escapeKeydownBehavior="close" interactOutsideBehavior="close">
        <Dialog.Header>
            <Dialog.Title class="text-left">{mode === 'CREATE' ? 'Log Purchase' : 'Edit Purchase'}</Dialog.Title>
        </Dialog.Header>

        <div class="flex flex-col gap-2">
            <div class="flex flex-row">
                <ComboBox
                    data={selectable_items}
                    bind:value={item_id}
                    placeholder="Select item..."
                    create={create_item}
                    onchange={update_item_detail}
                    class="sm:w-48"
                ></ComboBox>
            </div>
            <ComboBox data={selectable_brands} bind:value={brand_id} placeholder="Select brand..." create={create_brand} class="sm:w-48"></ComboBox>
            <div class="flex flex-row flex-nowrap gap-2">
                <Input
                    placeholder={`Quantity ${item_id && item_details[item_id] ? '(' + item_details[item_id]?.unit + ')' : ''}`}
                    bind:value={quantity}
                    class="min-w-24 max-w-48"
                    formatter={item_id && item_details[item_id] ? formatters[item_id] : number_formatter}
                    parser={number_parser}
                ></Input>
                <Input placeholder="Price" bind:value={price} class="min-w-24 max-w-48" formatter={currency_formatter} parser={currency_parser}></Input>
            </div>
            <Input placeholder="Details" bind:value={details} class="w-full sm:w-48"></Input>
        </div>

        <Dialog.Footer class="flex flex-row justify-stretch gap-2">
            <Button variant="outline" onclick={() => (open = false)} class="w-full">Cancel</Button>
            <Button variant="default" onclick={submit_purchase} class="w-full">{mode === 'CREATE' ? 'Apply' : 'Update'}</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<ItemMaintainDialog bind:open={item_maintain_dialog_open} {on_item_created} name={create_item_label} mode="CREATE" />
