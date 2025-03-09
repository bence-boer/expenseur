<script lang="ts">
    import * as Collapsible from '$lib/components/ui/collapsible';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import Separator from '$lib/components/ui/separator/separator.svelte';
    import { ChevronDown, Copy, EllipsisVertical, SquarePen, Trash } from '@lucide/svelte';
    import type { PurchaseView } from '../purchase-maintain-dialog';
    import { cn, format_currency } from '$lib/utils';

    type Props = {
        purchase: PurchaseView;
        duplicate: () => void;
        delete: () => void;
        edit: () => void;
        class?: string;
    };

    let { purchase, duplicate, delete: delete_purchase, edit, class: className }: Props = $props();
</script>

<Collapsible.Root class={cn('bg-primary-foreground rounded-md p-4', className)}>
    <Collapsible.Trigger class="flex flex-row justify-between gap-2 w-full">
        <div class="flex-1 flex flex-row gap-4 items-center">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <EllipsisVertical size="16" class="text-muted-foreground" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content side="bottom" align="start" alignOffset={-16}>
                    <DropdownMenu.Item onclick={edit}>
                        <SquarePen class="text-muted-foreground" />
                        Edit
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onclick={duplicate}>
                        <Copy class="text-muted-foreground" />
                        Duplicate
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onclick={delete_purchase} class="text-red-500">
                        <Trash />
                        Delete
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            {purchase.item_name}
        </div>

        <div class="flex flex-row gap-4 items-center">
            {format_currency(purchase.price)}
            <ChevronDown class="text-muted-foreground" size={16} />
        </div>
    </Collapsible.Trigger>
    <Collapsible.Content>
        <Separator class="my-4" />
        <div>{purchase.details}</div>
        <div class="flex flex-row justify-between px-2 text-muted-foreground">
            {#if purchase.brand_name}<span>{purchase.brand_name}</span>{/if}
            {#if purchase.quantity}<span>{purchase.quantity} {purchase.item_unit}</span>{/if}
        </div>
    </Collapsible.Content>
</Collapsible.Root>
