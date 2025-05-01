<script lang="ts">
    import * as Select from '$lib/components/ui/select';
    import { cn } from '$lib/utils';
    import { frequencies } from './consts';
    import type { Frequency } from './types';

    interface Props {
        class?: string;
        select: (frequency: Frequency) => void;
        placeholder?: string;
    }

    let { class: clazz = '', select, placeholder = 'Average' }: Props = $props();

    let custom: Frequency = $state({
        key: 'CUSTOM',
        value: 1,
        label: 'Custom'
    });

    type FrequencyKey = (typeof frequencies)[number]['key'] | (typeof custom)['key'];
    const frequency_map: { [Key in FrequencyKey]: Frequency } = {
        ...Object.fromEntries(frequencies.map((frequency) => [frequency.key, frequency])),
        [custom.key]: custom
    };

    let selected_key: FrequencyKey | undefined = $state(undefined);
    let selected: Frequency | undefined = $derived(selected_key === custom?.key ? custom : frequency_map[selected_key]);

    $effect(() => select(selected));
</script>

<Select.Root bind:value={selected_key} type="single">
    <Select.Trigger class={cn('gap-1 w-auto', clazz, selected_key ? 'text-primary' : 'text-muted-foreground')}>
        {selected ? (selected.key === custom.key ? `Custom (${selected.value} days)` : selected.label) : placeholder}
    </Select.Trigger>
    <Select.Content>
        <Select.Item value={undefined} label="None" class="text-muted-foreground" />
        <Select.Separator />
        {#each frequencies as { label, key: value }}
            <Select.Item {value} {label} />
        {/each}
    </Select.Content>
</Select.Root>
