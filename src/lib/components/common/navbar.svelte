<script lang="ts">
	import { supabase } from './../../../supabase-client';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import logo from '$lib/resources/images/logo.svg';

	export let authenticated: boolean;
	export let route: string;

	const pages = [
		{ name: 'Data', path: '/data' },
		{ name: 'Create', path: '/create' },
		{ name: 'TMP_CREATE', path: '/tmp-create' }
	];

	const logout = () => {
		supabase.auth.signOut().then(() => {
			goto('/');
		});
	};
</script>

<div class="px-4 py-4 drop-shadow-[0_35px_35px_var(--background)] md:px-8">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-none items-center gap-2">
			<img src={logo} alt="logo" class="h-8 w-8" />
			<a href="/">
				<span class="text-gradient text-xl font-bold">Expenseur</span>
			</a>
		</div>
		<div class="flex flex-initial items-center overflow-x-auto">
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
