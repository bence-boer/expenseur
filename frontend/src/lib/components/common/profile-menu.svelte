<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { goto } from "$app/navigation";
	import { UserIcon, LogOut } from "lucide-svelte";
	import { service, session } from "$lib/service";
    import { onMount } from "svelte";
    import type { User } from "$lib/service/session.svelte";

	const logout = () => {
		service.logout().then(() => {
			goto("/");
		});
	};

	const user: User = session.get()?.user;
	let initials: string = $state(session.get()?.u);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Avatar.Root class="h-8 w-8">
			<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
			<Avatar.Fallback>{initials}</Avatar.Fallback>
		</Avatar.Root>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label class="text-center"
				>My Account</DropdownMenu.Label
			>
			<DropdownMenu.Separator />
			<DropdownMenu.Item class="gap-2">
				<UserIcon />
				Profile
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={logout} class="gap-2">
				<LogOut />
				Log out
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
