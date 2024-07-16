<script lang="ts">
	import type { Tables } from '../types/supabase';

	export let data: { units: Tables<'units'>[] };
</script>

<ul>
	{#each data.units as unit}
		<li>{unit.name}</li>
	{/each}
</ul>
