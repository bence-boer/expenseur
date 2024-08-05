<script lang="ts">
	import { Doughnut } from 'svelte-chartjs';

	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		ArcElement,
		CategoryScale,
		type ChartData
	} from 'chart.js';
	import type { DonutDataPoint } from './types';

	const donut_default: ChartData<'doughnut', number[], string> = {
		labels: [],
		datasets: [
			{
				data: [],
				backgroundColor: [],
				hoverBackgroundColor: [],
				borderJoinStyle: 'round',
				borderColor: '#020817',
				borderWidth: 4
			}
		]
	};

	export let data: DonutDataPoint[];

	$: dataset = data.reduce((acc, { label, value, backgroundColor, hoverBackgroundColor }) => {
		acc.labels!.push(label);
		acc.datasets[0].data.push(value);
		(acc.datasets[0].backgroundColor as string[]).push(backgroundColor);
		(acc.datasets[0].hoverBackgroundColor as string[]).push(hoverBackgroundColor);
		return acc;
	}, structuredClone(donut_default));

	ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);
</script>

<Doughnut data={dataset} options={{ responsive: true }} />
