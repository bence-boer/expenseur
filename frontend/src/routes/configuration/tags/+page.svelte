<script lang="ts">
    import { DeleteDialog } from '$lib/components/common/delete-dialog';
    import { ErrorCard } from '$lib/components/common/error-card';
    import { InfoCard } from '$lib/components/common/info-card';
    import { TagMaintainDialog } from '$lib/components/common/tag-maintain-dialog';
    import { Button } from '$lib/components/ui/button';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { service, ServiceTypes } from '$lib/service';
    import { Edit, Plus, Trash } from '@lucide/svelte';
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';

    let tags: Promise<ServiceTypes.Tag[]> = $state(new Promise(() => []));
    let tag_map: Map<number, ServiceTypes.Tag> = $state(new Map());

    let delete_dialog_open: boolean = $state(false);
    let tag_to_delete: number = $state(-1);

    let maintain_dialog_open: boolean = $state(false);
    let maintain_dialog_mode: 'CREATE' | 'UPDATE' = $state('CREATE');
    let tag_to_edit: number = $state(-1);

    const fetch = () => {
        tags = service.get_tags().then((response: ServiceTypes.Tag[]) => {
            tag_map = new Map(response.map((tag) => [tag.id, tag]));
            return response;
        });
    };

    onMount(fetch);

    const open_delete_confirmation = (id: number) => {
        tag_to_delete = id;
        delete_dialog_open = true;
    };

    const open_edit_dialog = (id: number) => {
        tag_to_edit = id;
        maintain_dialog_mode = 'UPDATE';
        maintain_dialog_open = true;
    };

    const open_create_dialog = () => {
        tag_to_edit = -1;
        maintain_dialog_mode = 'CREATE';
        maintain_dialog_open = true;
    };

    const delete_tag = () => {
        return service
            .delete_tag(String(tag_to_delete))
            .then(() => {
                const name = tag_map.get(tag_to_delete).name;
                toast.success(`Tag "${name}" deleted successfully!`);
                fetch();
            })
            .catch((error) => {
                toast.error('Failed to delete tag');
                console.error('Delete tag error:', error);
            });
    };
</script>

{#await tags}
    <div class="flex h-full flex-col justify-between">
        <div class="flex flex-col gap-4">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
        </div>
        <Skeleton class="h-10 w-full" />
    </div>
{:then tags}
    {@const empty = tags.length === 0}

    <div class="flex-grow flex flex-col overflow-hidden gap-4">
        {#if empty}
            <InfoCard>You have no tags yet</InfoCard>
        {:else}
            <div class="overflow-y-auto flex-grow flex-shrink flex flex-col gap-4">
                {#each tags as { id, name, color }}
                    <div class="h-12 w-full flex flex-row items-center justify-between border-b p-2">
                        <div class="flex flex-row items-center gap-2">
                            <span class="inline-block h-5 w-5 rounded-lg" style="background-color: {color};"></span>
                            {name}
                        </div>
                        <div>
                            <Button variant="ghost" size="sm" class="px-2" onclick={() => open_edit_dialog(id)}>
                                <Edit size="16" class="text-slate-400" />
                            </Button>
                            <Button variant="ghost" size="sm" class="px-2" onclick={() => open_delete_confirmation(id)}>
                                <Trash size="16" class="text-red-900" />
                            </Button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
        <Button variant="secondary" class="w-full mt-auto" onclick={open_create_dialog}>
            <Plus size="16" />
            Add Tag
        </Button>
    </div>
{:catch error}
    <ErrorCard>
        {error.message}
    </ErrorCard>
{/await}

<DeleteDialog
    bind:open={delete_dialog_open}
    title="Delete tag"
    description={`Are you sure you want to delete tag "${tag_map.get(tag_to_delete)?.name ?? ''}"? The tag will also be removed from related expenses. This action cannot be undone.`}
    delete={delete_tag}
/>

<TagMaintainDialog bind:open={maintain_dialog_open} mode={maintain_dialog_mode} tag={tag_map.get(tag_to_edit)} on_tag_maintained={fetch} />
