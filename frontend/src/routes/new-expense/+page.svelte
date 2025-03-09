<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import DatePicker from '$lib/components/ui-custom/date-picker/date-picker.svelte';
    import { Input } from '$lib/components/ui/input';
    import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
    import { Separator } from '$lib/components/ui/separator';
    import { currency_formatter, currency_parser, number_formatter, number_parser } from '$lib/consts';
    import { service, ServiceTypes } from '$lib/service';
    import { label_value_transform, sanitize_string } from '$lib/utils';
    import { type DateValue, getLocalTimeZone, today } from '@internationalized/date';
    import { Copy, Plus, WandSparkles, X } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';
    import ComboBox from '$lib/components/ui-custom/combo-box/combo-box.svelte';
    import { ItemMaintainDialog } from '$lib/components/common/item-maintain-dialog';
    import type { LabelValue } from '$lib/types';
    import PurchaseCard from '$lib/components/common/purchase-card/purchase-card.svelte';
    import { PurchaseMaintainDialog, type PurchaseView } from '$lib/components/common/purchase-maintain-dialog';
    import { InfoCard } from '$lib/components/common/info-card';
    import { Label } from '$lib/components/ui/label';

    type FormSchema = {
        date: string;
        store_id: number;
        purchases: PurchaseView[];
    };

    let purchases: FormSchema['purchases'] = $state([]);
    let purchase_to_update: PurchaseView = $state();
    let purchase_to_update_index: number = $state(-1);
    let purchase_maintain_dialog_open: boolean = $state(false);
    let purchase_maintain_dialog_mode: 'CREATE' | 'UPDATE' = $state('CREATE');

    let selectable_stores: LabelValue<string | number>[] = $state([]);
    let selected_store: number | undefined = $state();

    let date: DateValue | undefined = $state(); // TODO: REFACTOR INTO SCHEMA OBJECT

    service.get_vendors().then((vendors) => (selectable_stores = vendors.map(label_value_transform<number>)));

    const total = $derived(currency_formatter.format(purchases.reduce((total, purchase) => total + purchase.price, 0)));

    const create_purchase = () => {
        purchase_maintain_dialog_mode = 'CREATE';
        purchase_maintain_dialog_open = true;
    };

    const on_new_purchase = async (purchase: PurchaseView) => {
        purchases = [...purchases, purchase];
        purchase_maintain_dialog_open = false;
    };

    const edit_purchase = (index: number) => {
        purchase_to_update = purchases[index];
        purchase_to_update_index = index;
        purchase_maintain_dialog_mode = 'UPDATE';
        purchase_maintain_dialog_open = true;
    };

    const on_purchase_edited = async (purchase: PurchaseView) => {
        purchases = [...purchases.slice(0, purchase_to_update_index), purchase, ...purchases.slice(purchase_to_update_index + 1)];
        purchase_maintain_dialog_open = false;
    };

    let on_purchase_submitted = $derived(purchase_maintain_dialog_mode === 'CREATE' ? on_new_purchase : on_purchase_edited);

    const create_store = async (label: string | null): Promise<number> => {
        label = sanitize_string(label);
        if (!label) {
            toast.error('Store name should contain characters other than whitespaces!');
            return Promise.reject();
        }

        return service
            .create_vendor({ name: label })
            .then((store) => {
                selectable_stores = [...selectable_stores, { label, value: store.id }];
                toast.success(`Store "${label}" created successfully!`);
                return store.id;
            })
            .catch((error) => {
                toast.error(error.message);
                throw error;
            });
    };

    const duplicate_purchase = (index: number) => {
        purchases = [...purchases.slice(0, index + 1), { ...purchases[index] }, ...purchases.slice(index + 1)];
        const message: string = `Item ${purchases[index].item_name} duplicated!`;
        toast.success(message);
    };

    const delete_purchase = (index: number) => (purchases = [...purchases.slice(0, index), ...purchases.slice(index + 1)]);

    const handle_submit = (event: Event) => {
        event.preventDefault();

        const errors: string[] = [];
        if (!date) errors.push('Date is required!');
        if (!selected_store) errors.push('Store is required!');

        if (errors.length > 0) {
            errors.forEach((message) => toast.error(message));
            return false;
        }

        const formatted_date = date.toString();
        const data: ServiceTypes.CreatePurchasesPayload = purchases.map((purchase) => ({
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
            store_id: selected_store
        }));

        service
            .create_purchases(data)
            .then((data) => {
                const sum = total;
                purchases = [];
                date = undefined;
                selected_store = undefined;

                toast.success(`Purchase of ${sum} registered successfully!`);
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    const formatter_for_unit = (unit: string) =>
        ({
            format: (value: number) => `${number_formatter.format(value)} ${unit}`
        }) as Intl.NumberFormat;

    let response: string = $state();
    let files: FileList = $state();

    $effect(() => files?.length && send_ai_message());
    const send_ai_message = () => {
        const image: File = files?.[0];
        if (!image) {
            toast.error('Please select an image!');
            return;
        }
        const mime = image.type;
        if (!['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'].includes(mime)) {
            toast.error('Please select an image of type PNG, JPEG, WEBP, HEIC or HEIF!');
            return;
        }

        image
            .arrayBuffer()
            .then((buffer) => service.get_ai_suggestions({ image: [...new Uint8Array(buffer)], mime }))
            .then((response) => {
                date = response.date;
                selected_store = response.store_id;
                purchases = response.purchases;
            })
            .finally(() => (files = undefined));
    };
</script>

<h1 class="text-2xl font-bold sm:text-4xl">New Expense</h1>

<Separator />

<div class="flex flex-row flex-wrap gap-4">
    <ComboBox data={selectable_stores} bind:value={selected_store} placeholder="Select store..." create={create_store} class="sm:w-48"></ComboBox>
    <DatePicker bind:value={date} title="Pick date..." placeholder={today(getLocalTimeZone())} class="flex-1 sm:min-w-48 sm:max-w-64"></DatePicker>
</div>
<ScrollArea class="flex-auto gap-2" orientation="vertical">
    {#each purchases as purchase, index}
        <PurchaseCard
            class="mb-2"
            {purchase}
            duplicate={() => duplicate_purchase(index)}
            delete={() => delete_purchase(index)}
            edit={() => edit_purchase(index)}
        />
    {:else}
        <InfoCard>No Purchase logged for this Expense yet</InfoCard>
    {/each}
</ScrollArea>
<div class="flex flex-col gap-2">
    <div class="flex justify-stretch py-2">
        <Button onclick={create_purchase} variant="ghost" class="flex-1">
            <Plus class="text-muted-foreground" />
            Add Item
        </Button>
        <div class="relative flex-1 border border-primary rounded-md">
            <Label for="image" class="flex items-center justify-center gap-2 cursor-pointer h-full">
                <WandSparkles size={16} class="text-muted-foreground" />
                Upload
            </Label>
            <Input
                id="image"
                class="absolute right-0 left-0 top-0 bottom-0"
                type="file"
                bind:files
                accept="image/png, image/jpeg, image/webp, image/heic, image/heif"
            />
        </div>
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
/>
