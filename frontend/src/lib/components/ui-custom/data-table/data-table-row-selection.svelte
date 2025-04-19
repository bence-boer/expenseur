<script lang="ts">
    import type { Table } from '@tanstack/table-core';

    let { table }: { table: Table<any> } = $props();
</script>

<div class="flex-1 text-sm text-muted-foreground">
    {table.getFilteredSelectedRowModel().rows.length} of{' '}
    {table.getFilteredRowModel().rows.length} row(s) selected.
</div>
