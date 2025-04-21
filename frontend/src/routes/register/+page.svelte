<script lang="ts">
    import { goto } from '$app/navigation';
    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import { Input } from '$lib/components/ui-custom/input';
    import { browser } from '$app/environment';
    import { auth, ServiceTypes } from '$lib/service';
    import { memory_cache, session_storage_cache } from '$lib/cache';

    let email: string = $state('');
    let password: string = $state('');
    let password_confirm: string = $state('');

    const update_session = memory_cache.get('update-session-callback') as (value: Promise<ServiceTypes.Session>) => void;

    const back = () => {
        if (browser) goto('/');
    };

    let failed = $state(false);
    let error_message = $state('');

    const register = () => {
        failed = false;
        error_message = '';

        if (password !== password_confirm) {
            failed = true;
            error_message = 'Passwords do not match';
            return;
        }

        auth.register(email, password)
            .then((response: ServiceTypes.RegisterResponse) => {
                const update_session = memory_cache.get('update-session-callback') as (value: Promise<ServiceTypes.Session>) => void;
                update_session?.(Promise.resolve(response.session));
            })
            .catch((error) => {
                console.error('Registration error:', error.message);
                failed = true;
                error_message = 'Registration failed';
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
                <Input type="email" placeholder="Email" class="w-full" bind:value={email} />
            </div>
            <div class="mb-2">
                <Input type="password" placeholder="Password" class="w-full" bind:value={password} />
            </div>
            <div class="mb-2">
                <Input type="password" placeholder="Password (confirmation)" class="w-full" bind:value={password_confirm} />
            </div>
            <div class="h-2 text-right text-xs text-red-500">
                {#if failed}
                    {error_message}
                {/if}
            </div>
        </Card.Content>
        <Card.Footer class="justify-end gap-2">
            <Button variant="outline" onclick={back} type="reset">Back</Button>
            <Button variant="default" onclick={register} type="submit">Register</Button>
        </Card.Footer>
    </Card.Root>
</form>
