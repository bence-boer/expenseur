<script lang="ts">
	import StackedAreaChart from '$lib/components/charts/stacked-area-chart.svelte';
	import type { LineChartData } from '$lib/components/charts/types';
	import { type Period } from '$lib/components/common/period-selector';
	import PeriodSelector from '$lib/components/common/period-selector/period-selector.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import * as service from '$lib/service';
	import { format_date } from '$lib/utils';

	let spendings_data: LineChartData = $state({
		column_labels: [],
		lines: []
	});
	let loading: boolean = $state(true);

	const load_data = (start: string, end: string): void => {
		service.get_spendings_by_category_interval(start, end, 7).then((spendings) => {
			spendings_data = {
				column_labels: spendings.dates.map(format_date),
				lines: spendings.data.map(({ category, color, values }) => ({
					label: category,
					hidden: false,
					color,
					values
				}))
			};
			loading = false;
		});
	};

	const select_period = (value: Period): void => {
		load_data(value.start.toString(), value.end.toString());
	};
</script>

<div class="h-3/4 sm:h-5/6">
	<PeriodSelector select={select_period} class="mb-2" />
	{#if loading}
		<Skeleton class="mt-4 h-full" />
	{:else}
		<StackedAreaChart data={spendings_data!} />
	{/if}
</div>
