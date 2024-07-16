<script lang="ts">
	import type { Tables } from '../types/supabase';
	import { supabase } from '../supabaseClient';
	import type { PostgrestSingleResponse } from '@supabase/supabase-js';

	let state: PostgrestSingleResponse<Tables<'units'>[]>;
	supabase
		.from('units')
		.select('*')
		.then((response) => {
			if (response.error) throw response.error;
			state = response;
		});

	$: console.log(state);
</script>

<ul>
	{#each state?.data ?? [] as unit}
		<li>{unit.name}</li>
	{/each}
</ul>
