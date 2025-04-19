<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import * as Select from '$lib/components/ui/select';
    import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/svelte';
    import type { Table } from '@tanstack/table-core';

    let { table }: { table: Table<any> } = $props();
</script>

<div class="flex items-center justify-between gap-4 lg:gap-8">
    <div class="flex items-center gap-2">
        <Select.Root type="single" bind:value={() => table.getState().pagination.pageSize.toString(), (value) => table.setPageSize(Number(value))}>
            <Select.Trigger class="h-8 w-16">
                {table.getState().pagination.pageSize}
            </Select.Trigger>
            <Select.Content class="w-12" align="start">
                {#each ['10', '20', '50', '100', '200'] as page_size}
                    <Select.Item value={page_size}>{page_size}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>
    </div>

    <div class="flex items-center gap-2">
        <Button variant="outline" class="hidden h-8 w-8 p-0 lg:flex" onclick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <span class="sr-only">Go to first page</span>
            <ChevronsLeft class="h-4 w-4" />
        </Button>
        <Button variant="outline" class="h-8 w-8 p-0" onclick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <span class="sr-only">Go to previous page</span>
            <ChevronLeft class="h-4 w-4" />
        </Button>
        <span class="flex items-center justify-center text-sm text-muted-foreground">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </span>
        <Button variant="outline" class="h-8 w-8 p-0" onclick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <span class="sr-only">Go to next page</span>
            <ChevronRight class="h-4 w-4" />
        </Button>
        <Button
            variant="outline"
            class="hidden h-8 w-8 p-0 lg:flex"
            onclick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
        >
            <span class="sr-only">Go to last page</span>
            <ChevronsRight class="h-4 w-4" />
        </Button>
    </div>
</div>
