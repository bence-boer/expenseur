import type { ColumnDef } from '@tanstack/table-core';

// Re-export the ColumnDef type for ease of use
export type { ColumnDef } from '@tanstack/table-core';

// DataTable props type
export type DataTableProps<TData> = {
    data: TData[];
    columns: ColumnDef<TData, any>[];
    caption?: string;
    pageSize?: number;
    loading?: boolean;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    enablePagination?: boolean;
    enableColumnVisibility?: boolean;
    enableRowSelection?: boolean;
};
