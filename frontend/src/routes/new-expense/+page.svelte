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
    import { label_value_transform, sanitize_string } from '$lib/utils';
    import { type DateValue, getLocalTimeZone, parseDate, today } from '@internationalized/date';
    import { Plus, ScanText, Upload } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';

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

    let ai_upload_dialog_open: boolean = $state(false);

    let selectable_stores: LabelValue<string | number>[] = $state([]);
    let selected_store: number | undefined = $state();

    let date: DateValue | undefined = $state();

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
            store_id: selected_store,
            tag_ids: purchase.tag_ids ?? null
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

    const open_ai_upload_dialog = () => {
        ai_upload_dialog_open = true;
    };

    const on_ai_upload_complete = (response: ServiceTypes.AISuggestion) => {
        date = response.date ? parseDate(response.date) : undefined;
        selected_store = response.store_id;
        purchases = response.purchases;
        ai_upload_dialog_open = false;
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
/>

<AiUploadDialog bind:open={ai_upload_dialog_open} on_upload_complete={on_ai_upload_complete} />
