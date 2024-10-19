<script lang="ts">
	import StackedAreaChart from '$lib/components/charts/stacked-area-chart.svelte';
	import type { LineChartData } from '$lib/components/charts/types';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import * as service from '$lib/service';
	import { format_date } from '$lib/utils';
	import {
		type DateValue,
		getLocalTimeZone,
		parseDuration,
		startOfMonth,
		today
	} from '@internationalized/date';

	let start_date: DateValue = startOfMonth(
		today(getLocalTimeZone()).subtract(parseDuration('P2M'))
	);
	let end_date: DateValue = today(getLocalTimeZone());

	let spendings_data: LineChartData;
	let loading = true;
	service
		.get_spendings_by_category_interval(start_date.toString(), end_date.toString(), 7)
		.then((spendings) => {
			spendings_data = {
				column_labels: spendings.dates.map(format_date),
				lines: spendings.data.map(({ category, color, values }) => ({
					label: category,
					color,
					values
				}))
			};
			loading = false;
		});
</script>

{#if loading}
	<Skeleton class="h-64" />
{:else}
	<StackedAreaChart data={spendings_data} />
{/if}
