<script lang="ts">
	import '../app.css';
	import { supabase } from '../supabase-client';
	import Navbar from '$lib/components/common/navbar.svelte';

	let authenticated = false;
	supabase.auth.onAuthStateChange((_, session) => {
		authenticated = session !== null;
	});
</script>

<div class="flex h-full flex-col">
	<Navbar {authenticated} />
	<div
		class="flex flex-1 flex-col overflow-y-auto px-4 py-4 selection:bg-amber-400 selection:font-bold selection:text-gray-900 md:px-8"
	>
		<slot></slot>
	</div>
</div>
