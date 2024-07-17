<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { supabase } from '../../supabase-client';

	let email: string;
	let password: string;

	const back = () => {
		goto('/');
	};

	const login = () => {
		supabase.auth
			.signInWithPassword({
				email: email,
				password: password
			})
			.then((response) => {
				if (response.error) throw response.error;
				goto('/');
			});
	};
</script>

<div class="flex h-full items-center justify-center">
	<Card.Root class="w-72">
		<Card.Header>
			<Card.Title>Login</Card.Title>
			<Card.Description>Log in to access database</Card.Description>
		</Card.Header>
		<Card.Content>
			<form>
				<div class="mb-2">
					<Input type="email" placeholder="email" class="w-full" bind:value={email} />
				</div>
				<div class="mb-2">
					<Input type="password" placeholder="password" class="w-full" bind:value={password} />
				</div>
			</form>
		</Card.Content>
		<Card.Footer class="justify-end gap-2">
			<Button variant="outline" on:click={back}>Back</Button>
			<Button variant="default" on:click={login}>Login</Button>
		</Card.Footer>
	</Card.Root>
</div>
