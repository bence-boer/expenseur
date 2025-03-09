<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { number_formatter } from '$lib/consts';
    import { ServiceTypes } from '$lib/service';
    import { format_currency } from '$lib/utils';

    type Props = {
        open: boolean;
        purchase?: ServiceTypes.Purchase;
    };

    let { open = $bindable(), purchase }: Props = $props();

    const format = $derived((value: number) => `${number_formatter.format(value)} ${purchase.unit}`);
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]" escapeKeydownBehavior="close" interactOutsideBehavior="close">
        <Dialog.Header>
            <Dialog.Title class="text-left">
                <div class="flex justify-between items-center">Purchase Details</div>
            </Dialog.Title>
        </Dialog.Header>

        <div>{purchase.item}</div>
        <div>{purchase.brand}</div>
        <div>{format(purchase.quantity)}</div>
        <div>{format_currency(purchase.price)}</div>
        <div>{purchase.details}</div>

        <Dialog.Footer class="flex flex-row justify-stretch gap-2">
            <Button variant="outline" onclick={() => (open = false)} class="w-full">Edit</Button>
            <Button variant="outline" onclick={() => (open = false)} class="w-full">Close</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- <ItemMaintainDialog bind:open={item_maintain_dialog_open} {on_item_created} name={create_item_label} mode="CREATE" /> -->
