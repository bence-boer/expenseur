<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { supabase } from '../../supabase-client';
	import type { Tables } from '../../types/supabase';
	import { Separator } from '$lib/components/ui/separator';
	import * as service from '$lib/service';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import DataTable from '$lib/components/ui-custom/data-table';

	let purchases: Tables<'all_tables_view'>[];
	service.get_detailed_purchases().then((data) => {
		purchases = data;
	});
	const delete_item = async (id: number): Promise<void> => {
		return service
			.delete_purchase(id)
			.then(() => {
				toast.success('Item deleted successfully');
				purchases = purchases.filter((purchase) => purchase.id !== id);
			})
			.catch((error) => {
				toast.error(error.message);
			});
	};
</script>

<div class="sm:container sm:py-10">
	<h1 class="mb-4 text-2xl font-bold sm:text-4xl">Data</h1>
	<Separator class="sm:mb-8" />
	{#if purchases}
		<DataTable data={purchases} {delete_item} />
	{:else}
		<Skeleton class="h-full w-full flex-1" />
	{/if}
</div>
