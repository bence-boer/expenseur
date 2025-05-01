<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { SlidersHorizontal } from '@lucide/svelte';
    import type { Table } from '@tanstack/table-core';

    let { table }: { table: Table<any> } = $props();
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        <Button variant="outline" size="sm" class="ml-auto h-8">
            <SlidersHorizontal class="mr-2 h-4 w-4" />
            View
        </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end" class="w-[150px]">
        <DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
        <DropdownMenu.Separator />
        {#each table.getAllColumns().filter((column) => column.getCanHide()) as column (column.id)}
            <DropdownMenu.CheckboxItem checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                {column.id}
            </DropdownMenu.CheckboxItem>
        {/each}
    </DropdownMenu.Content>
</DropdownMenu.Root>
