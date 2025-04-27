<script lang="ts" generics="TData extends {id: string | number}, TValue">
    import { FlexRender } from '$lib/components/ui/data-table';
    import * as TableComponent from '$lib/components/ui/table';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import type { Table } from '@tanstack/table-core';

    import { ArrowDown, ArrowUp, ArrowUpDown } from '@lucide/svelte';

    type Props = {
        table: Table<TData>;
    };

    let { table }: Props = $props();
</script>

<TableComponent.Header>
    {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <TableComponent.Row>
            {#each headerGroup.headers as header (header.id)}
                <TableComponent.Head colspan={header.colSpan} class="p-1">
                    {#if !header.isPlaceholder}
                        <div class="flex flex-col gap-1">
                            {#if header.column.getCanSort()}
                                <Button
                                    variant="ghost"
                                    class="flex items-center gap-2 px-2 py-1 w-full h-auto justify-center {header.column.getIsSorted()
                                        ? 'bg-muted text-primary'
                                        : ''}"
                                    onclick={() => header.column.getCanSort() && header.column.toggleSorting()}
                                >
                                    <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                                    {#if header.column.getCanSort()}
                                        {#if header.column.getIsSorted() === 'asc'}
                                            <ArrowUp class="size-3" />
                                        {:else if header.column.getIsSorted() === 'desc'}
                                            <ArrowDown class="size-3" />
                                        {:else}
                                            <ArrowUpDown class="opacity-40 size-3" />
                                        {/if}
                                    {/if}
                                </Button>
                            {:else}
                                <div class="text-center gap-2 px-2 py-1 w-full justify-center active:bg-transparent">
                                    <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                                </div>
                            {/if}

                            {#if header.column.getCanFilter()}
                                <Input
                                    type="text"
                                    value={(header.column.getFilterValue() ?? '') as string}
                                    oninput={(e) => header.column.setFilterValue(e.currentTarget.value)}
                                    class="h-7 px-1 text-xs border rounded"
                                    onclick={(e) => e.stopPropagation()}
                                />
                            {/if}
                        </div>
                    {/if}
                </TableComponent.Head>
            {/each}
        </TableComponent.Row>
    {/each}
</TableComponent.Header>
