<script lang="ts">
    import { DeleteDialog } from '$lib/components/common/delete-dialog';
    import { ExpenseMaintainDialog, type ExpenseView } from '$lib/components/common/expense-maintain-dialog';
    import { PeriodSelector, type Period } from '$lib/components/common/period-selector';
    import { Tag } from '$lib/components/common/tag';
    import { DataTable, DataTablePagination } from '$lib/components/ui-custom/data-table';
    import { renderSnippet } from '$lib/components/ui/data-table';
    import { Separator } from '$lib/components/ui/separator';
    import { service, ServiceTypes } from '$lib/service';
    import { format_currency, format_date } from '$lib/utils';
    import type { ColumnDef, InitialTableState } from '@tanstack/table-core';
    import { toast } from 'svelte-sonner';
    import { onMount } from 'svelte';
    import { store } from '$lib/store';

    let users: ServiceTypes.User[] = $state([]);
    let loading: boolean = $state(true);

    const columns = [
        {
            accessorKey: 'email',
            header: 'Email',
            enableHiding: false,
            enableSorting: true
        },
        {
            accessorKey: 'roles',
            header: 'Roles',
            cell: (props) => (props.getValue() as string[]).filter(Boolean).join(', ')
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
            cell: (props) => props.getValue() as string
        },
        {
            accessorKey: 'last_sign_in_at',
            header: 'Last Sign In',
            cell: (props) => format_date(props.getValue() as string),
            enableSorting: true
        },
        {
            accessorKey: 'created_at',
            header: 'Created At',
            cell: (props) => format_date(props.getValue() as string),
            enableSorting: true
        }
    ] as const satisfies ColumnDef<ServiceTypes.User>[];

    const initial_state = {
        columnVisibility: {}
    } satisfies InitialTableState;

    onMount(async () => {
        loading = true;
        try {
            users = await service.get_users();
        } catch (error) {
            toast.error('Failed to fetch users.');
            console.error('Error fetching users:', error);
        } finally {
            loading = false;
        }
    });
</script>

<div class="sm:container sm:py-10">
    <h1 class="mb-4 flex justify-between">
        <span class="text-2xl font-bold sm:text-4xl">Users</span>
    </h1>

    <div class="flex flex-col gap-2">
        <DataTable data={users} {columns} {loading} {initial_state} delete_row={() => void 0} edit_row={() => void 0} filtered_column="email">
            <div slot="pagination" let:table>
                <Separator />
                <div class="py-2">
                    <DataTablePagination {table} />
                </div>
            </div>
        </DataTable>
    </div>
</div>
