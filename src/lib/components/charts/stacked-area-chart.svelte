<script lang="ts">
	import { VisXYContainer, VisAxis, VisArea, VisXYLabels } from '@unovis/svelte';
	import { type Data, data as d } from './data';
	import { CurveType } from '@unovis/ts';

	export let data: Data[];
	export let xAxisLabel: string | undefined = undefined;
	export let yAxisLabel: string | undefined = undefined;

	const format_set = new Set(Object.keys(data[0] ?? {}));
	format_set.delete('x');
	const formats = [...format_set];
	console.log('formats', formats);

	type Label = {
		label: string;
		value: number;
		color: string;
	};

	function getMaxItems<T extends Record<string, number>>(
		array: T[],
		keys: (keyof T)[]
	): { [key in keyof T]?: T } {
		const maxIndex = (k: keyof T): number =>
			array.reduce((max, curr, i) => (curr[k] > array[max][k] ? i : max), 0);
		const entries = keys.map((key) => [key, array[maxIndex(key)]]);

		return Object.fromEntries(entries);
	}

	function getLabels(data: Data[]): Record<number, Label> {
		// map formats to their maximum data records
		const peakItems = getMaxItems(data.slice(0, data.length - 3), formats);

		// place labels at [x,y] where x = peak year and y = area midpoint
		return formats.reduce((obj: Record<number, Label>, format, i) => {
			const offset = Array(i)
				.fill(0)
				.reduce((sum, _, j) => sum + peakItems[format]![formats[j]], 0);
			const [x, y] = [peakItems[format]!.x, offset + peakItems[format]![format] / 2];

			obj[x] = {
				label: format.charAt(0).toUpperCase() + format.slice(1),
				value: y,
				color: 'none'
			};

			return obj;
		}, {});
	}

	const labels = getLabels(data);
	console.log(data, labels);

	const x = (item: Data) => item.x;
	const y = formats.map((label) => (item: Data) => item[label]);
	const labelProps = {
		x: (item: Data) => {
			const value = labels[item.x] ? item.x : undefined;
			console.log(`labels[${item.x}]`, labels[item.x]);
			return value;
		},
		y: (item: Data) => labels[item.x]?.value,
		label: (item: Data) => labels[item.x]?.label,
		backgroundColor: (item: Data) => labels[item.x]?.color ?? 'none'
	};
</script>

<VisXYContainer {data} height={500}>
	<VisXYLabels {...labelProps} clusterBackgroundColor="none" clusterLabel={() => ''} />
	<VisArea {x} {y} curveType={CurveType.CatmullRom} />
	<VisAxis type="x" label={xAxisLabel} numTicks={10} gridLine={false} domainLine={false} />
	<VisAxis type="y" label={yAxisLabel} numTicks={10} />
</VisXYContainer>
