<script lang="ts">
	import {
		DoughnutController,
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		ArcElement,
		CategoryScale,
		type ChartData
	} from 'chart.js';
	import type { DonutDataPoint } from './types';

	ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, DoughnutController);

	interface Props {
		data: DonutDataPoint[];
	}

	let { data }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: ChartJS | undefined = $state();

	const donut_default: ChartData<'doughnut', number[], string> = {
		labels: [],
		datasets: [
			{
				data: [],
				backgroundColor: [],
				hoverBackgroundColor: [],
				borderColor: '#020817',
				borderJoinStyle: 'round',
				borderWidth: 4,
				borderRadius: 10
			}
		]
	};

	const chart_data: ChartData<'doughnut', number[], string> = $derived(
		data.reduce((acc, { label, value, backgroundColor, hoverBackgroundColor }) => {
			acc.labels!.push(label);
			acc.datasets[0].data.push(value);
			(acc.datasets[0].backgroundColor as string[]).push(backgroundColor);
			(acc.datasets[0].hoverBackgroundColor as string[]).push(hoverBackgroundColor);
			return acc;
		}, structuredClone(donut_default))
	);

	$effect.pre(() => {
		if (canvas && data) {
			if (chart) {
				chart.data = chart_data;
				chart.update();
			} else {
				chart = new ChartJS(canvas, {
					type: 'doughnut',
					data: chart_data
				});
			}
		}
	});
</script>

<canvas bind:this={canvas}></canvas>
