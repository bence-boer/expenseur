<script lang="ts">
	import type { HTMLTableAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import * as Table from '$lib/components/ui/table';
	import type { DataTableProps } from './types';
	import { Skeleton } from '$lib/components/ui/skeleton';

	type DataTableSkeletonProps = Pick<DataTableProps<never>, 'caption'>;

	let {
		ref = $bindable(null),
		class: className,
		caption,
		...restProps
	}: WithElementRef<HTMLTableAttributes> & DataTableSkeletonProps = $props();
</script>

<div class="relative w-full overflow-auto">
	<Table.Root class={className} {...restProps} bind:ref>
		{#if caption}
			<Table.Caption>
				<Skeleton class="m-2 h-4" />
			</Table.Caption>
		{/if}
		<Table.Header>
			<Table.Row>
				<Table.Head>
					<Skeleton class="m-2 h-4" />
				</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each Array(3) as _}
				<Table.Row>
					<Table.Cell>
						<Skeleton class="m-2 h-4" />
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
		<Table.Footer>
			<Table.Row>
				<Skeleton class="m-2 h-4" />
			</Table.Row>
		</Table.Footer>
	</Table.Root>
</div>
