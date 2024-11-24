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

	export let data: LineChartData;
	export let title: string | undefined = undefined;
	export let label_x: string | undefined = undefined;
	export let label_y: string | undefined = undefined;

	let canvas: HTMLCanvasElement;
	let chart: ChartJS;
	let chart_data: ChartData<'line', number[], string>;

	$: chart_data = {
		labels: data.column_labels,
		datasets: data.lines
			.toSorted((a, b) => Math.max(...a.values) - Math.max(...b.values))
			.map((line) => ({
				label: line.label,
				data: line.values,
				hidden: line.hidden,
				backgroundColor: line.color
			}))
	};

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

	$: if (canvas && chart_data) {
		if (chart) {
			chart.data = chart_data;
			chart.update();
		} else {
			chart = new ChartJS(canvas, {
				type: 'line',
				data: chart_data,
				options
			});
		}
	}
</script>

<canvas bind:this={canvas} />
