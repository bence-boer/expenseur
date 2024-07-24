<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { supabase } from '../../../supabase-client';
	import { goto } from '$app/navigation';
	import { UserIcon, LogOut } from 'lucide-svelte';
	import type { User, UserResponse } from '@supabase/supabase-js';

	const logout = () => {
		supabase.auth.signOut().then(() => {
			goto('/');
		});
	};

	let user: User;
	let initials: string = '';

	supabase.auth.getUser().then(({ data, error }) => {
		if (data.user) {
			user = data.user;
			initials = user
				.email!.split('@')[0]
				.split('.')
				.map((name) => name.charAt(0).toUpperCase())
				.join('');
		}
	});
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
			<DropdownMenu.Label class="text-center">My Account</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item class="gap-2">
				<UserIcon />
				Profile
			</DropdownMenu.Item>
			<DropdownMenu.Item on:click={logout} class="gap-2 text-muted-foreground">
				<LogOut />
				Log out
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
