<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import type { Tables } from '../types/supabase';
	import { supabase } from '../supabaseClient';
	import type { PostgrestSingleResponse } from '@supabase/supabase-js';

	let authenticated = supabase.auth.getSession() !== null;
	supabase.auth.onAuthStateChange((_, session) => {
		authenticated = session !== null;
	});

	let state: PostgrestSingleResponse<Tables<'units'>[]>;
	supabase
		.from('units')
		.select('*')
		.then((response) => {
			if (response.error) throw response.error;
			state = response;
		});

	const logout = () => {
		supabase.auth.signOut().then(() => {
			goto('/');
		});
	};
</script>

{#if authenticated}
	<Button variant="outline" on:click={logout}>Logout</Button>
	<ul>
		{#each state?.data ?? [] as unit}
			<li>{unit.name}</li>
		{/each}
	</ul>
{/if}
{#if !authenticated}
	<a href="/login">
		<Button variant="outline">Login</Button>
	</a>
{/if}
