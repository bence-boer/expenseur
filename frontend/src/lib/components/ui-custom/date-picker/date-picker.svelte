<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { date_formatter } from '$lib/consts';
	import { cn } from '$lib/utils';
	import { CalendarDate, getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import { CalendarIcon } from '@lucide/svelte';

	interface Props {
		value: DateValue | undefined;
		title?: string;
		placeholder?: DateValue;
		min?: DateValue;
		max?: DateValue;
		class?: string;
	}

	let {
		value = $bindable(),
		title = 'Date Picker',
		placeholder = $bindable(today(getLocalTimeZone())),
		min = new CalendarDate(1900, 1, 1),
		max = new CalendarDate(2099, 12, 31),
		class: _class = ''
	}: Props = $props();

	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		class={cn(
			buttonVariants({ variant: 'outline' }),
			'w-full justify-start pl-4 text-left font-normal sm:w-48',
			!value && 'text-muted-foreground',
			_class
		)}
	>
		{value ? date_formatter.format(value.toDate(getLocalTimeZone())) : title}
		<CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0" side="top">
		<Calendar
			bind:value
			bind:placeholder
			type="single"
			minValue={min}
			maxValue={max}
			calendarLabel="Date Picker"
			initialFocus
			preventDeselect
			weekStartsOn={1}
			onValueChange={() => (open = false)}
		/>
	</Popover.Content>
</Popover.Root>
