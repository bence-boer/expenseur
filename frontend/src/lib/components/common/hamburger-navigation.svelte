<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sheet from '$lib/components/ui/sheet';
	import logo from '$lib/resources/images/logo.svg';
	import type { Route } from '$lib/types';
	import { Menu } from '@lucide/svelte';

	interface Props {
		routes: Route[];
	}

	let { routes }: Props = $props();
	let open = $state(false);

	const close = () => (open = false);
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger>
		<Menu size="36" />
	</Sheet.Trigger>
	<Sheet.Content side="left" class="p-0">
		<Sheet.Header class="my-6">
			<a href="/">
				<Sheet.Title class="mx-6 flex flex-none items-center gap-2" onclick={close}>
					<img src={logo} alt="logo" class="h-8 w-8" />
					<span class="text-gradient text-xl font-bold">Expenseur</span>
				</Sheet.Title>
			</a>
		</Sheet.Header>

		<div class="flex flex-col">
			{#each routes as { name, path }}
				<Separator />
				<Button
					variant="link"
					href={path}
					onclick={close}
					size="lg"
					class="justify-start py-6 sm:hidden"
				>
					{name}
				</Button>
			{/each}
			<Separator />
		</div>
	</Sheet.Content>
</Sheet.Root>
