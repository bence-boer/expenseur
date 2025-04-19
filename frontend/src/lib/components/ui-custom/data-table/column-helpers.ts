import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableCheckbox from './data-table-checkbox.svelte';

/**
 * Creates a selection column with checkboxes for row selection
 * @returns A selection column definition with properly configured header and cell
 */
export function createSelectionColumn<TData, TValue>(): ColumnDef<TData, TValue> {
    return {
        id: 'select',
        header: ({ table }) =>
            renderComponent(DataTableCheckbox, {
                checked: table.getIsAllPageRowsSelected(),
                onCheckedChange: (value: TValue) => table.toggleAllPageRowsSelected(!!value),
            }),
        cell: ({ row }) =>
            renderComponent(DataTableCheckbox, {
                checked: row.getIsSelected(),
                onCheckedChange: (value: TValue) => row.toggleSelected(!!value),
            }),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 40,
        minSize: 40,
        maxSize: 40,
    };
}

export const default_columns_default = <TData>(): Partial<ColumnDef<TData>> => ({
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
});
