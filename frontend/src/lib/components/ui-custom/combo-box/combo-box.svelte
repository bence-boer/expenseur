<script lang="ts" generics="VALUE extends number | string">
    import { Button } from "$lib/components/ui/button";
    import * as Command from "$lib/components/ui/command";
    import * as Popover from "$lib/components/ui/popover";
    import { commandScore } from "./command-score";
    import type { LabelValue } from "$lib/types";
    import { cn } from "$lib/utils.js";
    import { Check, ChevronsUpDown } from "lucide-svelte";
    import { tick } from "svelte";

    type Item = LabelValue<VALUE>;
    interface Props {
        class?: string;
        data: Item[];
        max_results?: number;
        value?: VALUE;
        placeholder?: string;
        create: (label: string) => Promise<VALUE>;
        onchange?: (value: VALUE) => void;
        disabled?: boolean;
    }

    let {
        class: clazz = "",
        data = $bindable([]),
        max_results = 10,
        value = $bindable(),
        placeholder = $bindable("Please select an option"),
        create,
        onchange = () => void 0,
        disabled = $bindable(false),
    }: Props = $props();

    // TODO: more efficient update instead of recreating the map
    let data_map: Map<VALUE, Item> = $derived(
        new Map(data?.map((item) => [item.value, item])),
    );

    let shown_results: (Item & { score: number })[] = $state([]);

    let label_as_value_binded_to_form: string = $state("");
    let selected: Item | undefined = $state(undefined);
    let selected_changed: boolean = $state(false);

    let search_expression: string = $state("");
    let open: boolean = $state(false);
    let trigger: HTMLButtonElement = $state<HTMLButtonElement>(null!);

    const close_and_focus_trigger = () => {
        open = false;
        tick().then(() => trigger.focus());
    };
    $effect.pre(() => {
        if (selected_changed) {
            label_as_value_binded_to_form = selected?.label ?? "";
            value = selected?.value;
            selected_changed = false;
        } else {
            selected = data_map.get(value!);
            label_as_value_binded_to_form = selected?.label ?? "";
        }
    });
    $effect.pre(() => {
        if (value === undefined) search_expression = "";
    });
    $effect.pre(() => {
        const search = search_expression?.trim() ?? "";
        shown_results = data
            .map((item) => ({
                ...item,
                score: commandScore(item.label, search ?? ""),
            }))
            .filter((item) => item.score)
            .toSorted((a, b) => b.score - a.score)
            .slice(0, max_results);
    });
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
                class={cn(
                    "w-full justify-between",
                    !value && "font-normal text-muted-foreground",
                    clazz,
                )}
            >
                {selected?.label ?? placeholder}
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        {/snippet}
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
                    <span
                        class="max-w-36 grow-0 overflow-ellipsis align-middle text-muted-foreground"
                    >
                        "{search_expression}"
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        class="flex-none"
                        onclick={async () => {
                            close_and_focus_trigger();
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
                            close_and_focus_trigger();
                            onchange(item.value);
                        }}
                    >
                        <Check
                            class={cn(
                                "mr-2 h-4 w-4",
                                label_as_value_binded_to_form !== item.value &&
                                    "text-transparent",
                            )}
                        />
                        {item.label}
                    </Command.Item>
                {/each}
            </Command.Group>
        </Command.Root>
    </Popover.Content>
</Popover.Root>
