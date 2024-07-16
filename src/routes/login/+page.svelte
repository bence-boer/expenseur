<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { supabase } from '../../supabaseClient';

	let email: string;
	let password: string;

	const login = () => {
		supabase.auth
			.signInWithPassword({
				email: email,
				password: password
			})
			.then(console.log);
	};
</script>

<form>
	<input type="email" name="email" id="email" bind:value={email} />
	<input type="password" name="password" id="password" bind:value={password} />
	<Button variant="outline" on:click={login}>Login</Button>
</form>
