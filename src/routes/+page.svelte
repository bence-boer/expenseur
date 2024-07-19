<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import type { Tables } from '../types/supabase';
	import { supabase } from '../supabase-client';
	import type { PostgrestSingleResponse } from '@supabase/supabase-js';

	let authenticated = false;
	supabase.auth.onAuthStateChange((_, session) => {
		authenticated = session !== null;
	});

	let state: Tables<'all_tables_view'>[] = [];
	supabase
		.from('all_tables_view')
		.select('*')
		.then((response) => {
			if (response.error) throw response.error;
			state = response.data;
		});

	const logout = () => {
		supabase.auth.signOut().then(() => {
			goto('/');
		});
	};
</script>

{#if authenticated}
	<ul>
		{#each state as purchase}
			<li>{purchase.item}</li>
		{/each}
	</ul>
{/if}

{#if !authenticated}
	<p>You need to login to access this page</p>
{/if}
