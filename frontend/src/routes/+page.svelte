<script lang="ts">
	import DonutChart from "$lib/components/charts/donut-chart.svelte";
	import type { DonutDataPoint } from "$lib/components/charts/types";
	import {
		PeriodSelector,
		type Period,
	} from "$lib/components/common/period-selector";
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import * as Table from "$lib/components/ui/table";
	import { service, ServiceTypes } from "$lib/service";
	import { CalendarDate } from "@internationalized/date";
	import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-svelte";
	import { currency_formatter } from "../lib/consts";
	import { Skeleton } from "$lib/components/ui/skeleton";

	let period: Period | undefined = $state();

	const select_period = (value: Period): void => {
		period = value;
	};

	type Data = {
		table?: (ServiceTypes.SpendingsByCategory & {
			hidden: boolean;
			open: boolean;
		})[];
		diagram?: DonutDataPoint[];
		total?: number;
	};

	const data_transform = (
		data: ServiceTypes.SpendingsByCategory[],
	): Data => ({
		table: data.map((item) => ({
			...item,
			hidden: false,
			open: false,
		})),
		diagram: data.map(({ category, total, color }) => ({
			label: category,
			value: total,
			backgroundColor: color,
			hoverBackgroundColor: "#FFFFFF",
		})),
		total: data.reduce((acc, { total }) => acc + total, 0),
	});

	const fetch_data = (
		start_date: CalendarDate,
		end_date: CalendarDate,
	): Promise<Data> =>
		service
			.get_spendings_by_category({
				start_date: start_date.toString(),
				end_date: end_date.toString(),
			})
			.then((data) => data_transform(data));

	const data: Promise<Data> = $derived(
		period?.start && period?.end
			? fetch_data(period.start, period.end)
			: Promise.resolve({}),
	);
</script>

<div class="flex flex-row justify-between gap-4">
	<h1 class="text-2xl font-bold sm:text-4xl">Dashboard</h1>
	<PeriodSelector select={select_period} class="flex-shrink" />
</div>

<Separator class="mb-4 sm:mb-8" />

<div class="flex max-w-96 flex-1 flex-col gap-4">
	{#await data}
		<div class="flex aspect-square w-full flex-col gap-4 px-4">
			<Skeleton class="h-12" />

			<Skeleton class="h-12" />
			<Skeleton class="h-60" />
		</div>
	{:then data}
		{#if data.diagram?.length && data.table?.length && data.total}
			<div>{currency_formatter.format(data.total)}</div>
			<DonutChart data={data.diagram} />
			<div class="flex flex-1 flex-col gap-2 sm:max-w-64">
				<Table.Root class="sm:w-64">
					<Table.Caption>
						Spread of spendings by category
					</Table.Caption>
					<Table.Header>
						<Table.Row>
							<Table.Head>Category</Table.Head>
							<Table.Head class="text-right">Amount</Table.Head>
							<Table.Head class="w-[28.68px] p-0"></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.table as { category, total, hidden, open }, index}
							<Table.Row
								class={hidden ? "text-muted-foreground" : ""}
							>
								<Table.Cell>
									<div
										class="flex flex-row flex-nowrap items-center gap-2"
									>
										{#if open}
											<ChevronUp size="1em" />
										{:else}
											<ChevronDown size="1em" />
										{/if}
										{category}
									</div>
								</Table.Cell>
								<Table.Cell class="text-right">
									{currency_formatter.format(total)}
								</Table.Cell>
								<Table.Cell class="h-12 w-12 p-0 text-center">
									<Button size="icon" variant="ghost">
										{#if hidden}
											<EyeOff size="1em" />
										{:else}
											<Eye size="1em" />
										{/if}
									</Button>
								</Table.Cell>
							</Table.Row>
						{:else}
							{#each Array(6) as _}
								<Table.Row>
									<Table.Cell class="w-full" colspan={3}>
										<Skeleton class="h-4 m-2" />
									</Table.Cell>
								</Table.Row>
							{/each}
						{/each}

						<Table.Row>
							<Table.Cell class="font-bold">Total</Table.Cell>
							<Table.Cell class="text-right font-bold">
								{currency_formatter.format(data.total)}
							</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
			</div>
		{:else}
			<p class="text-center">No data available for the selected period</p>
		{/if}
	{:catch error}
		<p class="text-center">An error occurred</p>
	{/await}
</div>
