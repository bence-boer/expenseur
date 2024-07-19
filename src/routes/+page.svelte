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

	const logout = () => {
		supabase.auth.signOut().then(() => {
			goto('/');
		});
	};
</script>

{#if authenticated}
	<div class="h-full w-full text-center align-middle">
		<p class="my-auto">You are logged in</p>
	</div>
{:else}
	<p>You need to login to access this page</p>
{/if}
