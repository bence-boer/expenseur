<script lang="ts">
    import { goto } from '$app/navigation';
    import * as Avatar from '$lib/components/ui/avatar/index.js';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { auth } from '$lib/service';
    import type { SessionResponse } from '$lib/service/auth';
    import { LogOut, UserIcon } from '@lucide/svelte';

    type Props = {
        session: Promise<SessionResponse>;
    };

    let { session = $bindable() }: Props = $props();

    const logout = () => {
        auth.logout().then(() => {
            session = Promise.resolve(null);
            goto('/');
        });
    };

    // TODO: Fetch user data
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        <Avatar.Root class="h-8 w-8">
            <Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
            <Avatar.Fallback>_</Avatar.Fallback>
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
            <DropdownMenu.Item onclick={logout} class="gap-2">
                <LogOut />
                Log out
            </DropdownMenu.Item>
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>
