<script lang="ts">
	import StackedAreaChart from '$lib/components/charts/stacked-area-chart.svelte';
	import type { LineChartData } from '$lib/components/charts/types';
	import { type Period, default_period } from '$lib/components/common/period-selector';
	import PeriodSelector from '$lib/components/common/period-selector/period-selector.svelte';
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

	let spendings_data: LineChartData;
	let loading = true;

	const load_data = (start: string, end: string) =>
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

	load_data(default_period.value.start.toString(), default_period.value.end.toString());

	const select_period = (value: Period) => {
		load_data(value.start.toString(), value.end.toString());
	};
</script>

{#if loading}
	<Skeleton class="h-64" />
{:else}
	<div class="h-3/4 sm:h-5/6">
		<PeriodSelector select={select_period} class="mb-2" />
		<StackedAreaChart data={spendings_data} />
	</div>
{/if}
