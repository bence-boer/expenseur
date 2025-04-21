<script lang="ts">
    import { page } from '$app/state';
    import Navbar from '$lib/components/common/navbar.svelte';
    import { Toaster } from '$lib/components/ui/sonner';
    import { auth, ServiceTypes } from '$lib/service';
    import { onMount, type Snippet } from 'svelte';
    import { browser } from '$app/environment';

    import '../app.css';
    import { promise } from '$lib/utils';
    import { memory_cache, session_storage_cache } from '$lib/cache';
    import { goto } from '$app/navigation';
    interface Props {
        children?: Snippet;
    }

    let { children }: Props = $props();

    let route: string = $derived(page.url.pathname.split('/').filter(Boolean).join('/') || '/');
    let non_scrollable: boolean = $derived(route.startsWith('configuration') || route.startsWith('analytics'));
    const unauthenticated_routes = ['login', 'register'];

    let loading_text = $state('Authenticating...');

    let { promise: data, resolve, reject } = promise<ServiceTypes.Session>();
    let session: Promise<ServiceTypes.Session> = $state(data);

    const update_session = (value: Promise<ServiceTypes.Session>) => {
        session = value;
    };
    memory_cache.set('update-session-callback', update_session);

    let loading_text_interval: number;
    if (browser)
        loading_text_interval = window.setInterval(() => {
            loading_text = loading_text + '.';
            if (loading_text.length > 17) loading_text = 'Authenticating';
        }, 300);

    const source = () => {
        const path: string = page.url.pathname;
        const search: string = page.url.search;
        if (['/', '/login', '/register'].includes(path)) return null;
        return `${path}${search}`;
    };

    const navigate_to_login_with_redirect = () => {
        const redirect: string = source();
        if (redirect) session_storage_cache.set('login-redirect', redirect);
        else session_storage_cache.clear('login-redirect');

        goto('/login', { replaceState: true });
    };

    onMount(() => {
        auth.session()
            .then((session: ServiceTypes.Session) => {
                const valid: boolean = session?.expires_at ? session.expires_at * 1000 > Number(new Date()) : false;

                if (valid) resolve(session);
                else navigate_to_login_with_redirect();
            })
            .catch(() => navigate_to_login_with_redirect())
            .catch(reject)
            .finally(() => window.clearInterval(loading_text_interval));
    });
</script>

<div class="h-full flex flex-col selection:bg-purple-600 selection:font-bold selection:text-white">
    <Navbar bind:session {route} />

    <div class="flex-grow flex flex-col gap-4 {non_scrollable ? 'overflow-y-hidden' : 'overflow-y-auto'} px-4 py-4 sm:container md:px-8">
        {#await session}
            <div class="flex h-full flex-col">
                <h1 class="text-2xl font-bold md:text-4xl">{loading_text}</h1>
            </div>
        {:then data}
            {@const authenticated = (data?.expires_at ?? 0) * 1000 > Number(new Date())}

            {#if authenticated || unauthenticated_routes.includes(route)}
                {@render children?.()}
            {:else}
                <div class="flex h-full flex-col items-center justify-center">
                    <h1 class="text-2xl font-bold md:text-4xl">You are not authenticated</h1>
                    <p class="mt-4">Please sign in to view this page</p>
                </div>
            {/if}
        {:catch error}
            <div class="flex h-full flex-col items-center justify-center">
                <h1 class="text-2xl font-bold md:text-4xl text-center">An error occurred while authenticating</h1>
                <p class="mt-4">{error.message}</p>
            </div>
        {/await}
    </div>
</div>

<Toaster theme="dark" />
