<script lang="ts">
    import { updated } from '$app/state';
    import { DeleteDialog } from '$lib/components/common/delete-dialog';
    import { ExpenseMaintainDialog, type ExpenseView } from '$lib/components/common/expense-maintain-dialog';
    import { PeriodSelector, type Period } from '$lib/components/common/period-selector';
    import { Tag } from '$lib/components/common/tag';
    import { DataTable, DataTablePagination } from '$lib/components/ui-custom/data-table';
    import { renderSnippet } from '$lib/components/ui/data-table';
    import { Separator } from '$lib/components/ui/separator';
    import { service, ServiceTypes } from '$lib/service';
    import { store } from '$lib/store';
    import { format_currency, format_date } from '$lib/utils';
    import type { ColumnDef, InitialTableState } from '@tanstack/table-core';
    import { toast } from 'svelte-sonner';

    let expenses: ServiceTypes.Expense[] = $state([]);
    let period: Period | undefined = $state();
    let loading: boolean = $state(true);

    const columns = [
        {
            accessorKey: '_date',
            header: 'Date',
            enableSorting: true,
            enableHiding: false,
            size: 120,
            cell: (props) => renderSnippet(date_cell, props.getValue() as string)
        },
        {
            accessorKey: 'item',
            header: 'Item',
            enableHiding: false
        },
        {
            accessorKey: '_details',
            header: 'Details'
        },
        {
            accessorKey: 'brand',
            header: 'Brand'
        },
        {
            accessorKey: 'category',
            header: 'Category'
        },
        {
            accessorKey: 'tags',
            header: 'Tags',
            cell: (props) => {
                const tags = props.getValue() as ServiceTypes.Tag[];
                return tags?.length ? renderSnippet(tags_cell, tags) : '';
            }
        },
        {
            accessorKey: 'quantity',
            header: 'Quantity',
            cell: (props) => `${props.getValue()} ${props.row.original.unit}`,
            enableSorting: true
        },
        {
            accessorKey: 'price',
            header: 'Price',
            cell: (props) => format_currency(props.getValue() as number),
            enableSorting: true,
            enableHiding: false
        },
        {
            accessorKey: 'vendor',
            header: 'Vendor'
        }
    ] as const satisfies ColumnDef<ServiceTypes.Expense>[];

    const initial_state = {
        columnVisibility: {
            // details: false,
            // brand: false,
            // category: false,
            // quantity: false,
            // vendor: false
        }
    } satisfies InitialTableState;

    let maintain_dialog_open = $state(false);
    let expense_to_edit: ExpenseView = $state();

    let delete_dialog_open = $state(false);
    let delete_item_id = $state<number | undefined>(undefined);

    const open_edit_dialog = (id: number): Promise<void> => {
        const expense = expenses.find((expense) => expense.id === id);
        expense_to_edit = {
            id: expense.id,
            item_id: expense.item_id,
            item_name: expense.item,
            item_unit: expense.unit,
            brand_id: expense.brand_id,
            brand_name: expense.brand,
            quantity: expense.quantity,
            price: expense.price,
            tag_ids: (expense.tags ?? []).map((tag) => tag.id),
            details: expense.details?.length ? (expense.details?.join(', ') as any) : undefined
        };
        maintain_dialog_open = true;
        return Promise.resolve();
    };

    const update_expense = async (expense_to_update: ExpenseView): Promise<void> =>
        service
            .update_expense(expense_to_update.id, {
                item_id: expense_to_update.item_id,
                tag_ids: expense_to_update.tag_ids,
                brand_id: expense_to_update.brand_id,
                quantity: expense_to_update.quantity,
                price: expense_to_update.price,
                details: expense_to_update.details?.split(', ')
            })
            .then((expense) =>
                Promise.all([expense, store.brands.data, store.categories.data, store.items.data, store.vendors.data, store.tags.data, store.units.data])
            )
            .then(([updated_expense, brands, categories, items, vendors, tags, units]) => {
                const index = expenses.findIndex(({ id }) => id === expense_to_update.id);
                const item = items.find((i) => i.id === updated_expense.item_id);
                const category = categories.find((c) => c.id === item.category_id);

                const modified: ServiceTypes.Expense & { _date: string; _details: string } = {
                    id: updated_expense.id,
                    brand: brands.find((b) => b.id === updated_expense.brand_id)?.name,
                    brand_id: updated_expense.brand_id,
                    category: category?.name,
                    category_color: category?.color,
                    category_id: category?.id,
                    date: updated_expense.date,
                    details: updated_expense.details,
                    item: item?.name,
                    item_id: updated_expense.item_id,
                    price: updated_expense.price,
                    quantity: updated_expense.quantity,
                    tags: updated_expense.tag_ids.map((id) => (tags as ServiceTypes.Tag[]).find((tag) => tag.id === id)),
                    unit: units.find((u) => u.id === item?.unit_id)?.name,
                    user_id: updated_expense.user_id,
                    vendor: vendors.find((v) => v.id === updated_expense.store_id)?.name,
                    vendor_id: updated_expense.store_id,
                    _date: format_date(updated_expense.date!),
                    _details: updated_expense.details?.length ? updated_expense.details?.join(', ') : '-'
                };
                expenses = [...expenses.slice(0, index), modified, ...expenses.slice(index + 1)];
                toast.success('Expense updated successfully');
            });

    const open_delete_dialog = (id: number): Promise<void> => {
        delete_item_id = id;
        delete_dialog_open = true;
        return Promise.resolve();
    };

    const delete_item = async (): Promise<void> => {
        return service.delete_expense(delete_item_id).then(() => {
            toast.success('Item deleted successfully');
            expenses = expenses!.filter((expense) => expense.id !== delete_item_id);
        });
    };

    const select_period = (value: Period): void => {
        period = value;
    };

    $effect.pre(() => {
        if (!period) return;

        loading = true;
        service
            .get_expenses({
                start_date: period.start.toString(),
                end_date: period.end.toString()
            })
            .then((data) => {
                expenses = data.map((expense) => ({
                    ...expense,
                    _date: format_date(expense.date!),
                    _details: expense.details?.length ? (expense.details?.join(', ') as any) : '-',
                    brand: expense.brand ?? '-'
                }));
                loading = false;
            });
    });
</script>

{#snippet tags_cell(tags: ServiceTypes.Tag[])}
    <div class="flex flex-wrap gap-1">
        {#each tags as tag}
            <Tag {tag} />
        {/each}
    </div>
{/snippet}

{#snippet date_cell(date: string)}
    <span class="text-nowrap">{date}</span>
{/snippet}

<div class="sm:container sm:py-10">
    <h1 class="mb-4 flex justify-between">
        <span class="text-2xl font-bold sm:text-4xl">Data</span>
        <PeriodSelector select={select_period} class="max-w-36" />
    </h1>

    <div class="flex flex-col gap-2">
        <DataTable data={expenses} {columns} {loading} {initial_state} delete_row={open_delete_dialog} edit_row={open_edit_dialog} filtered_column="item">
            <div slot="pagination" let:table>
                <Separator />
                <div class="py-2">
                    <DataTablePagination {table} />
                </div>
            </div>
        </DataTable>
    </div>
</div>

<ExpenseMaintainDialog bind:open={maintain_dialog_open} expense={expense_to_edit} mode="UPDATE" submit={update_expense} />

<DeleteDialog
    bind:open={delete_dialog_open}
    title="Delete Expense"
    description="Are you sure you want to delete this Expense? This action cannot be undone."
    delete={delete_item}
></DeleteDialog>
