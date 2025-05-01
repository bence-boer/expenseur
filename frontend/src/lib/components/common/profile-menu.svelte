<script lang="ts">
    import { goto } from '$app/navigation';
    import { memory_cache } from '$lib/cache';
    import * as Avatar from '$lib/components/ui/avatar/index.js';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { auth, service, type ServiceTypes } from '$lib/service';
    import { store } from '$lib/store';
    import { LogOut, MonitorCog, UserIcon } from '@lucide/svelte';
    import type { AvatarImageLoadingStatus } from 'bits-ui';
    import { onMount } from 'svelte';

    let avatar_url: string | undefined = $state();
    let avatar_loading_status: AvatarImageLoadingStatus = $state('loading');

    const logout = () => {
        auth.logout()
            .catch((error: Error) => {
                console.error('Logout error:', error.message);
            })
            .finally(() => {
                const update_session = memory_cache.get('update-session-callback') as (value: Promise<ServiceTypes.Session>) => void;
                update_session?.(Promise.resolve(null));
                goto('/');
            });
    };

    const go_to_profile = () => {
        goto('/profile');
    };

    const go_to_admin = () => {
        goto('/admin');
    };

    const fetch_avatar = () => {
        avatar_loading_status = 'loading';
        service
            .get_avatar_url()
            .then((response) => {
                avatar_url = response.signedUrl;
                avatar_loading_status = 'loaded';
            })
            .catch((error) => {
                console.error('Failed to load avatar for menu:', error);
                avatar_loading_status = 'error';
            });
    };

    onMount(fetch_avatar);
    memory_cache.set('update-avatar-callback', fetch_avatar);
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        <Avatar.Root class="h-8 w-8" bind:loadingStatus={avatar_loading_status}>
            <Avatar.Image src={avatar_url} alt="User Avatar" />
            <Avatar.Fallback>U</Avatar.Fallback>
        </Avatar.Root>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <DropdownMenu.Group>
            <DropdownMenu.Label class="text-center">My Account</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Item class="gap-2" onclick={go_to_profile}>
                <UserIcon />
                Profile
            </DropdownMenu.Item>
            <DropdownMenu.Item onclick={logout} class="gap-2">
                <LogOut />
                Log out
            </DropdownMenu.Item>
        </DropdownMenu.Group>
        {#if store.auth.admin.value}
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
                <DropdownMenu.Label class="text-center">Admin</DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.Item onclick={go_to_admin} class="gap-2">
                    <MonitorCog />
                    Admin Panel
                </DropdownMenu.Item>
            </DropdownMenu.Group>
        {/if}
    </DropdownMenu.Content>
</DropdownMenu.Root>
