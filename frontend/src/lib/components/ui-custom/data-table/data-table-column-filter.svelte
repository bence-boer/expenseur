<script lang="ts" generics="TData">
    import { Button } from '$lib/components/ui/button';
    import {
        DropdownMenu,
        DropdownMenuCheckboxItem,
        DropdownMenuContent,
        DropdownMenuLabel,
        DropdownMenuSeparator,
        DropdownMenuTrigger
    } from '$lib/components/ui/dropdown-menu';
    import { Filter } from '@lucide/svelte';
    import type { Column } from '@tanstack/table-core';

    let {
        column,
        title = 'Filter',
        options = [],
        value = $bindable(null)
    }: {
        column: Column<TData, unknown>;
        title?: string;
        options?: { label: string; value: string }[];
        value: string | null;
    } = $props();

    function handle_filter_change(new_value: string) {
        if (value === new_value) value = null;
        else value = new_value;

        column.setFilterValue(value);
    }

    function clearFilter() {
        value = null;
        column.setFilterValue(null);
    }

    $effect(() => {
        if (column.getFilterValue()) {
            value = column.getFilterValue() as string;
        }
    });
</script>

<DropdownMenu>
    <DropdownMenuTrigger>
        <Button variant="ghost" size="sm" class="h-8 data-[state=open]:bg-accent">
            <Filter class="h-4 w-4 mr-1" />
            {title}
            {#if value}
                <div class="ml-2 h-2 w-2 rounded-full bg-primary"></div>
            {/if}
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="w-[200px]">
        <DropdownMenuLabel>Filter by {title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {#if options.length}
            {#each options as option}
                <DropdownMenuCheckboxItem checked={value === option.value} onCheckedChange={() => handle_filter_change(option.value)}>
                    {option.label}
                </DropdownMenuCheckboxItem>
            {/each}
        {:else}
            <div class="px-2 py-1.5 text-sm">No filter options available</div>
        {/if}
        {#if value}
            <DropdownMenuSeparator />
            <div class="px-2">
                <Button variant="outline" size="sm" class="w-full" onclick={clearFilter}>Clear Filter</Button>
            </div>
        {/if}
    </DropdownMenuContent>
</DropdownMenu>
