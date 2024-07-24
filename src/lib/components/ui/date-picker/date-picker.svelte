<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { date_formatter } from '$lib/consts';
	import { cn } from '$lib/utils.js';
	import { CalendarDate, getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import { CalendarIcon } from 'lucide-svelte';

	export let value: DateValue | undefined = undefined;
	export let title = 'Date Picker';
	export let placeholder: DateValue = today(getLocalTimeZone());
	export let min: DateValue = new CalendarDate(1900, 1, 1);
	export let max: DateValue = new CalendarDate(2099, 12, 31);
	let _class = '';
	export { _class as class };
	let open = false;
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
