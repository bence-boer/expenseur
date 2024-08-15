<script lang="ts">
	import { page } from '$app/stores';
	import Navbar from '$lib/components/common/navbar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';
	import { supabase } from '../supabase-client';

	$: route = $page.url.pathname.split('/').filter(Boolean).pop() || '/';

	let loading_text = 'Loading...';
	const loading_text_interval = setInterval(() => {
		loading_text += '.';
		if (loading_text.length > 10) loading_text = 'Loading';
	}, 200);

	let authenticated = false;
	let loaded = false;
	supabase.auth.onAuthStateChange((_, session) => {
		authenticated = !!session;
		loaded = true;
	});
	$: if (loaded) clearInterval(loading_text_interval);
</script>

<div class="flex h-full flex-col selection:bg-purple-600 selection:font-bold selection:text-white">
	<Navbar bind:authenticated bind:route />

	<div class="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:container md:px-8">
		{#if authenticated || route === 'login'}
			<slot></slot>
		{:else if !loaded}
			<div class="flex h-full flex-col">
				<h1 class="text-2xl font-bold md:text-4xl">{loading_text}</h1>
			</div>
		{:else}
			<div class="flex h-full flex-col items-center justify-center">
				<h1 class="text-2xl font-bold md:text-4xl">You are not authenticated</h1>
				<p class="mt-4">Please sign in to view this page</p>
			</div>
		{/if}
	</div>
</div>

<Toaster theme="dark" />
