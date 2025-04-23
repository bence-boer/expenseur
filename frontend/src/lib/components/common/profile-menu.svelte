<script lang="ts">
    import { goto } from '$app/navigation';
    import { memory_cache } from '$lib/cache';
    import * as Avatar from '$lib/components/ui/avatar/index.js';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { auth } from '$lib/service';
    import type { ServiceTypes } from '$lib/service';
    import { LogOut, UserIcon } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';

    const logout = () => {
        auth.logout()
            .then(() => {
                const update_session = memory_cache.get('update-session-callback') as (value: Promise<ServiceTypes.Session>) => void;
                update_session?.(Promise.resolve(null));
            })
            .catch((error: Error) => {
                console.error('Logout error:', error.message);
                toast.error('Logout failed. Please try again.');
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
