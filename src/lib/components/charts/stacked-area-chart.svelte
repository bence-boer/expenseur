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

	// TODO: add fill under lines
	let chart_data: Line['$$prop_def']['data'];
	$: chart_data = {
		labels: data.column_labels,
		datasets: data.lines.map((line) => ({
			label: line.label,
			data: line.values,
			fill: 'origin',
			hidden: line.hidden,
			backgroundColor: line.color,
			borderColor: line.color,
			borderCapStyle: 'butt',
			borderDash: [],
			borderDashOffset: 0.0,
			borderJoinStyle: 'miter',
			lineTension: 0.3,
			pointBorderColor: line.color,
			pointBackgroundColor: line.color,
			pointBorderWidth: 0,
			pointHoverRadius: 5,
			pointHoverBackgroundColor: '#000000',
			pointHoverBorderColor: 'rgba(220, 220, 220,1)',
			pointHoverBorderWidth: 2,
			pointRadius: 1,
			pointHitRadius: 10
		}))
	};

	const options: Line['$$prop_def']['options'] = {
		responsive: true,
		aspectRatio: 0,
		plugins: {
			title: {
				display: !!title,
				text: title
			},
			tooltip: {
				mode: 'index'
			},
			filler: {
				propagate: true,
				drawTime: 'beforeDatasetsDraw'
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
