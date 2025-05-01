import type { ColumnDef } from '@tanstack/table-core';
export type { ColumnDef } from '@tanstack/table-core';

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
