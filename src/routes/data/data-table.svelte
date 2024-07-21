<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import {
		addHiddenColumns,
		addPagination,
		addSelectedRows,
		addSortBy,
		addTableFilter
	} from 'svelte-headless-table/plugins';
	import { writable } from 'svelte/store';
	import type { Tables } from '../../types/supabase';
	import DataTableActions from './data-table-actions.svelte';
	import DataTableCheckbox from './data-table-checkbox.svelte';

	export let data: Tables<'all_tables_view'>[];
	const _data = writable(data);
	type Column = keyof (typeof data)[number];

	const table = createTable(_data, {
		page: addPagination(),
		sortBy: addSortBy(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		}),
		hide: addHiddenColumns(),
		select: addSelectedRows()
	});

	export let delete_item: ((id: number) => Promise<void>) | ((id: string) => Promise<void>);
	// TODO: fix fucked up function types
	const _delete_item = async (id: number): Promise<void> => {
		await (delete_item as any)(id);
		_data.update((data) => data.filter((row) => row.id !== id));
	};

	// TODO: remove unknown for proper type checking
	const right_aligned: (Column | unknown)[] = ['quantity', 'price'];
	const sortable: (Column | unknown)[] = ['date', 'price'];
	const filterable: Column[] = ['item', 'details', 'brand', 'category', 'store'];
	const hideable: Column[] = ['details', 'brand', 'category', 'quantity', 'unit', 'store'];

	const columns = table.createColumns([
		table.column({
			accessor: 'id',
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTableCheckbox, {
					checked: allPageRowsSelected
				});
			},
			cell: ({ row }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(DataTableCheckbox, {
					checked: isSelected
				});
			},
			plugins: {
				sortBy: { disable: true },
				filter: { exclude: true }
			}
		}),
		table.column({
			accessor: 'date',
			header: 'Date',
			cell: ({ value }) => new Date(value!).toLocaleDateString(),
			plugins: {
				sortBy: { disable: !sortable.includes('date') },
				filter: { exclude: !filterable.includes('date') }
			}
		}),
		table.column({
			accessor: 'item',
			header: 'Item',
			plugins: {
				sortBy: { disable: !sortable.includes('item') },
				filter: { exclude: !filterable.includes('item') }
			}
		}),
		table.column({
			accessor: 'details',
			header: 'Details',
			cell: ({ value }) => value?.join(', ') || '-',
			plugins: {
				sortBy: { disable: !sortable.includes('details') },
				filter: { exclude: !filterable.includes('details') }
			}
		}),
		table.column({
			accessor: 'brand',
			header: 'Brand',
			plugins: {
				sortBy: { disable: !sortable.includes('brand') },
				filter: { exclude: !filterable.includes('brand') }
			}
		}),
		table.column({
			accessor: 'category',
			header: 'Category',
			plugins: {
				sortBy: { disable: !sortable.includes('category') },
				filter: { exclude: !filterable.includes('category') }
			}
		}),
		table.column({
			accessor: 'quantity',
			header: 'Quantity',
			plugins: {
				sortBy: { disable: !sortable.includes('quantity') },
				filter: { exclude: !filterable.includes('quantity') }
			}
		}),
		table.column({
			accessor: 'unit',
			header: 'Unit',
			plugins: {
				sortBy: { disable: !sortable.includes('unit') },
				filter: { exclude: !filterable.includes('unit') }
			}
		}),
		table.column({
			accessor: 'price',
			header: 'Price',
			cell: ({ value }) =>
				new Intl.NumberFormat('hu-HU', {
					style: 'currency',
					currency: 'HUF',
					maximumFractionDigits: 0,
					useGrouping: true
				}).format(value!),
			plugins: {
				sortBy: { disable: !sortable.includes('price') },
				filter: { exclude: !filterable.includes('price') }
			}
		}),
		table.column({
			accessor: 'store',
			header: 'Store',
			plugins: {
				sortBy: { disable: !sortable.includes('store') },
				filter: { exclude: !filterable.includes('store') }
			}
		}),
		table.column({
			accessor: ({ id }) => id,
			header: '',
			cell: ({ value }) =>
				createRender(DataTableActions, {
					id: value!,
					delete_item: _delete_item
				}),
			plugins: {
				sortBy: { disable: true },
				filter: { exclude: true }
			}
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, flatColumns, rows } =
		table.createViewModel(columns);
	const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
	const { filterValue } = pluginStates.filter;
	const { hiddenColumnIds } = pluginStates.hide;
	const { selectedDataIds } = pluginStates.select;

	const ids: Column[] = flatColumns.map((column) => column.id);
	let id_hidden = Object.fromEntries(ids.map((id) => [id, true]));

	$: $hiddenColumnIds = Object.entries(id_hidden)
		.filter(([, hide]) => !hide)
		.map(([id]) => id);
</script>

<div>
	<div class="flex items-center gap-4 py-4">
		<Input
			class="max-w-sm text-ellipsis"
			placeholder={'Filter by ' +
				[...filterable]
					.map((column) => column.charAt(0).toUpperCase() + column.slice(1))
					.join(', ')}
			type="text"
			bind:value={$filterValue}
		/>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="outline" class="ml-auto" builders={[builder]}>
					Columns <ChevronDown class="ml-2 h-4 w-4" />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				{#each flatColumns as col}
					{#if hideable.includes(col.id)}
						<DropdownMenu.CheckboxItem bind:checked={id_hidden[col.id]}>
							{col.header}
						</DropdownMenu.CheckboxItem>
					{/if}
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs} class="[&:has([role=checkbox])]:pl-3">
										<div class={right_aligned.includes(cell.id) ? 'text-right' : ''}>
											{#if sortable.includes(cell.id)}
												<Button variant="ghost" on:click={props.sortBy.toggle}>
													<Render of={cell.render()} />
													<ArrowUpDown class={'ml-2 h-4 w-4'} />
												</Button>
											{:else}
												<Render of={cell.render()} />
											{/if}
										</div>
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && 'selected'}>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell {...attrs}>
										<div class={['quantity', 'price'].includes(cell.id) ? 'text-right' : ''}>
											<Render of={cell.render()} />
										</div>
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-4 py-4">
		<div class="flex-1 text-sm text-muted-foreground">
			{Object.keys($selectedDataIds).length} of{' '}
			{$rows.length} row(s) selected.
		</div>
		<Button
			variant="outline"
			size="sm"
			on:click={() => ($pageIndex = $pageIndex - 1)}
			disabled={!$hasPreviousPage}>Previous</Button
		>
		<Button
			variant="outline"
			size="sm"
			disabled={!$hasNextPage}
			on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
		>
	</div>
</div>
