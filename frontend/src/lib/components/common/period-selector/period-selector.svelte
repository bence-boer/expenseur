<script lang="ts">
    import DateRangePicker from '$lib/components/ui-custom/date-range-picker/date-range-picker.svelte';
    import * as Select from '$lib/components/ui/select';
    import { cn, day_difference } from '$lib/utils';
    import { CalendarDate } from '@internationalized/date';
    import { default_period, periods } from './consts';
    import type { Period, PeriodWithLabel } from './types';

    interface Props {
        class?: string;
        select: (period: Period) => void;
        default?: Period;
    }

    let { class: clazz = '', select, default: default_custom }: Props = $props();

    const empty_period_value = (): Period => ({
        previous_start: undefined as any as CalendarDate,
        previous_end: undefined as any as CalendarDate,
        start: undefined as any as CalendarDate,
        end: undefined as any as CalendarDate,
        days: 0
    });

    let custom_period: PeriodWithLabel = $state({
        key: 'CUSTOM',
        value: default_custom ?? empty_period_value(),
        label: 'Custom'
    });

    type PeriodKey = (typeof periods)[number]['key'] | (typeof custom_period)['key'];
    const period_map: { [Key in PeriodKey]: PeriodWithLabel } = {
        ...Object.fromEntries(periods.map((period) => [period.key, period])),
        [custom_period.key]: custom_period
    };

    let open: boolean = $state(false);

    let selected: PeriodWithLabel = $state(default_custom ? custom_period : default_period);
    // svelte-ignore state_referenced_locally
    let selected_key: PeriodKey = $state(selected.key);

    // svelte-ignore state_referenced_locally
    select(selected.value);

    const set = (key: PeriodKey) => {
        const next = period_map[key];
        next.value.days = day_difference(next.value.start, next.value.end) + 1;
        selected = next;
        select(next.value);
        open = false;
        custom_period.value = empty_period_value();
    };

    $effect(() => {
        if (selected_key !== 'CUSTOM' || !custom_period.value.start || !custom_period.value.end) return;

        const [start, end] = [custom_period.value.start.toString(), custom_period.value.end.toString()];
        const basic: PeriodKey = periods.find((period) => period.value.start.toString() === start && period.value.end.toString() === end)?.key;
        if (basic) {
            set(basic);
            selected_key = basic;
            return;
        }

        custom_period.value.previous_start = custom_period.value.start.subtract({
            days: day_difference(custom_period.value.start, custom_period.value.end) + 1
        });
        custom_period.value.previous_end = custom_period.value.start.subtract({ days: 1 });
        set('CUSTOM');
    });
</script>

<Select.Root
    bind:value={selected_key}
    type="single"
    bind:open={
        () => open,
        (next) => {
            if (!open || selected_key !== 'CUSTOM') open = next;
        }
    }
>
    <Select.Trigger class={cn('gap-1 w-auto', clazz)}>
        {selected.label}
    </Select.Trigger>
    <Select.Content>
        {#each periods as { label, key: value }}
            <Select.Item {value} {label} onclick={() => set(value)} />
        {/each}
        <Select.Item
            value={custom_period.key}
            onclick={() => {
                custom_period.value = empty_period_value();
            }}
            class="p-0"
        >
            <DateRangePicker
                bind:value={custom_period.value}
                class="flex-1 bg-transparent pr-8"
                min={new CalendarDate(1900, 1, 1)}
                max={new CalendarDate(2099, 12, 31)}
                title={custom_period.label}
            />
        </Select.Item>
    </Select.Content>
</Select.Root>
