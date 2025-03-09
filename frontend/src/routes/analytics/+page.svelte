<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import StackedAreaChart from '$lib/components/charts/stacked-area-chart.svelte';
    import type { LineChartData } from '$lib/components/charts/types';
    import { InfoCard } from '$lib/components/common/info-card';
    import { type Period } from '$lib/components/common/period-selector';
    import PeriodSelector from '$lib/components/common/period-selector/period-selector.svelte';
    import { PurchaseDetailsDialog } from '$lib/components/common/purchase-details-dialog';
    import { PurchaseGroupCard, type PurchaseGroup } from '$lib/components/common/purchase-group';
    import ComboBox from '$lib/components/ui-custom/combo-box/combo-box.svelte';
    import { Button } from '$lib/components/ui/button';
    import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
    import { service, ServiceTypes } from '$lib/service';
    import type { LabelValue } from '$lib/types';
    import { day_difference, format_date } from '$lib/utils';
    import { CalendarDate, parseDate } from '@internationalized/date';
    import { DollarSign } from '@lucide/svelte';
    import { untrack } from 'svelte';

    const ALL: LabelValue<string> = { label: 'All', value: 'all' };
    let category: string = $state(page.url.searchParams.get('category') || ALL.value);
    let period: Period = $state();

    let start: CalendarDate, end: CalendarDate;
    const [start_string, end_string] = [page.url.searchParams.get('start'), page.url.searchParams.get('end')];
    if (start_string && end_string) [start, end] = [parseDate(start_string), parseDate(end_string)];
    let searched_period: Period = $state(start && end ? ({ start, end, days: day_difference(start, end) } as Period) : null);

    let spendings: ServiceTypes.SpendingsByCategoryInterval = $state();
    let purchases: ServiceTypes.Purchase = $state();
    let filtered_datasets: ServiceTypes.SpendingsByCategoryInterval = $derived.by(() => {
        if (!spendings?.data?.length) return [];
        if (category === 'all') return spendings.data;
        return [spendings.data.find((dataset) => dataset.category === category)];
    });

    let categories: LabelValue<string>[] = $derived(
        spendings ? [ALL, ...spendings?.data?.map(({ category }) => ({ label: category, value: category }))] : [ALL]
    );

    let chart_data: LineChartData = $derived({
        column_labels: spendings?.dates?.map(format_date) ?? [],
        lines: filtered_datasets.map(({ category, color, values }: { category: string; color: string; values: number[] }) => ({
            label: category,
            hidden: false,
            color,
            values
        }))
    });

    let groups: PurchaseGroup[] = $derived.by(() => {
        if (!purchases) return [];

        const map: Map<string, PurchaseGroup> = new Map();
        for (const purchase of purchases) {
            if (category !== ALL.value && purchase.category !== category) continue;

            const date: string = purchase.date;
            if (!map.has(date)) map.set(date, { date, total: 0, purchases: [] });

            const group: PurchaseGroup = map.get(date);
            group.total += purchase.price;
            group.purchases.push(purchase);
        }

        return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
    });
    let loading: boolean = $state(false);

    const update_search = (start?: string, end?: string) => {
        const search = new URLSearchParams(page.url.searchParams);
        if (start && end) {
            search.set('start', start);
            search.set('end', end);
        }
        if (category !== ALL.value) search.set('category', category);

        goto(`?${search}`, { replaceState: true });
    };

    const load_data = (start: string, end: string, period: number): void => {
        loading = true;
        const intervalled = service
            .get_spendings_by_category_interval({
                start_date: start,
                end_date: end,
                days_interval: period
            })
            .then((response) => {
                spendings = { data: response.data.filter((dataset) => dataset.values.some(Boolean)), dates: response.dates };
            });

        const detailed = service
            .get_purchases({
                start_date: start,
                end_date: end
            })
            .then((response) => {
                purchases = response;
            });

        Promise.allSettled([intervalled, detailed]).then(() => (loading = false));
    };

    $effect(() => {
        if (untrack(() => !loading) && period?.start && period?.end) load_data(period.start.toString(), period.end.toString(), Math.ceil(period.days / 5));
    });

    const select_period = (value: Period): void => {
        period = value;
        const start = value.start.toString();
        const end = value.end.toString();

        update_search(start, end);
    };

    let purchase_details_dialog_open: boolean = $state(false);
    let purchase_details: ServiceTypes.Purchase = $state({});

    const open_purchase_details = (purchase: ServiceTypes.Purchase): void => {
        purchase_details = purchase;
        purchase_details_dialog_open = true;
    };
</script>

<div class="flex flex-row gap-4 justify-between">
    <h1 class="text-2xl font-bold sm:text-4xl">Analytics</h1>
    <PeriodSelector select={select_period} default={searched_period} class="w-36" />
</div>

<ComboBox data={categories} bind:value={category} placeholder="Select category..." disabled={loading} onchange={update_search} />

<div class="flex-grow flex flex-col overflow-hidden gap-4">
    {#if loading}
        <Skeleton class="mt-4 h-full" />
    {:else}
        {#if chart_data.lines.length}
            <StackedAreaChart data={chart_data} />
        {:else}
            <InfoCard>No chart data found for this category in the selected period</InfoCard>
        {/if}
        <div class="overflow-y-auto flex-grow flex-shrink flex flex-col gap-2">
            {#each groups as group}
                <PurchaseGroupCard {group} ondetailsclick={open_purchase_details} />
            {:else}
                <InfoCard>No purchases found for this category in the selected period</InfoCard>
            {/each}
        </div>

        <Button variant="outline" href="/new-expense" class="mt-auto">
            <DollarSign />
            New Expense
        </Button>
    {/if}
</div>

<PurchaseDetailsDialog bind:open={purchase_details_dialog_open} purchase={purchase_details} />
