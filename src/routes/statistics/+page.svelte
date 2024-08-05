<script lang="ts">
	import type { Data } from '$lib/components/charts/data';
	import StackedAreaChart from '$lib/components/charts/stacked-area-chart.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import * as service from '$lib/service';
	import {
		CalendarDate,
		type DateValue,
		endOfMonth,
		getLocalTimeZone,
		parseDuration,
		startOfMonth,
		today
	} from '@internationalized/date';

	let start_date: DateValue = startOfMonth(
		today(getLocalTimeZone()).subtract(parseDuration('P2M'))
	);
	let end_date: DateValue = today(getLocalTimeZone());

	let spendings_data: Data[] = [];
	let loading = true;
	service
		.get_spendings_by_category_interval(start_date.toString(), end_date.toString(), 7)
		.then((data) => {
			spendings_data = data.map((item) => ({
				...(item.result as Record<string, number>),
				x: new Date(item.date).valueOf()
			}));
			loading = false;
		});
</script>

{#if loading}
	<Skeleton class="h-64" />
{:else}
	<StackedAreaChart xAxisLabel="Time" data={spendings_data} />
{/if}
