<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Table from '$lib/components/ui/table';

	export let rows: number = 8;
</script>

<div class="mt-4 flex flex-col gap-4">
	<div class="flex flex-row">
		<Skeleton class="m-4 h-4 w-full" />
		<Skeleton class="m-4 h-4 w-24" />
	</div>
	<div class="flex flex-col rounded-md border">
		{#each Array(rows) as _}
			<Table.Row>
				<Skeleton class="m-4 h-4" />
			</Table.Row>
		{/each}
	</div>
	<div class="flex flex-row justify-between">
		<Skeleton class="m-4 h-4 w-32 min-w-24" />
		<div class="flex flex-grow flex-row">
			<Skeleton class="m-4 h-4 max-w-24 grow" />
			<Skeleton class="m-4 h-4 max-w-24 grow" />
		</div>
	</div>
</div>
