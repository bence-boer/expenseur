<script lang="ts">
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import { memory_cache, session_storage_cache } from '$lib/cache';
    import { Input } from '$lib/components/ui-custom/input';
    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import { auth } from '$lib/service';
    import type { ServiceTypes } from '$lib/service';

    const update_session = memory_cache.get('update-session-callback') as (value: Promise<ServiceTypes.Session>) => void;

    let email: string = $state('');
    let password: string = $state('');

    const back = () => {
        if (browser) goto(session_storage_cache.get('login-redirect') ?? '/');
    };

    let failed = $state(false);
    const login = () => {
        auth.login(email, password)
            .then((response: ServiceTypes.LoginResponse) => {
                goto(session_storage_cache.get('login-redirect') ?? '/');
                if (update_session) update_session(Promise.resolve(response.session));
            })
            .catch((error: Error) => {
                console.error('Login error:', error.message);
                failed = true;
            });
    };
</script>

<form class="flex h-full items-center justify-center">
    <Card.Root class="w-72">
        <Card.Header>
            <Card.Title>Login</Card.Title>
            <Card.Description>Log in to access database</Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="mb-2">
                <Input type="email" placeholder="Email" class="w-full" bind:value={email} />
            </div>
            <div>
                <Input type="password" placeholder="Password" class="w-full" bind:value={password} />
            </div>
            <div class="size h-2 text-right text-xs text-red-500">
                {#if failed}
                    Login failed
                {/if}
            </div>
        </Card.Content>
        <Card.Footer class="justify-end gap-2">
            <Button variant="outline" onclick={back} type="reset">Back</Button>
            <Button variant="default" onclick={login} type="submit">Login</Button>
        </Card.Footer>
    </Card.Root>
</form>
