<script lang="ts">
    import DatePicker from "$lib/components/ui-custom/date-picker/date-picker.svelte";
    import * as Collapsible from "$lib/components/ui/collapsible";
    import * as Select from "$lib/components/ui/select";
    import { TODAY } from "$lib/consts";
    import { CalendarDate } from "@internationalized/date";
    import { default_period, periods } from "./consts";
    import type { Period, PeriodWithLabel } from "./types";
    import { cn } from "$lib/utils";

    interface Props {
        class?: string;
        empty?: boolean;
        select: (period: Period) => void;
    }

    let { class: clazz = "", empty = false, select }: Props = $props();

    const period_map: Map<string, PeriodWithLabel> = new Map(
        periods.map((period) => [period.value, period]),
    );

    const empty_period_value = (): Period => ({
        start: undefined as any as CalendarDate,
        end: undefined as any as CalendarDate,
        days: 0,
    });

    const empty_period: PeriodWithLabel = {
        label: "Empty",
        value: "EMPTY",
        data: empty_period_value(),
    };

    // TODO: implement custom period selection
    let custom_period: PeriodWithLabel = $state({
        label: "Custom",
        value: "CUSTOM",
        data: empty_period_value(),
    });

    let selected_period_value: string = $state(
        empty ? empty_period.value : default_period.value,
    );
    let selected: PeriodWithLabel = $state(
        empty ? empty_period : default_period,
    );

    // svelte-ignore state_referenced_locally
    select(selected.data);
</script>

<Select.Root bind:value={selected_period_value} type="single">
    <Select.Trigger class={cn("flex-1", clazz)}>
        {selected.label ?? "Period"}
    </Select.Trigger>
    <Select.Content>
        {#each periods as { label, value, data }}
            <Select.Item {value} onclick={() => select(data)} {label} />
        {/each}
        <Select.Item
            value={custom_period.label}
            onclick={(event) => {
                event.preventDefault();
                custom_period.data = empty_period_value();
                selected = custom_period;
            }}
            disabled
        >
            <Collapsible.Root class="flex-1">
                <Collapsible.Trigger
                    >Custom (coming soon...)</Collapsible.Trigger
                >
                <Collapsible.Content class="flex gap-2 pt-2">
                    <DatePicker
                        bind:value={custom_period.data.start}
                        title="Start date"
                        placeholder={TODAY}
                        class="flex-1"
                    ></DatePicker>
                    <DatePicker
                        bind:value={custom_period.data.end}
                        title="End date"
                        placeholder={TODAY}
                        class="flex-1"
                    ></DatePicker>
                </Collapsible.Content>
            </Collapsible.Root>
        </Select.Item>
    </Select.Content>
</Select.Root>
