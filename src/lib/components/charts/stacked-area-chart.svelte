<script lang="ts">
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale,
		LineController,
		Filler,
		type ChartOptions,
		type ChartData
	} from 'chart.js';
	import type { LineChartData } from './types';

	ChartJS.register(
		Title,
		Tooltip,
		Legend,
		Filler,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale,
		LineController
	);

	interface Props {
		data: LineChartData;
		title?: string;
		label_x?: string;
		label_y?: string;
	}

	let { data, title, label_x, label_y }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: ChartJS | undefined = $state();

	let chart_data: ChartData<'line', number[], string> = $derived({
		labels: data.column_labels,
		datasets: data.lines
			.toSorted((a, b) => Math.max(...a.values) - Math.max(...b.values))
			.map((line) => ({
				label: line.label,
				data: line.values,
				hidden: line.hidden,
				backgroundColor: line.color
			}))
	});

	const options: ChartOptions<'line'> = {
		responsive: true,
		aspectRatio: 0,
		datasets: {
			line: {
				fill: '-1',
				borderColor: 'black',
				borderWidth: 1,
				pointRadius: 0,
				pointHoverRadius: 5,
				pointHoverBorderWidth: 2,
				pointHoverBackgroundColor: 'black',
				pointHoverBorderColor: 'rgba(220, 220, 220, 1)'
			}
		},
		elements: { line: { tension: 0.3 } },
		plugins: {
			title: {
				display: !!title,
				text: title
			}
		},
		interaction: {
			mode: 'nearest',
			intersect: false
		},
		scales: {
			x: {
				title: {
					display: !!label_x,
					text: label_x
				}
			},
			y: {
				stacked: true,
				title: {
					display: !!label_y,
					text: label_y
				}
			}
		}
	};

	$effect.pre(() => {
		if (!canvas || !chart_data) return;

		if (chart) {
			chart.data = $state.snapshot(chart_data) as any;
			chart.update();
		} else {
			chart = new ChartJS(canvas, {
				type: 'line',
				data: $state.snapshot(chart_data) as any,
				options
			});
		}
	});
</script>

<canvas bind:this={canvas}></canvas>
