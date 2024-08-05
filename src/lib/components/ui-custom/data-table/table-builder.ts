// import type { Column, Table } from "svelte-headless-table";
import type { ColumnOptions } from "./types";
// import type { AnyPlugins } from "svelte-headless-table/plugins";

export const default_columns_default: ColumnOptions = {
    class: "",
    sortable: true,
    filterable: true,
    hideable: false
}

// export const columns_for_table = <Item, Value, Plugins extends AnyPlugins>(
//     table: Table<Item, Plugins>,
//     column_data: ColumnData<Item, Value>[],
//     columns_default: Partial<ColumnOptions>
// ): Column<Item, Plugins>[] => {
//     columns_default = { ...default_columns_default, ...columns_default };
//     column_data = column_data.map(data => ({ ...columns_default, ...data }))

//     return column_data
//         .map(column_mapper)
//         .map(table.column);
// }

// const column_mapper = <Item, Value, Plugins extends AnyPlugins>({
//     accessor,
//     header,
//     cell,
//     sortable,
//     filterable
// }: ColumnData<Item, Value>)  => ({
//     accessor,
//     header,
//     cell,
//     plugins: {
//         sortBy: { disable: !sortable },
//         filter: { exclude: !filterable }
//     }
// })