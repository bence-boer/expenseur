<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { goto } from "$app/navigation";
	import { UserIcon, LogOut } from "lucide-svelte";
	import type { User, UserResponse } from "@supabase/supabase-js";
	import { service } from "$lib/service";

	const logout = () => {
		// TODO: implement logout
		service.logout().then(() => {
			goto("/");
		});
		window.alert("Logout not implemented yet");
	};

	let user: User;
	let initials: string = $state("XX");
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
			<DropdownMenu.Item
				onclick={logout}
				class="gap-2 text-muted-foreground"
			>
				<LogOut />
				Log out
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
