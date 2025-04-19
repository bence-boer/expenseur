<script lang="ts">
    import { PeriodSelector, type Period } from '$lib/components/common/period-selector';
    import { DataTable, DataTablePagination } from '$lib/components/ui-custom/data-table';
    import type { ColumnDef, InitialTableState } from '@tanstack/table-core';
    import { Separator } from '$lib/components/ui/separator';
    import { service, ServiceTypes } from '$lib/service';
    import { format_currency, format_date } from '$lib/utils';
    import { toast } from 'svelte-sonner';
    import { DeleteDialog } from '$lib/components/common/delete-dialog';

    let purchases: ServiceTypes.Purchase[] = $state([]);
    let period: Period | undefined = $state();
    let loading: boolean = $state(true);

    const columns = [
        {
            accessorKey: 'date',
            header: 'Date',
            enableSorting: true,
            enableHiding: false,
            size: 120
        },
        {
            accessorKey: 'item',
            header: 'Item',
            enableHiding: false
        },
        {
            accessorKey: 'details',
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
            accessorKey: 'store',
            header: 'Store'
        }
    ] as const satisfies ColumnDef<ServiceTypes.Purchase>[];

    const initial_state = {
        columnVisibility: {
            details: false,
            brand: false,
            category: false,
            quantity: false,
            store: false
        }
    } satisfies InitialTableState;

    let delete_dialog_open = $state(false);
    let delete_item_id = $state<number | undefined>(undefined);

    const open_delete_dialog = (id: number): Promise<void> => {
        delete_item_id = id;
        delete_dialog_open = true;
        return Promise.resolve();
    };

    const delete_item = async (): Promise<void> => {
        return service
            .delete_purchase(String(delete_item_id))
            .then(() => {
                toast.success('Item deleted successfully');
                purchases = purchases!.filter((purchase) => purchase.id !== delete_item_id);
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    const select_period = (value: Period): void => {
        period = value;
    };

    $effect.pre(() => {
        if (!period) return;

        loading = true;
        service
            .get_purchases({
                start_date: period.start.toString(),
                end_date: period.end.toString()
            })
            .then((data) => {
                purchases = data.map((item) => ({
                    ...item,
                    date: format_date(item.date!),
                    details: item.details?.length ? (item.details?.join(', ') as any) : '-',
                    brand: item.brand ?? '-'
                }));
                loading = false;
            });
    });
</script>

<div class="sm:container sm:py-10">
    <h1 class="mb-4 flex justify-between">
        <span class="text-2xl font-bold sm:text-4xl">Data</span>
        <PeriodSelector select={select_period} class="max-w-36" />
    </h1>

    <div class="flex flex-col gap-2">
        <DataTable data={purchases} {columns} {loading} {initial_state} delete_row={open_delete_dialog} filtered_column="item">
            <div slot="pagination" let:table>
                <Separator />
                <div class="py-2">
                    <DataTablePagination {table} />
                </div>
            </div>
        </DataTable>
    </div>
</div>

<DeleteDialog bind:open={delete_dialog_open} title="Delete Expense" description="Are you sure you want to delete this Expense?" delete={delete_item}
></DeleteDialog>
