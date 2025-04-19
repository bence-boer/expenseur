<script lang="ts">
    import { Input } from '$lib/components/ui/input';
    import type { Table } from '@tanstack/table-core';
    import { Button } from '$lib/components/ui/button';
    import { Trash2, X } from '@lucide/svelte';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

    let {
        table,
        filtered_column: filter_column,
        placeholder = 'Filter...'
    }: {
        table: Table<any>;
        filtered_column: string;
        placeholder?: string;
    } = $props();

    function clear_filters() {
        if (filter_column) table.getColumn(filter_column)?.setFilterValue('');
    }
</script>

<div class="flex flex-1 items-center gap-2">
    <div class="relative flex-1">
        <Input
            {placeholder}
            class="max-w-sm relative pr-8"
            type="text"
            value={(table.getColumn(filter_column)?.getFilterValue() as string) ?? ''}
            onchange={(e) => {
                table.getColumn(filter_column)?.setFilterValue(e.currentTarget.value);
            }}
            oninput={(e) => {
                table.getColumn(filter_column)?.setFilterValue(e.currentTarget.value);
            }}
        />
        {#if table.getState().columnFilters.length > 0}
            <Button variant="ghost" onclick={clear_filters} class="h-8 px-2 lg:px-3 absolute right-0 top-1/2 -translate-y-1/2">
                <X class="h-4 w-4" />
            </Button>
        {/if}
    </div>

    <DropdownMenu.Root>
        <DropdownMenu.Trigger>
            {#snippet child({ props })}
                <Button {...props} variant="outline">Columns</Button>
            {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
            {#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
                <DropdownMenu.CheckboxItem class="capitalize" bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}>
                    {column.id}
                </DropdownMenu.CheckboxItem>
            {/each}
        </DropdownMenu.Content>
    </DropdownMenu.Root>
</div>
