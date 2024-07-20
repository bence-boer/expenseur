<script lang="ts">
	import type { Tables } from '../../types/supabase';
	import DataTable from './data-table.svelte';

	export let data: { purchases: Tables<'all_tables_view'>[] };
</script>

<div class="py-10 md:container">
	<DataTable data={data.purchases} />
</div>
