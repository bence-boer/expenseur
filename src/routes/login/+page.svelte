<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { supabase } from '../../supabaseClient';

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
	<form class="w-80 rounded-md border p-8">
		<div class="mb-2">
			<h1 class="text-xl">Login</h1>
		</div>
		<div class="mb-2">
			<Input type="email" placeholder="email" class="max-w-64" bind:value={email} />
		</div>
		<div class="mb-2">
			<Input type="password" placeholder="password" class="max-w-64" bind:value={password} />
		</div>
		<div class="text-right">
			<Button variant="outline" on:click={back}>Back</Button>
			<Button variant="default" on:click={login}>Login</Button>
		</div>
	</form>
</div>
