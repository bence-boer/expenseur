<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { commandScore } from './command-score';
	import type { LabelValue } from '$lib/types';
	import { cn } from '$lib/utils.js';
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	let clazz: string = '';

	export let data: LabelValue[];
	export let max_results: number = 10;
	export { clazz as class };
	export let value: LabelValue['value'] | undefined = undefined;
	export let placeholder: string = 'Please select an option';
	export let create: (label: string) => Promise<LabelValue['value']>;
	export let disabled: boolean = false;

	data ??= [];
	let data_map: Map<LabelValue['value'], LabelValue>;
	// TODO: more efficient update instead of recreating the map
	$: data_map = new Map(data?.map((item) => [item.value, item]));

	let shown_results: (LabelValue & { score: number })[] = [];
	$: {
		const search = search_expression?.trim() ?? '';
		shown_results = data
			.map((item) => ({ ...item, score: commandScore(item.label, search ?? '') }))
			.filter((item) => item.score)
			.toSorted((a, b) => b.score - a.score)
			.slice(0, max_results);
	}

	let label_as_value_binded_to_form: string;
	let selected: LabelValue | undefined = undefined;
	let selected_changed: boolean = false;

	let search_expression: string;
	let open: boolean = false;

	$: if (value === undefined) search_expression = '';

	$: {
		if (selected_changed) {
			label_as_value_binded_to_form = selected?.label ?? '';
			value = selected?.value;
			selected_changed = false;
		} else {
			selected = data_map.get(value!);
			label_as_value_binded_to_form = selected?.label ?? '';
		}
	}

	const dispatch = createEventDispatcher();
	const dispatch_change_event = (value: LabelValue['value']) => dispatch('change', { value });

	const close_and_focus_trigger = (triggerId: string) => {
		open = false;
		tick().then(() => document.getElementById(triggerId)?.focus());
	};
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			{disabled}
			class={cn('w-full justify-between', !value && 'font-normal text-muted-foreground', clazz)}
		>
			{selected?.label ?? placeholder}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-48 p-0">
		<Command.Root
			bind:value={label_as_value_binded_to_form}
			aria-disabled={disabled}
			shouldFilter={false}
		>
			<Command.Input {placeholder} bind:value={search_expression} />
			<Command.Empty class="pb-0 pt-2">
				<div
					class="relative flex w-48 grow-0 cursor-default select-none items-center justify-between gap-4 pl-8 pr-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
				>
					<span class="max-w-36 grow-0 overflow-ellipsis align-middle text-muted-foreground">
						"{search_expression}"
					</span>
					<Button
						variant="outline"
						size="sm"
						class="flex-none"
						on:click={async () => {
							close_and_focus_trigger(ids.trigger);
							const placeholder_backup = placeholder;
							placeholder = search_expression;
							disabled = true;
							try {
								value = await create(search_expression);
							} catch (error) {
								console.error(error);
							}
							placeholder = placeholder_backup;

							disabled = false;
						}}
					>
						Create
					</Button>
				</div>
			</Command.Empty>
			<Command.Group>
				{#each shown_results as item}
					<Command.Item
						value={item.label}
						onSelect={() => {
							selected = item;
							selected_changed = true;
							close_and_focus_trigger(ids.trigger);
							dispatch_change_event(item.value);
						}}
					>
						<Check
							class={cn(
								'mr-2 h-4 w-4',
								label_as_value_binded_to_form !== item.value && 'text-transparent'
							)}
						/>
						{item.label}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
