<script lang="ts">
    import * as Collapsible from '$lib/components/ui/collapsible';
    import Separator from '$lib/components/ui/separator/separator.svelte';
    import type { ServiceTypes } from '$lib/service';
    import { cn, format_currency, format_date } from '$lib/utils';
    import { ChevronDown, FileText } from '@lucide/svelte';
    import type { ExpenseGroup } from './types.ts';

    type Props = {
        group: ExpenseGroup;
        ondetailsclick: (expense: ServiceTypes.Expense) => void;
        class?: string;
    };

    let { group, ondetailsclick, class: className }: Props = $props();
</script>

<Collapsible.Root class={cn('bg-primary-foreground rounded-md px-4 py-3 border border-inactive', className)}>
    <Collapsible.Trigger class="flex flex-row justify-between gap-2 w-full">
        <div class="flex-1 flex flex-row gap-4 items-center">
            {format_date(group.date)}
        </div>

        <div class="flex flex-row gap-4 items-center">
            {format_currency(group.total)}
            <ChevronDown class="text-muted-foreground" size={16} />
        </div>
    </Collapsible.Trigger>
    <Collapsible.Content>
        <Separator class="my-3" />
        <div class="flex flex-col gap-1">
            {#each group.expenses as expense}
                <div class="flex flex-row justify-between gap-2 w-full">
                    <div class="flex-1 flex flex-row gap-4 items-center">
                        {expense.item}
                    </div>

                    <div class="flex flex-row items-center gap-2">
                        {format_currency(expense.price)}
                        <span class="text-muted-foreground px-2 mr-[-0.5rem]">
                            <FileText size={16} onclick={() => ondetailsclick(expense)} />
                        </span>
                    </div>
                </div>
            {/each}
        </div>
    </Collapsible.Content>
</Collapsible.Root>
