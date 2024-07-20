<script lang="ts">
	import ComboBox from './../../lib/components/ui/combo-box/combo-box.svelte';
	import type { Tables } from '../../types/supabase';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';

	import CalendarIcon from 'svelte-radix/Calendar.svelte';
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate,
		today
	} from '@internationalized/date';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import { cn } from '$lib/utils.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { Separator } from '$lib/components/ui/separator';
	import Table from '$lib/components/ui/table/table.svelte';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import * as Command from '$lib/components/ui/command';
	import { tick } from 'svelte';
	import { supabase } from '../../supabase-client';

	const label_value_transform = (data: { id: number; name: string }) => ({
		label: data.name,
		value: data.id
	});

	export let data: {
		brands: Tables<'brands'>[];
		categories: Tables<'categories'>[];
		stores: Tables<'stores'>[];
		units: Tables<'units'>[];
		items: Tables<'items'>[];
	};

	type FormSchema = {
		date: string;
		store_id: string;
		items: Tables<'items'>[];
	};

	/* STORE SELECTOR */
	/******************/
	let selectable_stores = data.stores.map(label_value_transform);
	let selected_store: number;

	const create_store = async (label: string) => {
		const { data, error } = await supabase
			.from('stores')
			.insert({ name: label })
			.select('*')
			.single();

		if (error) {
			toast.error(error.message);
			return;
		}

		selectable_stores = [...selectable_stores, { label, value: data!.id }];
		selected_store = data!.id;
	};
	/******************/

	const date_formatter = new DateFormatter('hu-HU');

	let value: DateValue | undefined;

	let placeholder: DateValue = today(getLocalTimeZone());

	const handle_submit = (event: Event) => {
		event.preventDefault();

		// if (!data.data.valid) return;
	};
</script>

<h1 class="mb-4 text-4xl font-bold">Register Purchase</h1>
<Separator class="mb-8" />
<div>
	<ComboBox
		data={selectable_stores}
		bind:value={selected_store}
		placeholder="Select store..."
		create={create_store}
	></ComboBox>
	Selected id: {selected_store}
</div>
<!-- 
<Popover.Root bind:open={store_selector_open} let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={store_selector_open}
			class="w-[200px] justify-between"
		>
			{selected_store_label}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command.Root>
			<Command.Input placeholder="Search framework..." bind:value={store_search} />
			<Command.Empty>
				<div class="flex h-4 flex-row justify-between px-8">
					<span>{store_search}</span>
					<span class="text-xs text-muted-foreground">Add</span>
				</div>
			</Command.Empty>
			<Command.Group>
				{#each selectable_stores as store}
					<Command.Item
						value={store.value}
						onSelect={(value) => {
							selected_store_value = value;
							close_and_focus_trigger(ids.trigger);
						}}
					>
						<Check
							class={cn('mr-2 h-4 w-4', selected_store_value !== store.value && 'text-transparent')}
						/>
						{store.label}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root> -->
<!-- 
<Form.Label>Store</Form.Label>
<Input {...attrs} bind:value={$form_data.store} />

<Popover.Root>
	<Popover.Trigger
		{...attrs}
		class={cn(
			buttonVariants({ variant: 'outline' }),
			'w-full justify-start pl-4 text-left font-normal',
			!value && 'text-muted-foreground'
		)}
	>
		{value ? date_formatter.format(value.toDate(getLocalTimeZone())) : 'Pick a date'}
		<CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0" side="top">
		<Calendar
			{value}
			bind:placeholder
			minValue={new CalendarDate(2000, 1, 1)}
			maxValue={today(getLocalTimeZone())}
			calendarLabel="Purchase Date"
			initialFocus
			onValueChange={(v) => ($form_data.date = v?.toString() ?? '')}
		/>
	</Popover.Content>
</Popover.Root>

<input hidden value={$form_data.date} name={attrs.name} />

<Form.Button type="submit">Create</Form.Button> -->
