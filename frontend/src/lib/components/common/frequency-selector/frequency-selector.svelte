<script lang="ts">
    import * as Select from '$lib/components/ui/select';
    import { default_frequency, frequencies } from './consts';
    import type { Frequency, FrequencyWithLabel } from './types';
    import { cn } from '$lib/utils';
    import { Input } from '$lib/components/ui/input';

    interface Props {
        class?: string;
        select: (frequency: Frequency) => void;
        default?: Frequency;
    }

    let { class: clazz = '', select, default: default_custom }: Props = $props();

    let custom_frequency: FrequencyWithLabel = $state({
        key: 'CUSTOM',
        value: { days: 0 },
        label: 'Custom'
    });

    let custom_days: number = $state(0);

    type FrequencyKey = (typeof frequencies)[number]['key'] | (typeof custom_frequency)['key'] | (typeof default_frequency)['key'];
    const frequency_map: { [Key in FrequencyKey]: FrequencyWithLabel } = {
        ...Object.fromEntries(frequencies.map((frequency) => [frequency.key, frequency])),
        [custom_frequency.key]: custom_frequency,
        [default_frequency.key]: default_frequency
    };

    let open: boolean = $state(false);

    let selected: FrequencyWithLabel = $state(
        default_custom ? frequencies.find((p) => p.value.days === default_custom.days) || { ...custom_frequency, value: default_custom } : default_frequency
    );

    let selected_key: FrequencyKey = $state(
        default_custom ? frequencies.find((p) => p.value.days === default_custom.days)?.key || 'CUSTOM' : default_frequency.key
    );

    $effect(() => {
        select(selected.value);
    });

    $effect(() => {
        const key = selected_key;
        if (key === 'CUSTOM') {
            custom_frequency.value = { days: custom_days };
            selected = custom_frequency;
        } else {
            selected = frequency_map[key];
        }
        select(selected.value);
    });

    function handle_custom_days_change(event: Event) {
        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value) || 0;
        custom_days = value;
        if (selected_key === 'CUSTOM') {
            custom_frequency.value = { days: value };
            select(custom_frequency.value);
        }
    }
</script>

<Select.Root bind:value={selected_key} type="single">
    <Select.Trigger class={cn('gap-1 w-auto', clazz)}>
        {selected.label === 'Custom' ? `Custom (${custom_days} days)` : selected.label}
    </Select.Trigger>
    <Select.Content>
        <Select.Item value={default_frequency.key} label={default_frequency.label} />
        {#each frequencies as { label, key: value }}
            <Select.Item {value} {label} />
        {/each}
        <Select.Item value={custom_frequency.key} class="flex flex-col p-2">
            <div class="text-sm mb-2">Custom Days</div>
            <div class="flex items-center gap-2">
                <Input type="number" min="1" class="w-24" value={custom_days} onchange={handle_custom_days_change} />
                <span class="text-sm">days</span>
            </div>
        </Select.Item>
    </Select.Content>
</Select.Root>
