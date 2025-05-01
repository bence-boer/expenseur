<script lang="ts">
    import { buttonVariants } from '$lib/components/ui/button';
    import { Calendar } from '$lib/components/ui/calendar';
    import * as Popover from '$lib/components/ui/popover';
    import RangeCalendar from '$lib/components/ui/range-calendar/range-calendar.svelte';
    import { date_formatter } from '$lib/consts';
    import { cn } from '$lib/utils';
    import { CalendarDate, getLocalTimeZone, today, type DateValue } from '@internationalized/date';
    import type { DateRange } from 'bits-ui';
    import { CalendarIcon } from '@lucide/svelte';

    interface Props {
        value: DateRange;
        title?: string;
        min?: DateValue;
        max?: DateValue;
        class?: string;
    }

    let {
        value = $bindable({ start: undefined, end: undefined }),
        title = 'Date Range Picker',
        min = new CalendarDate(1900, 1, 1),
        max = new CalendarDate(2099, 12, 31),
        class: _class = ''
    }: Props = $props();

    let open = $state(false);
    let label: string = $derived.by(() => {
        if (!value?.start || !value?.end) return title;
        return `${date_formatter.format(value.start.toDate(getLocalTimeZone()))} - ${date_formatter.format(value.end.toDate(getLocalTimeZone()))}`;
    });
</script>

<Popover.Root bind:open>
    <Popover.Trigger
        class={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start pl-4 text-left font-normal sm:w-48', !value && 'text-muted-foreground', _class)}
    >
        {label}
        <CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
    </Popover.Trigger>
    <Popover.Content class="w-auto p-0" side="top">
        <RangeCalendar
            bind:value
            minValue={min}
            maxValue={max}
            calendarLabel="Date Range Picker"
            preventDeselect
            weekStartsOn={1}
            onValueChange={() => (open = false)}
        />
    </Popover.Content>
</Popover.Root>
