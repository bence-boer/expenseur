<script lang="ts">
    import { DeleteDialog } from '$lib/components/common/delete-dialog';
    import { PeriodSelector, type Period } from '$lib/components/common/period-selector';
    import { PurchaseMaintainDialog, type PurchaseView } from '$lib/components/common/purchase-maintain-dialog';
    import Tag from '$lib/components/common/tag/tag.svelte';
    import { DataTable, DataTablePagination } from '$lib/components/ui-custom/data-table';
    import { renderSnippet } from '$lib/components/ui/data-table';
    import { Separator } from '$lib/components/ui/separator';
    import { service, ServiceTypes } from '$lib/service';
    import { format_currency, format_date } from '$lib/utils';
    import type { ColumnDef, InitialTableState } from '@tanstack/table-core';
    import { toast } from 'svelte-sonner';

    let purchases: ServiceTypes.Purchase[] = $state([]);
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
            accessorKey: 'store',
            header: 'Store'
        }
    ] as const satisfies ColumnDef<ServiceTypes.Purchase>[];

    const initial_state = {
        columnVisibility: {
            // details: false,
            // brand: false,
            // category: false,
            // quantity: false,
            // store: false
        }
    } satisfies InitialTableState;

    let maintain_dialog_open = $state(false);
    let purchase_to_edit: PurchaseView = $state();

    let delete_dialog_open = $state(false);
    let delete_item_id = $state<number | undefined>(undefined);

    const open_edit_dialog = (id: number): Promise<void> => {
        const purchase = purchases.find((purchase) => purchase.id === id);
        purchase_to_edit = {
            ...purchase,
            details: purchase.details?.length ? (purchase.details?.join(', ') as any) : undefined
        };
        maintain_dialog_open = true;
        return Promise.resolve();
    };

    const update_purchase = async (purchase_to_update: ServiceTypes.Purchase): Promise<void> =>
        service
            .update_purchase(purchase_to_update.id, {
                item_id: purchase_to_update.item_id,
                tag_ids: purchase_to_update.tag_ids,
                brand_id: purchase_to_update.brand_id,
                quantity: purchase_to_update.quantity,
                price: purchase_to_update.price,
                details: purchase_to_update.details?.split(', ')
            })
            .then((updated_purchase) => {
                const index = purchases.findIndex(({ id }) => id === purchase_to_update.id);
                purchases = [...purchases.slice(0, index), purchase_to_update, ...purchases.slice(index + 1)];
                toast.success('Purchase updated successfully');
            })
            .catch((error) => {
                toast.error(error.message);
            });

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
                purchases = data.map((purchase) => ({
                    ...purchase,
                    _date: format_date(purchase.date!),
                    _details: purchase.details?.length ? (purchase.details?.join(', ') as any) : '-',
                    brand: purchase.brand ?? '-'
                }));
                loading = false;
            });
    });
</script>

{#snippet tags_cell(tags: ServiceTypes.Tag[])}
    {#each tags as tag}
        <Tag {tag} />
    {/each}
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
        <DataTable data={purchases} {columns} {loading} {initial_state} delete_row={open_delete_dialog} edit_row={open_edit_dialog} filtered_column="item">
            <div slot="pagination" let:table>
                <Separator />
                <div class="py-2">
                    <DataTablePagination {table} />
                </div>
            </div>
        </DataTable>
    </div>
</div>

<PurchaseMaintainDialog bind:open={maintain_dialog_open} purchase={purchase_to_edit} mode="UPDATE" submit={update_purchase} />

<DeleteDialog bind:open={delete_dialog_open} title="Delete Expense" description="Are you sure you want to delete this Expense?" delete={delete_item}
></DeleteDialog>
