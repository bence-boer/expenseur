<script lang="ts">
    import { page } from '$app/state';
    import { session_storage_cache } from '$lib/cache';
    import { Button } from '$lib/components/ui/button';
    import logo from '$lib/resources/images/logo.svg';
    import type { Route } from '$lib/types';
    import HamburgerNavigation from './hamburger-navigation.svelte';
    import ProfileMenu from './profile-menu.svelte';

    interface Props {
        authenticated?: boolean;
        route: string;
    }

    let { authenticated, route }: Props = $props();

    const routes: Route[] = [
        { name: 'Dashboard', path: '/' },
        { name: 'Analytics', path: '/analytics' },
        { name: 'Data', path: '/data' },
        { name: 'Configuration', path: '/configuration' },
        { name: 'New Expense', path: '/new-expense' }
    ];

    const source = () => {
        const path: string = page.url.pathname;
        const search: string = page.url.search;
        if (['/', '/login/', '/register/'].includes(path)) return '/';
        return `${path}${search}`;
    };

    const save_login_redirect = () => session_storage_cache.set('login-redirect', source());
</script>

<div class="px-4 py-4 drop-shadow-[0_35px_35px_var(--background)] md:px-8">
    <div class="flex items-center justify-between gap-2">
        {#if authenticated}
            <span class="flex sm:hidden">
                <HamburgerNavigation {routes} />
            </span>
            <div class="flex flex-none items-center gap-2 max-sm:hidden">
                <img src={logo} alt="logo" class="h-8 w-8" />
                <a href="/">
                    <span class="text-gradient text-xl font-bold">Expenseur</span>
                </a>
            </div>
        {:else}
            <div class="flex flex-none items-center gap-2">
                <img src={logo} alt="logo" class="h-8 w-8" />
                <span class="text-gradient text-xl font-bold">Expenseur</span>
            </div>
        {/if}
        <div class="flex flex-initial items-center overflow-x-auto">
            {#if authenticated}
                {#each routes as { name, path }}
                    <Button variant="link" href={path} class="max-sm:hidden">{name}</Button>
                {/each}
                <span class="flex items-center pl-2">
                    <ProfileMenu />
                </span>
            {:else if authenticated === false}
                <span class="flex gap-2">
                    {#if route !== 'register'}
                        <Button variant="ghost" href="/register" onclick={save_login_redirect}>Register</Button>
                    {/if}
                    {#if route !== 'login'}
                        <Button variant="outline" href="/login" onclick={save_login_redirect}>Log In</Button>
                    {/if}
                </span>
            {/if}
        </div>
    </div>
</div>
