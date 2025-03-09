<script lang="ts">
    import { currency_formatter } from '$lib/consts';
    import { format_currency_short } from '$lib/utils';
    import { BarController, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip, type ChartData, type Color } from 'chart.js';
    import type { BarDataPoint } from './types';

    ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, BarController);

    const COLOR = {
        LINE: `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--border').trim()})`,
        BACKGROUND: `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--background').trim()})`
    } satisfies Record<Uppercase<string>, Color>;

    interface Props {
        data: BarDataPoint[];
    }

    let { data }: Props = $props();
    let canvas: HTMLCanvasElement | undefined = $state();
    let chart: ChartJS | undefined = $state();

    $effect.pre(() => {
        if (canvas && data) {
            const dataset = {
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: [],
                borderColor: [],
                borderWidth: 1,
                borderRadius: 5,
                stack: 'total'
            } satisfies ChartData<'bar'>['datasets'][number];

            data.filter(({ hidden }) => !hidden).forEach((item) => {
                dataset.data.push(item.value);
                dataset.borderColor.push(item.color);
                dataset.backgroundColor.push(`color-mix(in srgb, ${item.color} 60%, ${COLOR.BACKGROUND} 40%)`);
                dataset.hoverBackgroundColor.push(item.color);
            });

            const labels = Array.from(new Set(data.map(({ label }) => label)));

            if (chart) {
                chart.data = {
                    labels: labels,
                    datasets: [dataset]
                };
                chart.update();
            } else {
                chart = new ChartJS(canvas, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [dataset]
                    },
                    options: {
                        aspectRatio: 4 / 3,
                        scales: {
                            x: {
                                beginAtZero: true,
                                grid: { display: false }
                            },
                            y: {
                                beginAtZero: true,
                                grid: { color: COLOR.LINE },
                                ticks: { callback: format_currency_short }
                            }
                        },
                        plugins: {
                            legend: { display: false },
                            title: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: (context) => currency_formatter.format(context.parsed.y)
                                }
                            }
                        }
                    }
                });
            }
        }
    });
</script>

<canvas bind:this={canvas}></canvas>
