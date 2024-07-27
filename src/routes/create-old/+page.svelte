<script lang="ts">
	import type { Tables } from '../../types/supabase';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui-custom/input';
	import { form_schema, type FormSchema } from './form-schema';
	import { getFormControl } from 'formsnap';
	import { type SuperValidated, type Infer, type SuperFormEvents } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import CalendarIcon from 'svelte-radix/Calendar.svelte';
	import {
		CalendarDate,
		type DateValue,
		getLocalTimeZone,
		parseDate,
		today
	} from '@internationalized/date';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { date_formatter } from '$lib/consts';

	const label_value_transform = <T extends { id: string; name: string }>(data: T) => ({
		label: data.name,
		value: data.id
	});

	export let data: {
		brands: Tables<'brands'>[];
		categories: Tables<'categories'>[];
		stores: Tables<'stores'>[];
		units: Tables<'units'>[];
		items: Tables<'items'>[];
		data: SuperValidated<Infer<FormSchema>>;
	};

	const form = superForm(data.data, {
		validators: zodClient(form_schema),
		taintedMessage: null,
		onUpdated: ({ form }) => {
			if (form.valid) {
				toast.success(`You submitted ${JSON.stringify(form.data, null, 2)}`);
			} else {
				toast.error('Please fix the errors in the form.');
			}
		}
	});

	let { form: form_data, enhance: _enhance } = form;
	const enhance = (form_element: HTMLFormElement) => {
		let x = _enhance(form_element);
		// TODO: don't submit form on enter
	};

	let value: DateValue | undefined;
	$: value = $form_data.date ? parseDate($form_data.date) : undefined;

	let placeholder: DateValue = today(getLocalTimeZone());

	const handle_submit = (event: Event) => {
		event.preventDefault();
		if (!data.data.valid) return;
	};
</script>

<h1 class="mb-4 text-4xl font-bold">Register Purchase</h1>
<Separator class="mb-8" />

<form method="POST" use:enhance on:submit={handle_submit} class="space-y-6">
	<div class="flex flex-row flex-wrap gap-8">
		<Form.Field {form} name="store" class="min-w-48 max-w-64 flex-1">
			<Form.Control let:attrs>
				<Form.Label>Store</Form.Label>
				<Input {...attrs} bind:value={$form_data.store} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="date" class="min-w-48 max-w-64 flex-1">
			<Form.Control let:attrs>
				<div>
					<Form.Label>Purchase Date</Form.Label>
				</div>
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
				<Form.FieldErrors />
				<input hidden value={$form_data.date} name={attrs.name} />
			</Form.Control>
		</Form.Field>
	</div>

	<Form.Button type="submit">Create</Form.Button>
	{#if browser}
		<SuperDebug data={$form_data} />
	{/if}
</form>
