<script lang="ts" generics="VALUE extends number | string">
    import { Button } from '$lib/components/ui/button';
    import * as Command from '$lib/components/ui/command';
    import * as Popover from '$lib/components/ui/popover';
    import type { LabelValue } from '$lib/types';
    import { cn } from '$lib/utils';
    import { Check, ChevronsUpDown } from '@lucide/svelte';
    import { command_score, filter } from '$lib/utils/command-score';

    type Item = LabelValue<VALUE>;

    type Props = {
        class?: string;
        data: Item[];
        max_results?: number;
        value?: VALUE;
        placeholder?: string;
        create?: (label: string) => Promise<VALUE>;
        onchange?: (value: VALUE) => void;
        disabled?: boolean;
    };

    let {
        class: className = '',
        data = [],
        max_results = 10,
        value = $bindable(),
        placeholder = 'Please select an option',
        create,
        onchange = () => {},
        disabled = false
    }: Props = $props();

    let search_expression: string = $state('');
    let open: boolean = $state(false);
    let trigger: HTMLButtonElement | null = $state(null);

    let selected: Item | undefined = $derived(data.find((item) => item.value === value));

    let shown_results: Item[] = $derived(filter(data, search_expression, (item) => item.label, max_results));

    const select = (item: Item): void => {
        const previous: VALUE = value;

        value = item.value;
        search_expression = '';
        open = false;
        trigger.focus();

        if (previous !== value) onchange(item.value);
    };

    const handle_create = (): void => {
        open = false;
        trigger.focus();
        disabled = true;

        create(search_expression)
            .then((new_value) => {
                const changed = value !== new_value;
                value = new_value;

                if (changed) onchange(new_value);
            })
            .finally(() => {
                disabled = false;
            });
    };
</script>

<Popover.Root bind:open>
    <Popover.Trigger bind:ref={trigger}>
        {#snippet child({ props })}
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                {disabled}
                {...props}
                class={cn('w-full justify-between', !value && 'font-normal text-muted-foreground', className)}
            >
                {selected?.label ?? placeholder}
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        {/snippet}
    </Popover.Trigger>

    <Popover.Content class="w-48 p-0" align="end">
        <Command.Root aria-disabled={disabled} shouldFilter={false}>
            <Command.Input {placeholder} bind:value={search_expression} />
            <Command.Empty class="pb-0 pt-2">
                {#if create && search_expression}
                    <div class="relative flex w-48 cursor-default select-none items-center justify-between gap-4 pl-8 pr-2 text-sm text-muted-foreground">
                        <span class="overflow-ellipsis overflow-x-hidden">
                            "{search_expression}"
                        </span>
                        <Button variant="outline" size="sm" onclick={handle_create}>Create</Button>
                    </div>
                {:else}
                    <div class="px-4 py-2 text-sm text-muted-foreground">No results found.</div>
                {/if}
            </Command.Empty>
            <Command.Group>
                {#each shown_results as item}
                    <Command.Item value={String(item.value)} onSelect={() => select(item)}>
                        <Check class={cn('mr-2 h-4 w-4', value !== item.value && 'text-transparent')} />
                        {item.label}
                    </Command.Item>
                {/each}
            </Command.Group>
        </Command.Root>
    </Popover.Content>
</Popover.Root>
