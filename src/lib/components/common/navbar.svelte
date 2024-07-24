<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import logo from '$lib/resources/images/logo.svg';
	import type { Route } from '$lib/types';
	import HamburgerNavigation from './hamburger-navigation.svelte';
	import ProfileMenu from './profile-menu.svelte';

	export let authenticated: boolean;
	export let route: string;

	const routes: Route[] = [
		{ name: 'Dashboard', path: '/' },
		{ name: 'Data', path: '/data' },
		{ name: 'Create', path: '/create' }
	];
</script>

<div class="px-4 py-4 drop-shadow-[0_35px_35px_var(--background)] md:px-8">
	<div class="flex items-center justify-between gap-2">
		<HamburgerNavigation {routes} />
		<div class="flex flex-none items-center gap-2 max-sm:hidden">
			<img src={logo} alt="logo" class="h-8 w-8" />
			<a href="/">
				<span class="text-gradient text-xl font-bold">Expenseur</span>
			</a>
		</div>
		<div class="flex flex-initial items-center overflow-x-auto">
			{#if !authenticated && route !== 'login'}
				<Button variant="outline" href="/login">Log In</Button>
			{:else if authenticated}
				{#each routes as { name, path }}
					<Button variant="link" href={path} class="max-sm:hidden">{name}</Button>
				{/each}
				<span class="pl-2">
					<ProfileMenu />
				</span>
			{/if}
		</div>
	</div>
</div>
