<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils.js';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';

	type CollectionType = ({ label: string; value: number } | { label: string; value: string })[];
	type ItemType = CollectionType[number];

	export let data: CollectionType;
	let data_map: Map<ItemType['value'], ItemType>;
	// TODO: more efficient update instead of recreating the map
	$: data_map = new Map(data.map((item) => [item.value, item]));

	export let value: ItemType['value'] | undefined = undefined;
	let label_as_value_binded_to_form: string;
	let selected: ItemType | undefined = undefined;
	let selected_changed: boolean = false;

	export let placeholder: string = 'Please select an option';
	export let create: (label: string) => Promise<void>;

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

	let search_expression: string;

	let open: boolean = false;
	let disabled: boolean = false;

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
			class="w-[200px] justify-between"
		>
			{selected?.label ?? placeholder}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command.Root bind:value={label_as_value_binded_to_form} aria-disabled={disabled}>
			<Command.Input {placeholder} bind:value={search_expression} />
			<Command.Empty class="py-2">
				<div
					class="relative flex w-full cursor-default select-none items-center justify-between gap-4 px-2 pl-8 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
				>
					<span class="flex-initial overflow-ellipsis align-middle text-muted-foreground">
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
								await create(search_expression);
							} catch (e) {
								console.error(e);
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
				{#each data as item}
					<Command.Item
						value={item.label}
						onSelect={() => {
							selected = item;
							selected_changed = true;
							close_and_focus_trigger(ids.trigger);
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
