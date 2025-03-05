export type DataTableProps<DATA> = {
    caption?: string;
    columns: Column<DATA, keyof DATA>[];
    data: DATA[];
    key?: keyof DATA;
    loading?: boolean;
};

export type Column<DATA, FIELD extends keyof DATA> = {
    header: string;
    header_class?: string;
    field: FIELD;
    field_class?: string;
    format?: (value: DATA[FIELD]) => string;
    footer?: (values: DATA[FIELD][]) => string;
    footer_class?: string;
};
