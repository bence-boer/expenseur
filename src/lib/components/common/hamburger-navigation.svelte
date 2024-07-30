<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sheet from '$lib/components/ui/sheet';
	import logo from '$lib/resources/images/logo.svg';
	import type { Route } from '$lib/types';
	import { GanttChart } from 'lucide-svelte';

	export let routes: Route[];
	let open = false;

	const close = () => (open = false);
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger>
		<GanttChart size="36" />
	</Sheet.Trigger>
	<Sheet.Content side="left">
		<Sheet.Header class="mb-12">
			<Sheet.Title class="flex flex-none items-center gap-2" on:click={close}>
				<img src={logo} alt="logo" class="h-8 w-8" />
				<a href="/">
					<span class="text-gradient text-xl font-bold">Expenseur</span>
				</a>
			</Sheet.Title>
		</Sheet.Header>

		<div class="flex flex-col">
			{#each routes as { name, path }}
				<Separator />
				<Button variant="link" href={path} on:click={close} class="my-1 justify-start sm:hidden">
					{name}
				</Button>
			{/each}
			<Separator />
		</div>
	</Sheet.Content>
</Sheet.Root>
