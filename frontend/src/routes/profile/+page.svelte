<script lang="ts">
    import { DeleteDialog } from '$lib/components/common/delete-dialog';
    import * as Avatar from '$lib/components/ui/avatar';
    import { Button, buttonVariants } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { service, type ServiceTypes } from '$lib/service';
    import { toast } from 'svelte-sonner';
    import { ErrorCard } from '$lib/components/common/error-card';
    import { Edit, Image, Loader2, Trash2 } from '@lucide/svelte';
    import type { AvatarImageLoadingStatus } from 'bits-ui';
    import { onMount } from 'svelte';
    import { promise } from '$lib/utils';
    import { memory_cache } from '$lib/cache';

    let avatar_url_promise: Promise<ServiceTypes.AvatarUrlResponse> | undefined = $state();
    let avatar_url: string | null | undefined = $state();
    let avatar_loading_status: AvatarImageLoadingStatus = $state('loading');
    let is_uploading = $state(false);
    let is_deleting = $state(false);
    let show_delete_confirm = $state(false);

    const update_avatar_callback = memory_cache.get<() => void>('update-avatar-callback');

    $effect(() => {
        if (avatar_url) console.log('Profile picture loaded', avatar_url);
        update_avatar_callback?.();
    });

    const fetch_avatar = () => {
        avatar_loading_status = 'loading';
        avatar_url_promise = service.get_avatar_url();
        avatar_url_promise
            .then((response) => {
                avatar_url = response.signedUrl;
                avatar_loading_status = 'loaded';
            })
            .catch((error) => {
                console.error('Failed to load avatar:', error);
                avatar_loading_status = 'error';
            });
    };

    const handle_avatar_upload = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const file = target.files[0];

            if (file.size > 5 * 1024 * 1024) {
                toast.error('File is too large. Max 5MB allowed.');
                target.value = '';
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                toast.error('Invalid file type. Only JPG, PNG, WebP allowed.');
                target.value = '';
                return;
            }

            is_uploading = true;
            const toast_id = toast.loading('Uploading avatar...');

            try {
                await service.upload_avatar(file);
                toast.success('Avatar updated successfully!', { id: toast_id });
                fetch_avatar();
                target.value = '';
            } catch (error: any) {
                console.error('Avatar upload failed:', error);
                toast.error(`Avatar upload failed: ${error.message || 'Unknown error'}`, { id: toast_id });
            } finally {
                is_uploading = false;
            }
        }
    };

    const trigger_delete_avatar = () => {
        if (avatar_url) {
            show_delete_confirm = true;
        } else {
            toast.info('No avatar to delete.');
        }
    };

    const confirm_delete_avatar = async () => {
        is_deleting = true;
        const toast_id = toast.loading('Deleting avatar...');
        try {
            await service.delete_avatar();
            toast.success('Avatar deleted successfully!', { id: toast_id });
            avatar_url = null;
            avatar_loading_status = 'loaded';
        } catch (error: any) {
            console.error('Avatar deletion failed:', error);
            toast.error(`Avatar deletion failed: ${error.message || 'Unknown error'}`, { id: toast_id });
        } finally {
            is_deleting = false;
            show_delete_confirm = false;
        }
    };

    let { promise: profile_promise, resolve, reject } = promise<any>();
    let profile = $state<Promise<ServiceTypes.Profile>>(profile_promise);

    const fetch_profile = () =>
        service
            .get_profile_data()
            .then((data) => {
                profile = data;
                resolve(data);
            })
            .catch((error) => {
                console.error('Failed to load profile data:', error);
                reject(error);
            });

    onMount(() => {
        fetch_avatar();
        profile = fetch_profile();
    });
</script>

<h1 class="text-2xl font-bold sm:text-4xl">Profile</h1>

{#if avatar_url_promise}
    {#await avatar_url_promise}
        <Card.Root>
            <Card.Header class="items-start justify-between flex-row gap-4 space-y-0">
                <Skeleton class="h-24 w-24 rounded-full" />
                <div class="flex flex-col gap-2 mt-0">
                    <Skeleton class="h-10 w-24" />
                    <Skeleton class="h-10 w-24" />
                </div>
            </Card.Header>
            <Card.Content class="flex flex-col gap-4">
                <Skeleton class="h-8 w-full" />
            </Card.Content>
        </Card.Root>
    {:then}
        <Card.Root>
            <Card.Header class="items-start justify-between flex-row gap-4 space-y-0">
                <Avatar.Root class="h-24 w-24">
                    <Avatar.Image src={avatar_url} alt="User Avatar" />
                    <Avatar.Fallback>U</Avatar.Fallback>
                </Avatar.Root>
                <div class="flex flex-col gap-2 mt-0">
                    <div class="relative">
                        <Label for="avatar-upload" class={buttonVariants({ variant: 'secondary', class: 'w-full' })}>
                            {#if is_uploading}
                                Uploading...
                                <Loader2 class="h-4 w-4 animate-spin" />
                            {:else if avatar_url}
                                Update
                                <Edit class="h-4 w-4" />
                            {:else}
                                Upload
                                <Image class="h-4 w-4" />
                            {/if}
                        </Label>
                        <Input
                            id="avatar-upload"
                            type="file"
                            class="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/png, image/jpeg, image/webp"
                            onchange={handle_avatar_upload}
                            disabled={is_uploading || is_deleting}
                        />
                    </div>
                    {#if avatar_url}
                        <Button variant="outline" onclick={trigger_delete_avatar} disabled={!avatar_url || is_uploading || is_deleting}>
                            {#if is_deleting}
                                Removing...
                                <Loader2 class="h-4 w-4 animate-spin" />
                            {:else}
                                Remove
                                <Trash2 class="h-4 w-4" />
                            {/if}
                        </Button>
                    {/if}
                </div>
            </Card.Header>
            <Card.Content class="flex flex-col gap-4">
                {#await profile}
                    <Skeleton class="h-8 w-full" />
                {:then profile}
                    {profile.email}
                {:catch error}
                    <ErrorCard>
                        Failed to load profile data: {error.message ?? 'Unknown error'}
                    </ErrorCard>
                {/await}
            </Card.Content>
        </Card.Root>
    {:catch error}
        <ErrorCard>
            Failed to load profile data: {error.message ?? 'Unknown error'}
        </ErrorCard>
    {/await}
{/if}

<DeleteDialog
    bind:open={show_delete_confirm}
    title="Delete Profile Picture?"
    description="Are you sure you want to remove your profile picture? This action cannot be undone."
    delete={confirm_delete_avatar}
/>
