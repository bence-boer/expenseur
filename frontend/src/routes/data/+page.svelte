<script lang="ts">
	import { PeriodSelector, type Period } from '$lib/components/common/period-selector';
	import { DataTable, type Column } from '$lib/components/ui-custom/data-table';
	import { Separator } from '$lib/components/ui/separator';
	import * as service from '$lib/service';
	import { toast } from 'svelte-sonner';
	import type { Tables } from '../../types/supabase';
	import { format_currency, format_date } from '$lib/utils';

	type Purchase = Tables<'all_tables_view'>;

	let purchases: Purchase[] = $state([]);
	let period: Period | undefined = $state();
	let loading: boolean = $state(true);

	const table_columns: Column<Purchase, keyof Purchase>[] = [
		{ header: 'Date', field: 'date', header_class: 'min-w-24' },
		{ header: 'Item', field: 'item' },
		{ header: 'Details', field: 'details' },
		{ header: 'Brand', field: 'brand' },
		{ header: 'Category', field: 'category' },
		{
			header: 'Quantity',
			field: 'quantity',
			field_class: 'text-right',
			header_class: 'text-right'
		},
		{ header: 'Unit', field: 'unit' },
		{ header: 'Price', field: 'price', field_class: 'text-right', header_class: 'text-right' },
		{ header: 'Store', field: 'store' }
	];

	const delete_item = async (id: number): Promise<void> => {
		return service
			.delete_purchase(id)
			.then(() => {
				toast.success('Item deleted successfully');
				purchases = purchases!.filter((purchase) => purchase.id !== id);
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
		service.get_detailed_purchases(period.start, period.end).then((data) => {
			purchases = data.map((item) => ({
				...item,
				date: format_date(item.date!),
				details: item.details?.length ? (item.details?.join(', ') as any) : '-',
				brand: item.brand ?? '-',
				price: format_currency(item.price!) as any
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
	<Separator class="sm:mb-8" />
	<DataTable data={purchases} columns={table_columns} {loading} />
</div>
