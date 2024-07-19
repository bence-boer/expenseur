<script lang="ts">
	import { supabase } from './../../../supabase-client';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import logo from '$lib/resources/images/logo.svg';

	export let authenticated;
	let route = '/';
	$: route = $page.url.pathname.split('/').filter(Boolean).pop() || '/';

	const pages = [
		{ name: 'Create', path: '/create' },
		{ name: 'Data', path: '/data' }
	];

	const logout = () => {
		supabase.auth.signOut().then(() => {
			goto('/');
		});
	};
</script>

<div class="px-4 py-4 drop-shadow-[0_35px_35px_var(--background)] md:px-8">
	<div class="flex items-center justify-between">
		<div class="flex items-center">
			<img src={logo} alt="logo" class="mr-2 h-8 w-8" />
			<a href="/">
				<span class="text-gradient text-xl font-bold">Expenseur</span>
			</a>
		</div>
		<div class="flex items-center">
			{#if !authenticated && route !== 'login'}
				<Button variant="outline" href="/login">Log In</Button>
			{:else if authenticated}
				{#each pages as { name, path }}
					<Button variant="link" href={path}>{name}</Button>
				{/each}
				<Button variant="outline" on:click={logout}>Log out</Button>
			{/if}
		</div>
	</div>
</div>

<style>
	.text-gradient {
		background: linear-gradient(45deg, #8a37a6, #5553eb);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
</style>
