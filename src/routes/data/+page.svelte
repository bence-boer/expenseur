<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { supabase } from '../../supabase-client';
	import type { Tables } from '../../types/supabase';
	import DataTable from './data-table.svelte';

	export let data: { purchases: Tables<'all_tables_view'>[] };
	const delete_item = async (id: number): Promise<void> => {
		return supabase
			.from('purchases')
			.delete()
			.eq('id', id)
			.then(({ error }) => {
				if (error) {
					toast.error(error.message);
					return;
				}
				toast.success('Item deleted successfully');
				data.purchases = data.purchases.filter((purchase) => purchase.id !== id);
			});
	};
</script>

<div class="py-10 md:container">
	<DataTable data={data.purchases} {delete_item} />
</div>
