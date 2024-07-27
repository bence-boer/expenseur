<script lang="ts">
	import DatePicker from '$lib/components/ui-custom/date-picker/date-picker.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table';
	import * as service from '$lib/service';
	import type { FunctionReturns } from '$lib/types';
	import {
		endOfMonth,
		getLocalTimeZone,
		startOfMonth,
		today,
		type DateValue
	} from '@internationalized/date';
	import { VisNestedDonut, VisSingleContainer } from '@unovis/svelte';
	import type {
		GenericAccessor,
		NestedDonutLayerSettings,
		NumericAccessor,
		StringAccessor
	} from '@unovis/ts';
	import { Eye, EyeOff } from 'lucide-svelte';
	import { supabase } from '../supabase-client';
	import { currency_formatter } from './../lib/consts';

	let start_date: DateValue = startOfMonth(today(getLocalTimeZone()));
	let end_date: DateValue = endOfMonth(today(getLocalTimeZone()));

	let spendings_by_category: (FunctionReturns['spendings_by_category'][number] & {
		hidden: boolean;
	})[];
	let diagram_data: FunctionReturns['spendings_by_category'];

	const update_statistics = (start_date: DateValue, end_date: DateValue) =>
		service.get_spendings_by_category(start_date.toString(), end_date.toString()).then((data) => {
			spendings_by_category = data.map((item) => ({ ...item, hidden: false }));
			diagram_data = data;
		});
	$: update_statistics(start_date, end_date);

	const layers: StringAccessor<FunctionReturns['spendings_by_category'][number]>[] = [
		({ category }) => category
	];

	const value_accessor: NumericAccessor<FunctionReturns['spendings_by_category'][number]> = ({
		total
	}) => total;

	const layerSettings: GenericAccessor<NestedDonutLayerSettings, number> = (d, i) => ({
		backgroundColor: '#FFFFFF'
	});

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
								<Table.Cell>{category}</Table.Cell>
								<Table.Cell class="text-right">{currency_formatter.format(total)}</Table.Cell>
								<Table.Cell class="w-2">
									<Button
										size="icon"
										variant="ghost"
										on:click={() => {
											hidden = !hidden;
											diagram_data = spendings_by_category
												.filter((category) => !category.hidden)
												.map(({ category, total }) => ({ category, total }));
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
									spendings_by_category.reduce((acc, { total }) => acc + total, 0)
								)}
							</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
			</div>
			<div class="flex max-w-96 flex-1 flex-col gap-4">
				<div class="flex flex-row gap-2">
					<DatePicker
						bind:value={start_date}
						title="Start date"
						placeholder={start_date}
						class="flex-1"
					></DatePicker>
					<DatePicker bind:value={end_date} title="End date" placeholder={end_date} class="flex-1"
					></DatePicker>
				</div>
				<VisSingleContainer data={diagram_data} class="aspect-square max-w-96 flex-1">
					<VisNestedDonut {layers} {layerSettings} value={value_accessor} cornerRadius={10} />
				</VisSingleContainer>
			</div>
		</div>
	{/if}
{:else}
	<p>You need to login to access this page</p>
{/if}
