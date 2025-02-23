<script lang="ts">
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui-custom/input";
	import { browser } from "$app/environment";
	import { service } from "$lib/service";

	let email: string = $state("");
	let password: string = $state("");

	const back = () => {
		if (browser) goto("/");
	};

	// supabase.auth.getUser().then(({ data }) => {
	// 	!!data.user && back();
	// });

	let failed = $state(false);
	const register = () => {
		service
			.register({
				email: email,
				password: password,
			})
			.then((response) => {
				if (response.error) throw response.error;

				goto("/login");
			})
			.catch((error) => {
				console.error("Registration error:", error.message);
				failed = true;
			});
	};
</script>

<form class="flex h-full items-center justify-center">
	<Card.Root class="w-72">
		<Card.Header>
			<Card.Title>Register</Card.Title>
			<Card.Description>Create new account</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="mb-2">
				<Input
					type="email"
					placeholder="email"
					class="w-full"
					bind:value={email}
				/>
			</div>
			<div>
				<Input
					type="password"
					placeholder="password"
					class="w-full"
					bind:value={password}
				/>
			</div>
			<div class="size h-2 text-right text-xs text-red-500">
				{#if failed}
					Registration failed
				{/if}
			</div>
		</Card.Content>
		<Card.Footer class="justify-end gap-2">
			<Button variant="outline" onclick={back} type="reset">Back</Button>
			<Button variant="default" onclick={register} type="submit"
				>Register</Button
			>
		</Card.Footer>
	</Card.Root>
</form>
