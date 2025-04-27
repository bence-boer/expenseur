<script lang="ts">
    import { goto } from '$app/navigation';
    import BarChart from '$lib/components/charts/bar-chart.svelte';
    import type { BarDataPoint } from '$lib/components/charts/types';
    import { ErrorCard } from '$lib/components/common/error-card';
    import { FrequencySelector, type Frequency } from '$lib/components/common/frequency-selector';
    import { InfoCard } from '$lib/components/common/info-card';
    import { PeriodSelector, type Period } from '$lib/components/common/period-selector';
    import { Separator } from '$lib/components/ui/separator';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import * as Table from '$lib/components/ui/table';
    import { currency_formatter } from '$lib/consts';
    import { service, ServiceTypes } from '$lib/service';
    import { format_currency_short, format_date, format_number } from '$lib/utils.ts';
    import { ArrowDown, ArrowUp } from '@lucide/svelte';

    let period: Period | undefined = $state();
    let period_label: string = $derived.by(() => {
        if (!period?.start || !period?.end) return '-';
        return `${format_date(period.start.toString())} - ${format_date(period.end.toString())}`;
    });

    let average: Frequency | undefined = $state();

    const select_period = (value: Period): void => {
        period = value;
    };
    const select_average = (value: Frequency): void => {
        average = value;
    };

    type Data = {
        table?: (ServiceTypes.SpendingsByCategory & { change?: number })[];
        diagram?: BarDataPoint[];
        summary_text?: string;
        total?: number;
        change?: number;
    };

    const data_transform = (current: ServiceTypes.SpendingsByCategory[], previous: ServiceTypes.SpendingsByCategory[], average?: Frequency): Data => {
        const factor = average ? average.value / period.days : 1;
        return {
            table: current.map((item) => ({
                ...item,
                total: item.total * factor,
                change: Math.round((item.total / (previous.find(({ category }) => category === item.category)?.total || item.total) - 1) * 100)
            })),
            diagram: current.map(({ category, total, color }) => ({
                label: category,
                value: total * factor,
                color
            })),
            summary_text: average ? `${average.label} average` : 'Total',
            total: current.reduce((acc, { total }) => acc + total, 0) * factor,
            change: Math.round((current.reduce((acc, { total }) => acc + total, 0) / previous.reduce((acc, { total }) => acc + total, 0) - 1) * 100)
        };
    };

    const fetch_data = (period: Period, average?: Frequency): Promise<Data> =>
        Promise.all([
            service.get_spendings_by_category({ start_date: period.start.toString(), end_date: period.end.toString() }),
            service.get_spendings_by_category({ start_date: period.previous_start.toString(), end_date: period.previous_end.toString() })
        ]).then(([current, previous]) => data_transform(current, previous, average));

    const data: Promise<Data> = $derived(period?.start && period?.end ? fetch_data(period, average) : Promise.resolve({}));

    const go_to_analytics = (category?: string): void => {
        const search = new URLSearchParams({ category, start: period.start.toString(), end: period.end.toString() });
        goto(`/analytics?${search}`);
    };
</script>

<div class="flex flex-row justify-between gap-4">
    <div>
        <h1 class="text-2xl font-bold sm:text-4xl">Dashboard</h1>
        <span class="text-slate-400 text-xs">{period_label}</span>
    </div>
    <div class="flex flex-col sm:flex-row items-start gap-2">
        <PeriodSelector select={select_period} class="w-36" />
        <FrequencySelector select={select_average} class="w-36" />
    </div>
</div>

<Separator class="mb-2 sm:mb-6" />

{#snippet change(percent: number)}
    <span
        class={{
            'w-min rounded-sm border text-xs pl-2 pr-[10px] pb-[1px]': true,
            'bg-red-900 border-red-500': percent > 0,
            'bg-green-900 border-green-600': percent < 0
        }}
    >
        {#if percent > 0}+{/if}{format_number(percent)}%
    </span>
{/snippet}

<div class="flex max-w-96 flex-1 flex-col gap-4">
    {#await data}
        <div class="flex aspect-square w-full flex-col gap-4">
            <Skeleton class="h-14" />

            <Skeleton class="h-60" />
            <Skeleton class="h-40" />
        </div>
    {:then data}
        {#if data.diagram?.length && data.table?.length && data.total && data.change}
            {@const more = data.change > 0}
            {@const less = data.change < 0}
            {@const same = data.change === 0}

            <div class="bg-slate-900 border border-slate-800 flex justify-between items-center p-4 h-14 rounded-md">
                <div class="flex items-center gap-2">
                    {#if more}
                        <ArrowUp size="1em" class="text-red-900" />
                    {:else if less}
                        <ArrowDown size="1em" class="text-green-800" />
                    {/if}
                    <span class={{ 'ml-6': same }}>
                        {data.summary_text}
                    </span>
                </div>
                <div class="flex items-center gap-4">
                    {format_currency_short(data.total)}
                    {@render change(data.change)}
                </div>
            </div>

            <BarChart data={data.diagram} />

            <div class="flex flex-1 flex-col gap-2">
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head>Category</Table.Head>
                            <Table.Head class="text-right">Amount</Table.Head>
                            <Table.Head class="w-16 text-center">Change</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each data.table as { id, category, total, change: percent }, index}
                            <Table.Row onclick={() => go_to_analytics(String(id))}>
                                {@const more = percent > 0}
                                {@const less = percent < 0}
                                {@const same = percent === 0}
                                <Table.Cell>
                                    <div class="flex flex-row flex-nowrap items-center gap-2">
                                        {#if more}
                                            <ArrowUp size="1em" class="text-red-900" />
                                        {:else if less}
                                            <ArrowDown size="1em" class="text-green-800" />
                                        {/if}
                                        <span class={{ 'pl-6': same }}>{category}</span>
                                    </div>
                                </Table.Cell>
                                <Table.Cell class="text-right">
                                    {currency_formatter.format(total)}
                                </Table.Cell>
                                <Table.Cell class="h-12 text-center">
                                    {#if percent}
                                        {@render change(percent)}
                                    {/if}
                                </Table.Cell>
                            </Table.Row>
                        {:else}
                            {#each Array(6) as _}
                                <Table.Row>
                                    <Table.Cell class="w-full" colspan={3}>
                                        <Skeleton class="h-4 m-2" />
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        {/each}
                    </Table.Body>
                </Table.Root>
            </div>
        {:else}
            <InfoCard>No data available for the selected period</InfoCard>
        {/if}
    {:catch error}
        <ErrorCard>The data could not be loaded. Please try again later.</ErrorCard>
    {/await}
</div>
