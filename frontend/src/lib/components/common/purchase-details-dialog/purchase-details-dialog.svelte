<script lang="ts">
    import { Badge } from '$lib/components/ui/badge';
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import Separator from '$lib/components/ui/separator/separator.svelte';
    import { number_formatter } from '$lib/consts';
    import { service, ServiceTypes } from '$lib/service';
    import { format_currency } from '$lib/utils';
    import { Edit, X } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';
    import { PurchaseMaintainDialog, type PurchaseView } from '../purchase-maintain-dialog';
    import Tag from '../tag/tag.svelte';

    type Props = {
        open: boolean;
        purchase?: ServiceTypes.Purchase;
        on_purchase_updated?: () => void;
    };

    let { open = $bindable(), purchase, on_purchase_updated = () => {} }: Props = $props();

    const format = $derived((value: number) => `${number_formatter.format(value)} ${purchase.unit}`);

    let maintain_dialog_open = $state(false);
    let maintain_dialog_mode: 'CREATE' | 'UPDATE' = $state('UPDATE');

    const open_edit_dialog = () => {
        if (purchase) {
            maintain_dialog_mode = 'UPDATE';
            maintain_dialog_open = true;
        } else {
            console.error('Cannot edit purchase: Purchase data is missing.');
            toast.error('Cannot edit purchase: Purchase data is missing.');
        }
    };

    const handle_purchase_updated = async (updated_purchase_data: PurchaseView) => {
        if (!purchase) {
            toast.error('Original purchase data not found for update.');
            return Promise.reject('Original purchase data not found');
        }
        return service
            .update_purchase(purchase.id, {
                item_id: updated_purchase_data.item_id,
                brand_id: updated_purchase_data.brand_id,
                quantity: updated_purchase_data.quantity,
                price: updated_purchase_data.price,
                details: updated_purchase_data.details
                    .split(', ')
                    .map((detail) => detail.trim())
                    .filter(Boolean),
                tag_ids: updated_purchase_data.tag_ids
            })
            .then(() => {
                toast.success('Purchase updated successfully!');
                maintain_dialog_open = false;
                open = false;
                on_purchase_updated();
            })
            .catch((error) => {
                toast.error(`Failed to update purchase: ${error.message}`);
                throw error;
            });
    };
</script>

{#snippet dotted(key: string, value?: string)}
    {#if value}
        <div class="flex items-center gap-2">
            <span>{key}</span>
            <span class="dots text-muted-foreground"></span>
            <span class="text-nowrap text-muted-foreground">{value}</span>
        </div>
    {/if}
{/snippet}

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]" escapeKeydownBehavior="close" interactOutsideBehavior="close">
        <Dialog.Header>
            <Dialog.Title class="text-left">
                <div class="flex justify-between items-center">Purchase Details</div>
            </Dialog.Title>
        </Dialog.Header>

        <Separator />
        <div class="flex flex-col overflow-hidden gap-2 py-2">
            {@render dotted('Item', purchase.item)}
            {@render dotted('Brand', purchase.brand)}
            {@render dotted('Quantity', format(purchase.quantity))}
            {@render dotted('Price', format_currency(purchase.price))}
            {@render dotted('Details', purchase.details)}
        </div>
        <Separator />
        {#if purchase.tags?.length}
            <div class="flex w-full flex-wrap justify-start gap-2">
                {#each purchase.tags as tag}
                    <Tag {tag} />
                {/each}
            </div>
        {/if}

        <Dialog.Footer class="flex flex-row justify-stretch gap-2">
            <Button variant="outline" onclick={open_edit_dialog} class="w-full">
                <Edit />
                Edit
            </Button>
            <Button variant="outline" onclick={() => (open = false)} class="w-full">
                <X />
                Close
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<PurchaseMaintainDialog bind:open={maintain_dialog_open} {purchase} mode={maintain_dialog_mode} submit={handle_purchase_updated} />
