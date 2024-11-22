<script lang="ts">
	import DonutChart from '$lib/components/charts/donut-chart.svelte';
	import type { DonutDataPoint } from '$lib/components/charts/types';
	import { PeriodSelector, type Period } from '$lib/components/common/period-selector';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table';
	import * as service from '$lib/service';
	import type { FunctionReturns } from '$lib/types';
	import { cn } from '$lib/utils';
	import { CalendarDate } from '@internationalized/date';
	import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-svelte';
	import { supabase } from '../supabase-client';
	import { currency_formatter } from './../lib/consts';
	import { Skeleton } from '$lib/components/ui/skeleton';

	let period: Period;

	const select_period = (value: Period): void => {
		period = value;
	};

	let spendings_by_category: (FunctionReturns['spendings_by_category'][number] & {
		hidden: boolean;
		open: boolean;
	})[];
	let diagram_data: DonutDataPoint[];
	$: total_spendings = spendings_by_category?.reduce((acc, { total }) => acc + total, 0) ?? 0;

	const update_statistics = (start_date: CalendarDate, end_date: CalendarDate): void => {
		service.get_spendings_by_category(start_date.toString(), end_date.toString()).then((data) => {
			spendings_by_category = data.map((item) => ({ ...item, hidden: false, open: false }));
			diagram_data = data.map(({ category, total, color }) => ({
				label: category,
				value: total,
				backgroundColor: color,
				hoverBackgroundColor: '#FFFFFF'
			}));
		});
	};

	$: if (period) update_statistics(period.start, period.end);

	let authenticated: boolean = false;
	supabase.auth.onAuthStateChange((_, session) => {
		authenticated = session !== null;
	});
</script>

{#if authenticated}
	<h1 class="text-2xl font-bold sm:text-4xl">Dashboard</h1>
	<Separator class="mb-4 sm:mb-8" />

	<div class="flex flex-row justify-center gap-2 max-sm:flex-wrap-reverse sm:gap-8">
		<div class="flex flex-1 flex-col gap-2 sm:max-w-64">
			{#if spendings_by_category}
				<Table.Root class="sm:w-64">
					<Table.Caption>Spread of spendings by category</Table.Caption>
					<Table.Header>
						<Table.Row>
							<Table.Head>Category</Table.Head>
							<Table.Head class="text-right">Amount</Table.Head>
							<Table.Head class="w-auto"></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each spendings_by_category as { category, total, hidden, open }}
							<Table.Row>
								<Table.Cell class={cn(hidden ? 'text-muted-foreground' : '')}>
									<div class="flex flex-row flex-nowrap items-center gap-2">
										{#if open}
											<ChevronUp size="1em" />
										{:else}
											<ChevronDown size="1em" />
										{/if}
										{category}
									</div>
								</Table.Cell>
								<Table.Cell class="text-right {hidden ? 'text-muted-foreground' : ''}"
									>{currency_formatter.format(total)}</Table.Cell
								>
								<Table.Cell class="w-2 {hidden ? 'text-muted-foreground' : ''}">
									<Button
										size="icon"
										variant="ghost"
										on:click={() => {
											hidden = !hidden;
											diagram_data = spendings_by_category.map(({ category, total, color }) => ({
												label: category,
												value: total,
												backgroundColor: color,
												hoverBackgroundColor: '#FFFFFF',
												hidden
											}));
										}}
									>
										{#if hidden}
											<EyeOff size="1em" />
										{:else}
											<Eye size="1em" />
										{/if}
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}

						<Table.Row>
							<Table.Cell class="font-bold">Total</Table.Cell>
							<Table.Cell class="text-right font-bold">
								{currency_formatter.format(total_spendings)}
							</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
			{:else}
				<Skeleton class="h-full sm:w-64" />
			{/if}
		</div>
		<div class="flex max-w-96 flex-1 flex-col gap-4">
			<div class="flex flex-row gap-4">
				<PeriodSelector select={select_period} />

				<p class="flex-0 py-2 text-right text-sm font-bold">
					{currency_formatter.format(total_spendings)}
				</p>
			</div>
			{#if spendings_by_category}
				<DonutChart data={diagram_data} />
			{:else}
				<Skeleton class="h-96" />
			{/if}
		</div>
	</div>
{:else}
	<p>You need to login to access this page</p>
{/if}
