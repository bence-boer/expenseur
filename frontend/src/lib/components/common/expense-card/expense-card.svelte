<script lang="ts">
    import type { ExpenseView } from '$lib/components/common/expense-maintain-dialog';
    import { Tag } from '$lib/components/common/tag';
    import { Badge } from '$lib/components/ui/badge';
    import * as Collapsible from '$lib/components/ui/collapsible';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import Separator from '$lib/components/ui/separator/separator.svelte';
    import type { ServiceTypes } from '$lib/service';
    import { cn, format_currency } from '$lib/utils';
    import { ChevronDown, Copy, EllipsisVertical, SquarePen, Trash } from '@lucide/svelte';

    type Props = {
        expense: ExpenseView;
        all_tags?: ServiceTypes.Tag[];
        duplicate: () => void;
        delete: () => void;
        edit: () => void;
        class?: string;
    };

    let { expense, all_tags = [], duplicate, delete: delete_expense, edit, class: className }: Props = $props();

    let tags_map = $derived(
        (all_tags ?? []).reduce(
            (acc, tag) => {
                acc[tag.id] = tag;
                return acc;
            },
            {} as Record<number, ServiceTypes.Tag>
        )
    );
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
                    <DropdownMenu.Item onclick={delete_expense} class="text-red-500">
                        <Trash />
                        Delete
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            {expense.item_name}
        </div>

        <div class="flex flex-row gap-4 items-center">
            {format_currency(expense.price)}
            <ChevronDown class="text-muted-foreground" size={16} />
        </div>
    </Collapsible.Trigger>
    <Collapsible.Content>
        <Separator class="my-4" />
        <div class="px-2">{expense.details}</div>
        <div class="flex flex-row justify-between px-2 text-muted-foreground">
            {#if expense.brand_name}<span>{expense.brand_name}</span>{/if}
            {#if expense.quantity}<span>{expense.quantity} {expense.item_unit}</span>{/if}
        </div>
        {#if expense.tag_ids?.length > 0}
            <div class="flex flex-wrap gap-1 px-2 pt-2">
                {#each expense.tag_ids as tag_id}
                    {@const tag = tags_map[tag_id]}
                    {#if tag}
                        <Tag {tag} />
                    {:else}
                        <Badge variant="outline" class="text-xs bg-gray-300">Unknown Tag ({tag_id})</Badge>
                    {/if}
                {/each}
            </div>
        {/if}
    </Collapsible.Content>
</Collapsible.Root>
