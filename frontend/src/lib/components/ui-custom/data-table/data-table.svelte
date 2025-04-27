<script lang="ts" generics="TData extends {id: string | number}, TValue">
    import { createSvelteTable, FlexRender, renderComponent } from '$lib/components/ui/data-table';
    import * as Table from '$lib/components/ui/table';
    import type {
        ColumnDef,
        ColumnFiltersState,
        InitialTableState,
        PaginationState,
        RowSelectionState,
        SortingState,
        VisibilityState
    } from '@tanstack/table-core';
    import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/table-core';
    import { default_columns_default } from './column-helpers';
    import DataTableActions from './data-table-actions.svelte';
    import DataTableCheckbox from './data-table-checkbox.svelte';
    import DataTablePagination from './data-table-pagination.svelte';
    import DataTableSkeleton from './data-table-skeleton.svelte';
    import DataTableToolbar from './data-table-toolbar.svelte';
    import DataTableHeader from './data-table-header.svelte';

    type DataTableProps<TData, TValue> = {
        data: TData[];
        columns: ColumnDef<TData, TValue>[];
        columns_default?: Partial<ColumnDef<TData, TValue>>;
        initial_state?: InitialTableState;
        enable_selection?: boolean;
        enable_actions?: boolean;
        class?: string;
        caption?: string;
        pageSize?: number;
        loading?: boolean;
        enableRowSelection?: boolean;
        filtered_column?: keyof TData & string;
        delete_row?: (id: string | number) => Promise<void>;
        edit_row?: (id: string | number) => Promise<void>;
    };

    let {
        data = [],
        columns = [],
        columns_default = undefined,
        initial_state = undefined,
        enable_selection = false,
        enable_actions = true,
        caption,
        pageSize: page_size = 10,
        class: className = '',
        loading = false,
        filtered_column,
        delete_row,
        edit_row,
        ...restProps
    }: DataTableProps<TData, TValue> = $props();

    let sorting = $state<SortingState>([]);
    let columnFilters = $state<ColumnFiltersState>([]);
    let columnVisibility = $state<VisibilityState>({});
    let rowSelection = $state<RowSelectionState>({});
    let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: page_size });

    const selection_column: ColumnDef<TData, TValue> = {
        id: 'select',
        header: ({ table }) =>
            renderComponent(DataTableCheckbox, {
                checked: table.getIsAllPageRowsSelected(),
                indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
                onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
                'aria-label': 'Select all'
            }),
        cell: ({ row }) =>
            renderComponent(DataTableCheckbox, {
                checked: row.getIsSelected(),
                onCheckedChange: (value) => row.toggleSelected(!!value),
                'aria-label': 'Select row'
            }),
        enableSorting: false,
        enableHiding: false
    };

    const actions_column: ColumnDef<TData, TValue> = {
        id: 'actions',
        cell: ({ row }) => renderComponent(DataTableActions, { delete: () => delete_row(row.original.id), edit: () => edit_row(row.original.id) }),
        enableSorting: false,
        enableHiding: false
    };

    let table = $derived(
        createSvelteTable({
            data,
            defaultColumn: {
                ...default_columns_default<TData>(),
                ...columns_default
            },
            columns: [...(enable_selection ? [selection_column] : []), ...columns, ...(enable_actions ? [actions_column] : [])],
            getCoreRowModel: getCoreRowModel(),
            getSortedRowModel: getSortedRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            onSortingChange: (updater) => {
                if (typeof updater === 'function') sorting = updater(sorting);
                else sorting = updater;
            },
            onColumnFiltersChange: (updater) => {
                if (typeof updater === 'function') columnFilters = updater(columnFilters);
                else columnFilters = updater;
            },
            onColumnVisibilityChange: (updater) => {
                if (typeof updater === 'function') columnVisibility = updater(columnVisibility);
                else columnVisibility = updater;
            },
            onRowSelectionChange: (updater) => {
                if (typeof updater === 'function') rowSelection = updater(rowSelection);
                else rowSelection = updater;
            },
            onPaginationChange: (updater) => {
                if (typeof updater === 'function') pagination = updater(pagination);
                else pagination = updater;
            },
            state: {
                get sorting() {
                    return sorting;
                },
                get columnFilters() {
                    return columnFilters;
                },
                get columnVisibility() {
                    return columnVisibility;
                },
                get rowSelection() {
                    return rowSelection;
                },
                get pagination() {
                    return pagination;
                },
                ...(initial_state as any)
            },
            enableSorting: true,
            enableRowSelection: enable_selection
        })
    );
</script>

{#if loading}
    <DataTableSkeleton />
{:else}
    <!-- <DataTableToolbar {table} {filtered_column} /> -->
    <div class="relative w-full overflow-auto rounded-md border">
        <Table.Root class={className} {...restProps}>
            {#if caption}
                <Table.Caption>{caption}</Table.Caption>
            {/if}
            <DataTableHeader {table} />
            <Table.Body>
                {#if table.getRowModel().rows?.length}
                    {#each table.getRowModel().rows as row (row.id)}
                        <Table.Row
                            data-state={row.getIsSelected() ? 'selected' : undefined}
                            onclick={(event) => {
                                if (enable_selection && (event.target as HTMLElement).tagName !== 'BUTTON') {
                                    row.toggleSelected(!row.getIsSelected());
                                }
                            }}
                        >
                            {#each row.getVisibleCells() as cell (cell.id)}
                                <Table.Cell>
                                    <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
                                </Table.Cell>
                            {/each}
                        </Table.Row>
                    {/each}
                {:else}
                    <Table.Row>
                        <Table.Cell colspan={columns.length} class="h-16 text-center">No results.</Table.Cell>
                    </Table.Row>
                {/if}
            </Table.Body>
        </Table.Root>
    </div>
    <DataTablePagination {table} />
{/if}
