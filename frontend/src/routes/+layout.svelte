<script lang="ts">
	import { page } from "$app/state";
	import Navbar from "$lib/components/common/navbar.svelte";
	import { Progress } from "$lib/components/ui/progress/index.ts";
	import { Toaster } from "$lib/components/ui/sonner";
	import { session } from "$lib/service";
	import "../app.css";
	interface Props {
		children?: import("svelte").Snippet;
	}

	let { children }: Props = $props();

	let route: string = $derived(
		page.url.pathname.split("/").filter(Boolean).pop() || "/",
	);
	const unauthenticated_routes = ["login", "register"];

	const loading_interval = setInterval(() => {
		progress += (100 - progress) * Math.random() * 0.4;
		console.log(progress);
	}, 200);

	let authenticated = $state(false);
	let loaded = $state(false);
	let progress: number = $state(0);

	session.subscribe((state) => {
		authenticated = state === "VALID";

		if (state !== "EXPIRED") {
			loaded = true;
			clearInterval(loading_interval);
		}
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
				<h1 class="text-2xl font-bold md:text-4xl">Authenticating</h1>
				<Progress value={progress} max={100} />
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
