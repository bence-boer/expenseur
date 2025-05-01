<script lang="ts">
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import StackedAreaChart from '$lib/components/charts/stacked-area-chart.svelte';
    import type { LineChartData } from '$lib/components/charts/types';
    import { ExpenseDetailsDialog } from '$lib/components/common/expense-details-dialog';
    import { ExpenseGroupCard, type ExpenseGroup } from '$lib/components/common/expense-group';
    import { InfoCard } from '$lib/components/common/info-card';
    import { PeriodSelector, type Period } from '$lib/components/common/period-selector';
    import { TagSelector } from '$lib/components/common/tag-selector';
    import { Button } from '$lib/components/ui/button';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { service, ServiceTypes } from '$lib/service';
    import type { LabelValue } from '$lib/types';
    import { day_difference, format_date } from '$lib/utils';
    import { parseDate } from '@internationalized/date';
    import { ChevronsUpDown, DollarSign, FilterX } from '@lucide/svelte';
    import { untrack } from 'svelte';

    let chart_width: number = $state();

    let selected_categories: string[] = $state(page.url.searchParams.getAll('category') || []);
    let selected_items: number[] = $state(page.url.searchParams.getAll('item').map(Number).filter(Boolean) || []);
    let selected_tags: number[] = $state(page.url.searchParams.getAll('tag').map(Number).filter(Boolean) || []);

    // svelte-ignore non_reactive_update
    let initial_period: Period | null = null;
    const initial_start_string_from_url = page.url.searchParams.get('start');
    const initial_end_string_from_url = page.url.searchParams.get('end');
    if (initial_start_string_from_url && initial_end_string_from_url) {
        try {
            const start = parseDate(initial_start_string_from_url);
            const end = parseDate(initial_end_string_from_url);
            initial_period = { start, end, days: day_difference(start, end), previous_start: undefined, previous_end: undefined };
        } catch (e) {
            console.warn('Invalid date format in URL', e);
        }
    }
    let period: Period | null = $state(initial_period);
    let searched_period: Period | null = $state(null);

    let spendings: ServiceTypes.SpendingsByCategoryInterval = $state();
    let expenses: ServiceTypes.Expense[] = $state([]);
    let all_categories: ServiceTypes.Category[] = $state([]);
    let all_items: ServiceTypes.Item[] = $state([]);
    let loading: boolean = $state(false);
    let initial_load_done = $state(false);

    let category_options: LabelValue<string>[] = $derived(all_categories.map((c) => ({ label: c.name, value: String(c.id) })));
    let item_options: LabelValue<number>[] = $derived(all_items.map((item): LabelValue<number> => ({ label: item.name, value: item.id })));

    let filtered_datasets: ServiceTypes.SpendingsByCategoryInterval['data'] = $derived.by(() => {
        if (!spendings?.data?.length || !all_categories.length) return [];

        let allowed_category_ids_from_expenses: Set<string> | null = null;

        if ((selected_items.length > 0 || selected_tags.length > 0) && expenses?.length) {
            allowed_category_ids_from_expenses = new Set<string>();
            const filtered_expenses = expenses.filter((p) => {
                const item_match = selected_items.length === 0 || selected_items.includes(p.item_id);
                const tag_match = selected_tags.length === 0 || p.tags?.some(({ id }) => selected_tags.includes(id));
                return item_match && tag_match;
            });
            filtered_expenses.forEach((p) => allowed_category_ids_from_expenses!.add(String(p.category_id)));
        }

        const category_name_to_id_map = new Map(all_categories.map((c) => [c.name, String(c.id)]));

        return spendings.data.filter((dataset) => {
            const category_id = category_name_to_id_map.get(dataset.category);
            if (!category_id) return false;

            const category_selected_match = selected_categories.length === 0 || selected_categories.includes(category_id);
            const expense_filter_match = allowed_category_ids_from_expenses === null || allowed_category_ids_from_expenses.has(category_id);

            return category_selected_match && expense_filter_match;
        });
    });

    let chart_data: LineChartData = $derived({
        column_labels: spendings?.dates?.map(format_date) ?? [],
        lines: filtered_datasets.map(({ category, color, values }: { category: string; color: string; values: number[] }) => ({
            label: category,
            hidden: false,
            color,
            values
        }))
    });

    let groups: ExpenseGroup[] = $derived.by(() => {
        if (!expenses?.length) return [];
        const map: Map<string, ExpenseGroup> = new Map();
        for (const expense of expenses) {
            if (selected_categories.length > 0 && !selected_categories.includes(String(expense.category_id))) continue;
            if (selected_items.length > 0 && !selected_items.includes(expense.item_id)) continue;
            if (selected_tags.length > 0 && !expense.tags?.some(({ id }) => selected_tags.includes(id))) continue;
            const date: string = expense.date;
            if (!map.has(date)) map.set(date, { date, total: 0, expenses: [] });
            const group: ExpenseGroup = map.get(date);
            group.total += expense.price;
            group.expenses.push(expense);
        }
        return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
    });

    const build_search_params = (): URLSearchParams => {
        const search = new URLSearchParams();
        const current_period = period;
        if (current_period?.start && current_period?.end) {
            search.set('start', current_period.start.toString());
            search.set('end', current_period.end.toString());
        }
        selected_categories.forEach((cat) => search.append('category', cat));
        selected_items.forEach((item) => search.append('item', String(item)));
        selected_tags.forEach((tag) => search.append('tag', String(tag)));
        search.sort();
        return search;
    };

    const load_data = (period_to_load: Period): void => {
        if (!period_to_load?.start || !period_to_load?.end || !browser) return;
        const start_date = period_to_load.start.toString();
        const end_date = period_to_load.end.toString();
        const days_interval = Math.ceil(period_to_load.days / 5);

        loading = true;
        const intervalled = service.get_expenses_by_category_interval({ start_date, end_date, days_interval }).then((response) => {
            spendings = { data: response.data.filter((dataset) => dataset.values.some(Boolean)), dates: response.dates };
        });
        const detailed = service.get_expenses({ start_date, end_date }).then((response) => {
            expenses = response;
        });
        Promise.allSettled([intervalled, detailed]).finally(() => {
            loading = false;
            searched_period = period_to_load;
        });
    };

    const load_filters_data = async () => {
        if (!browser) return;
        try {
            const [categories, items] = await Promise.all([service.get_categories(), service.get_items()]);
            all_categories = categories;
            all_items = items;
        } catch (error) {
            console.error('Failed to load filter data:', error);
        }
    };

    $effect(() => {
        if (browser && !initial_load_done) {
            load_filters_data();
            const current_period = period;
            if (current_period) {
                load_data(current_period);
            }
            initial_load_done = true;
        }
    });

    $effect(() => {
        const current_period = period;
        if (browser && initial_load_done && untrack(() => !loading) && current_period) {
            if (current_period !== searched_period) {
                load_data(current_period);
            }
        }
    });

    $effect(() => {
        if (browser && initial_load_done) {
            const _p = period;
            const _sc = selected_categories;
            const _si = selected_items;
            const _st = selected_tags;

            const new_search_params = build_search_params();
            const current_search_params = new URLSearchParams(page.url.search);
            current_search_params.sort();

            if (new_search_params.toString() !== current_search_params.toString()) {
                goto(`?${new_search_params.toString()}`, { replaceState: true, keepFocus: true, noScroll: true });
            }
        }
    });

    const select_period = (value: Period): void => {
        period = value;
    };

    let expense_details_dialog_open: boolean = $state(false);
    let expense_details: ServiceTypes.Expense = $state({} as ServiceTypes.Expense);

    const open_expense_details = (expense: ServiceTypes.Expense): void => {
        expense_details = expense;
        expense_details_dialog_open = true;
    };

    const toggle_selection = (arr: (string | number)[], value: string | number): (string | number)[] => {
        const index = arr.indexOf(value);
        if (index > -1) {
            return arr.filter((_, i) => i !== index);
        } else {
            return [...arr, value];
        }
    };

    const handle_category_select = (value: string) => {
        selected_categories = toggle_selection(selected_categories, value) as string[];
    };

    const handle_item_select = (value: number) => {
        selected_items = toggle_selection(selected_items, value) as number[];
    };

    const get_selected_labels = (options: LabelValue<string | number>[], selected_values: (string | number)[], mode: 'CATEGORIES' | 'ITEMS') => {
        if (selected_values.length === 0) return mode === 'CATEGORIES' ? 'Categories' : 'Items';
        if (selected_values.length === 1) return options.find((opt) => opt.value === selected_values[0])?.label || 'Unknown';
        return `${selected_values.length} selected`;
    };

    const clear_filters = () => {
        selected_categories = [];
        selected_items = [];
        selected_tags = [];
    };
</script>

<div class="flex flex-row gap-4 justify-between items-center">
    <h1 class="text-2xl font-bold sm:text-4xl">Analytics</h1>
    <PeriodSelector select={select_period} default={initial_period} class="w-36" />
</div>

<div class="flex flex-row gap-2 items-center justify-stretch flex-nowrap">
    <DropdownMenu.Root>
        <DropdownMenu.Trigger disabled={loading} class="flex-1">
            <Button variant="outline" class="w-full justify-between {selected_categories.length === 0 ? 'text-muted-foreground' : ''}">
                {get_selected_labels(category_options, selected_categories, 'CATEGORIES')}
                <ChevronsUpDown />
            </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-48" preventScroll={false}>
            <DropdownMenu.Group>
                <DropdownMenu.Label>Categories</DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.CheckboxItem
                    checked={selected_categories.length === 0}
                    onSelect={(e) => {
                        e.preventDefault();
                        selected_categories = [];
                    }}
                >
                    All Categories
                </DropdownMenu.CheckboxItem>
                <DropdownMenu.Separator />
                {#each category_options as option (option.value)}
                    <DropdownMenu.CheckboxItem
                        checked={selected_categories.includes(option.value)}
                        onSelect={(e) => {
                            e.preventDefault();
                            handle_category_select(option.value);
                        }}
                    >
                        {option.label}
                    </DropdownMenu.CheckboxItem>
                {/each}
            </DropdownMenu.Group>
        </DropdownMenu.Content>
    </DropdownMenu.Root>

    <DropdownMenu.Root>
        <DropdownMenu.Trigger disabled={loading} class="flex-1">
            <Button variant="outline" class="w-full justify-between {selected_items.length === 0 ? 'text-muted-foreground' : ''}">
                {get_selected_labels(item_options, selected_items, 'ITEMS')}
                <ChevronsUpDown />
            </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-48 max-h-96" preventScroll={false}>
            <DropdownMenu.Group>
                <DropdownMenu.Label>Items</DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.CheckboxItem
                    checked={selected_items.length === 0}
                    onSelect={(e) => {
                        e.preventDefault();
                        selected_items = [];
                    }}
                >
                    All Items
                </DropdownMenu.CheckboxItem>
                <DropdownMenu.Separator />
                {#each item_options as option (option.value)}
                    <DropdownMenu.CheckboxItem
                        checked={selected_items.includes(option.value)}
                        onSelect={(e) => {
                            e.preventDefault();
                            handle_item_select(option.value);
                        }}
                    >
                        {option.label}
                    </DropdownMenu.CheckboxItem>
                {/each}
            </DropdownMenu.Group>
        </DropdownMenu.Content>
    </DropdownMenu.Root>

    <TagSelector bind:value={selected_tags} disabled={loading} />

    <Button
        variant="ghost"
        size="icon"
        onclick={clear_filters}
        disabled={loading || (selected_categories.length === 0 && selected_items.length === 0 && selected_tags.length === 0)}
    >
        <FilterX />
    </Button>
</div>

<div class="flex-grow flex flex-col overflow-hidden gap-4 pt-4" bind:offsetWidth={chart_width}>
    {#if loading && !expenses?.length}
        <Skeleton class="h-64" />
        <Skeleton class="h-24" />
        <Skeleton class="h-24" />
    {:else if !period?.start || !period?.end}
        <InfoCard>Please select a period to view analytics.</InfoCard>
    {:else}
        {#if chart_data.lines.length}
            <div class="mx-auto max-w-[600px] w-full">
                <StackedAreaChart data={chart_data} width={Math.min(600, chart_width)} aspect={window.innerHeight > window.innerWidth ? 4 / 3 : 21 / 9} />
            </div>
        {:else if !loading}
            <InfoCard>No chart data found for the selected filters in the chosen period.</InfoCard>
        {/if}
        <div class="overflow-y-auto flex-grow flex-shrink flex flex-col gap-2">
            {#if groups.length > 0}
                {#each groups as group}
                    <ExpenseGroupCard {group} ondetailsclick={open_expense_details} />
                {/each}
            {:else if !loading}
                <InfoCard>No expenses found for the selected filters in the chosen period.</InfoCard>
            {/if}
            {#if loading && expenses?.length > 0}
                <Skeleton class="h-24" />
            {/if}
        </div>

        <Button variant="outline" href="/new-expense" class="mt-auto">
            <DollarSign />
            New Expense
        </Button>
    {/if}
</div>

<ExpenseDetailsDialog bind:open={expense_details_dialog_open} expense={expense_details} />
