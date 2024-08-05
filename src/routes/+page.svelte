<script lang="ts">
	import DonutChart from '$lib/components/charts/donut-chart.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table';
	import * as service from '$lib/service';
	import type { FunctionReturns, LabelValue } from '$lib/types';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import {
		CalendarDate,
		endOfMonth,
		endOfYear,
		getLocalTimeZone,
		startOfMonth,
		startOfYear,
		today,
		type DateValue
	} from '@internationalized/date';
	import { Eye, EyeOff } from 'lucide-svelte';
	import { supabase } from '../supabase-client';
	import { currency_formatter } from './../lib/consts';
	import DatePicker from '$lib/components/ui-custom/date-picker/date-picker.svelte';
	import type { DonutDataPoint } from '$lib/components/charts/types';

	const TODAY = today(getLocalTimeZone());

	type Period = {
		label: string;
		value: {
			start: CalendarDate;
			end: CalendarDate;
		};
	};
	let custom_period: Period = {
		label: 'Custom',
		value: {
			start: startOfMonth(TODAY),
			end: endOfMonth(TODAY)
		}
	};

	const [year, month] = [TODAY.year, TODAY.month];
	const available_periods: Period[] = [
		{
			label: 'This month',
			value: {
				start: startOfMonth(TODAY),
				end: endOfMonth(TODAY)
			}
		},
		{
			label: 'Last month',
			value: {
				start: new CalendarDate(year, (month + 12 - 1) % 12, 1),
				end: endOfMonth(new CalendarDate(year, (month + 12 - 1) % 12, 1))
			}
		},
		{
			label: 'This year',
			value: {
				start: startOfYear(TODAY),
				end: endOfYear(TODAY)
			}
		},
		{
			label: 'Last year',
			value: {
				start: new CalendarDate(year - 1, 1, 1),
				end: endOfYear(new CalendarDate(year - 1, 1, 1))
			}
		}
	];

	let period: Period = available_periods[0];

	let spendings_by_category: (FunctionReturns['spendings_by_category'][number] & {
		hidden: boolean;
	})[];
	let diagram_data: DonutDataPoint[];

	const iso_date = (date: DateValue): string => `${date.year}-${date.month}-${date.day}`;

	const update_statistics = (start_date: CalendarDate, end_date: CalendarDate) =>
		service.get_spendings_by_category(iso_date(start_date), iso_date(end_date)).then((data) => {
			spendings_by_category = data.map((item) => ({ ...item, hidden: false }));
			diagram_data = data.map(({ category, total, color }) => ({
				label: category,
				value: total,
				backgroundColor: color,
				hoverBackgroundColor: '#FFFFFF'
			}));
		});
	$: update_statistics(period.value.start, period.value.end);

	let authenticated = false;
	supabase.auth.onAuthStateChange((_, session) => {
		authenticated = session !== null;
	});
</script>

{#if authenticated}
	<h1 class="text-2xl font-bold sm:text-4xl">Dashboard</h1>
	<Separator class="mb-4 sm:mb-8" />

	{#if spendings_by_category}
		<div class="flex flex-row justify-center gap-2 max-sm:flex-wrap-reverse sm:gap-8">
			<div class="flex flex-1 flex-col gap-2 sm:max-w-64">
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
						{#each spendings_by_category as { category, total, hidden }}
							<Table.Row>
								<Table.Cell class={hidden ? 'text-muted-foreground' : ''}>{category}</Table.Cell>
								<Table.Cell class="text-right {hidden ? 'text-muted-foreground' : ''}"
									>{currency_formatter.format(total)}</Table.Cell
								>
								<Table.Cell class="w-2 {hidden ? 'text-muted-foreground' : ''}">
									<Button
										size="icon"
										variant="ghost"
										on:click={() => {
											hidden = !hidden;
											diagram_data = spendings_by_category
												.filter((category) => !category.hidden)
												.map(({ category, total, color }) => ({
													label: category,
													value: total,
													backgroundColor: color,
													hoverBackgroundColor: '#FFFFFF'
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
								{currency_formatter.format(
									spendings_by_category.reduce(
										(acc, { hidden, total }) => (hidden ? acc : acc + total),
										0
									)
								)}
							</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
			</div>
			<div class="flex max-w-96 flex-1 flex-col gap-4">
				<div class="flex flex-row gap-2">
					<Select.Root bind:selected={period}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Period" />
						</Select.Trigger>
						<Select.Content>
							{#each available_periods as { label, value }}
								<Select.Item {value}>
									{label}
								</Select.Item>
							{/each}
							<Select.Item value={custom_period} on:click={() => void 0}>
								<Collapsible.Root>
									<Collapsible.Trigger class="pb-2">Custom</Collapsible.Trigger>
									<Collapsible.Content class="flex gap-2">
										<DatePicker
											bind:value={custom_period.value.start}
											title="Start date"
											placeholder={TODAY}
											class="flex-1"
										></DatePicker>
										<DatePicker
											bind:value={custom_period.value.end}
											title="End date"
											placeholder={TODAY}
											class="flex-1"
										></DatePicker>
									</Collapsible.Content>
								</Collapsible.Root>
							</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<DonutChart data={diagram_data} />
			</div>
		</div>
	{/if}
{:else}
	<p>You need to login to access this page</p>
{/if}
