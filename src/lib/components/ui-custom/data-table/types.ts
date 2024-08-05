import type { DataLabel, HeaderLabel } from "svelte-headless-table";
import type { AnyPlugins } from "svelte-headless-table/plugins";

export type ColumnOptions = {
    class: string;
    sortable: boolean;
    filterable: boolean;
    hideable: boolean;
}

export type ColumnData<Item, Value> = Partial<ColumnOptions> & {
    accessor: keyof Item | ((item: Item) => Value);
    header: HeaderLabel<unknown, AnyPlugins> | string;
    cell: DataLabel<Item>;
}
