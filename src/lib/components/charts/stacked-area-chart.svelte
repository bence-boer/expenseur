<script lang="ts">
	import { Line } from 'svelte-chartjs';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale
	} from 'chart.js';
	import type { LineChartData } from './types';

	export let data: LineChartData;
	export let title: string | undefined = undefined;
	export let label_x: string | undefined = undefined;
	export let label_y: string | undefined = undefined;

	ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale);

	const chart_data: Line['$$prop_def']['data'] = {
		labels: data.column_labels,
		datasets: data.lines.map((line) => ({
			label: line.label,
			data: line.values,
			fill: true,
			backgroundColor: line.color,
			borderColor: line.color,
			borderCapStyle: 'butt',
			borderDash: [],
			borderDashOffset: 0.0,
			borderJoinStyle: 'miter',
			pointBorderColor: line.color,
			pointBackgroundColor: line.color,
			pointBorderWidth: 0,
			pointHoverRadius: 5,
			pointHoverBackgroundColor: 'rgb(0, 0, 0)',
			pointHoverBorderColor: 'rgba(220, 220, 220,1)',
			pointHoverBorderWidth: 2,
			pointRadius: 1,
			pointHitRadius: 10
		}))
	};

	const options: Line['$$prop_def']['options'] = {
		responsive: true,
		plugins: {
			title: {
				display: !!title,
				text: title
			},
			tooltip: {
				mode: 'index'
			}
		},
		interaction: {
			mode: 'nearest',
			axis: 'x',
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
</script>

<Line data={chart_data} {options} />
