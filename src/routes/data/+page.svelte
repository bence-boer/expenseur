<script lang="ts">
	import { PeriodSelector, type Period } from '$lib/components/common/period-selector';
	import DataTable from '$lib/components/ui-custom/data-table';
	import { Separator } from '$lib/components/ui/separator';
	import * as service from '$lib/service';
	import { toast } from 'svelte-sonner';
	import type { Tables } from '../../types/supabase';

	const delete_item = async (id: number): Promise<void> => {
		return service
			.delete_purchase(id)
			.then(() => {
				toast.success('Item deleted successfully');
				purchases = purchases.filter((purchase) => purchase.id !== id);
			})
			.catch((error) => {
				toast.error(error.message);
			});
	};

	let period: Period;

	const select_period = (value: Period): void => {
		period = value;
	};

	let purchases: Tables<'all_tables_view'>[];
	$: if (period)
		service.get_detailed_purchases(period.start, period.end).then((data) => {
			purchases = data;
		});
</script>

<div class="sm:container sm:py-10">
	<h1 class="mb-4 flex justify-between">
		<span class="text-2xl font-bold sm:text-4xl">Data</span>
		<PeriodSelector select={select_period} class="max-w-36" />
	</h1>
	<Separator class="sm:mb-8" />
	<DataTable data={purchases} {delete_item} loading={!purchases} />
</div>
