<script lang="ts" generics="DATA extends Record<string, any>">
	import type { HTMLTableAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import * as Table from '$lib/components/ui/table';
	import type { DataTableProps } from './types';
	import DataTableSkeleton from './data-table-skeleton.svelte';

	let {
		ref = $bindable(null),
		class: className,
		caption,
		columns = [],
		data = [],
		key,
		loading = false,
		...restProps
	}: WithElementRef<HTMLTableAttributes> & DataTableProps<DATA> = $props();
</script>

<div class="relative w-full overflow-auto rounded-md border">
	{#if loading}
		<DataTableSkeleton />
	{:else}
		<Table.Root class={className} {...restProps} bind:ref>
			{#if caption}
				<Table.Caption>{caption}</Table.Caption>
			{/if}
			<Table.Header>
				<Table.Row>
					{#each columns as { header, header_class }}
						<Table.Head class={header_class}>{header}</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data as item, index (key ? item[key] : index)}
					<Table.Row>
						{#each columns as { field, field_class, format }}
							<Table.Cell class={field_class + ' h-14'}>
								{format ? format(item[field]) : item[field]}
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			</Table.Body>
			<Table.Footer>
				<Table.Row>
					{#each columns as { field, footer, footer_class }}
						<Table.Cell class={footer_class}>
							{#if footer instanceof Function}
								{data.map((data) => data[field])}
							{:else}
								{footer ?? ''}
							{/if}
						</Table.Cell>
					{/each}
				</Table.Row>
			</Table.Footer>
		</Table.Root>
	{/if}
</div>
