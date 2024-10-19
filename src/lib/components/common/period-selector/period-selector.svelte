<script lang="ts">
	import DatePicker from '$lib/components/ui-custom/date-picker/date-picker.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Select from '$lib/components/ui/select';
	import { TODAY } from '$lib/consts';
	import { CalendarDate } from '@internationalized/date';
	import { periods } from './consts';
	import type { Period, PeriodWithLabel } from './types';
	import { cn } from '$lib/utils';

	let clazz: string = '';
	export let select: (period: Period) => void;
	export { clazz as class };
	let selected: PeriodWithLabel;

	const empty_period = (): Period => ({
		start: undefined as any as CalendarDate,
		end: undefined as any as CalendarDate
	});

	let custom_period: PeriodWithLabel = {
		label: 'Custom',
		value: empty_period()
	};

	$: if (
		selected?.label === custom_period.label &&
		custom_period.value.start &&
		custom_period.value.end
	) {
		select(custom_period.value);
	}
</script>

<Select.Root bind:selected>
	<Select.Trigger class={cn('flex-1', clazz)}>
		<Select.Value placeholder="Period" />
	</Select.Trigger>
	<Select.Content>
		{#each periods as { label, value }}
			<Select.Item value={label} on:click={() => select(value)} {label} />
		{/each}
		<Select.Item
			value={custom_period.label}
			on:click={(event) => {
				event.preventDefault();
				custom_period.value = empty_period();
				selected = custom_period;
			}}
			disabled
		>
			<Collapsible.Root class="flex-1">
				<Collapsible.Trigger>Custom (coming soon...)</Collapsible.Trigger>
				<Collapsible.Content class="flex gap-2 pt-2">
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
