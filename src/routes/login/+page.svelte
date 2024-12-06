<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui-custom/input';
	import { supabase } from '../../supabase-client';
	import { browser } from '$app/environment';

	let email: string = $state('');
	let password: string = $state('');

	const back = () => {
		if (browser) goto('/');
	};

	supabase.auth.getUser().then(({ data }) => {
		!!data.user && back();
	});

	let failed = $state(false);
	const login = () => {
		supabase.auth
			.signInWithPassword({
				email: email,
				password: password
			})
			.then((response) => {
				if (response.error) throw response.error;
				goto('/');
			})
			.catch((error) => {
				console.error('Login error:', error.message);
				failed = true;
			});
	};
</script>

<form class="flex h-full items-center justify-center">
	<Card.Root class="w-72">
		<Card.Header>
			<Card.Title>Login</Card.Title>
			<Card.Description>Log in to access database</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="mb-2">
				<Input type="email" placeholder="email" class="w-full" bind:value={email} />
			</div>
			<div>
				<Input type="password" placeholder="password" class="w-full" bind:value={password} />
			</div>
			<div class="size h-2 text-right text-xs text-red-500">
				{#if failed}
					Login failed
				{/if}
			</div>
		</Card.Content>
		<Card.Footer class="justify-end gap-2">
			<Button variant="outline" onclick={back} type="reset">Back</Button>
			<Button variant="default" onclick={login} type="submit">Login</Button>
		</Card.Footer>
	</Card.Root>
</form>
