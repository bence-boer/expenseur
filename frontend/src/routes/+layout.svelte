<script lang="ts">
	import { page } from "$app/state";
	import Navbar from "$lib/components/common/navbar.svelte";
	import { Toaster } from "$lib/components/ui/sonner";
	import { auth, service, session } from "$lib/service";
	import { onMount } from "svelte";
	import "../app.css";
	import type { Session } from "$lib/service/auth";
	interface Props {
		children?: import("svelte").Snippet;
	}

	let { children }: Props = $props();

	let route: string = $derived(
		page.url.pathname.split("/").filter(Boolean).pop() || "/",
	);
	const unauthenticated_routes = ["login", "register"];

	let loading_text = $state("Loading...");
	const loading_text_interval = setInterval(() => {
		loading_text += ".";
		if (loading_text.length > 10) loading_text = "Loading";
	}, 200);

	let authenticated = $state(false);
	let loaded = $state(false);

	session.subscribe((state) => (authenticated = state === "VALID"));

	onMount(() => {
		// 1 - check if session cookie exists
		// 2 - if it does, check if it's valid
		// 3 - if it's valid, set authenticated to true
		// 4 - if it's not valid, set authenticated to false
		// 5 - if it doesn't exist, set authenticated to false
		// 6 - set loaded to true
		// 7 - if authenticated is false, redirect to login page

		const current_session: Session = session.get();

		// if(document.cookie.includes("session")) {
		// 	const auth.check_session(document.cookie);

		// }
		// service
		// 	.session()
		// 	.then((session) => {
		// 		authenticated = !!session;
		// 	})
		// 	.finally(() => {
		// 		loaded = true;
		// 	});
	});
	$effect.pre(() => {
		if (loaded) clearInterval(loading_text_interval);
	});
</script>

<div
	class="flex h-full flex-col selection:bg-purple-600 selection:font-bold selection:text-white"
>
	<Navbar bind:authenticated {route} />

	<div
		class="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:container md:px-8"
	>
		{#if authenticated || unauthenticated_routes.includes(route)}
			{@render children?.()}
		{:else if !loaded}
			<div class="flex h-full flex-col">
				<h1 class="text-2xl font-bold md:text-4xl">{loading_text}</h1>
			</div>
		{:else}
			<div class="flex h-full flex-col items-center justify-center">
				<h1 class="text-2xl font-bold md:text-4xl">
					You are not authenticated
				</h1>
				<p class="mt-4">Please sign in to view this page</p>
			</div>
		{/if}
	</div>
</div>

<Toaster theme="dark" />
