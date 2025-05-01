<script lang="ts">
    import { DeleteDialog } from '$lib/components/common/delete-dialog';
    import { ErrorCard } from '$lib/components/common/error-card';
    import { InfoCard } from '$lib/components/common/info-card';
    import { TagMaintainDialog } from '$lib/components/common/tag-maintain-dialog';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import type { ServiceTypes } from '$lib/service'; // Import ServiceTypes
    import { store } from '$lib/store';
    import { filter } from '$lib/utils';
    import { Edit, Plus, Trash } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';

    let search: string = $state();
    let selected_tag: ServiceTypes.Tag = $state({ id: -1, name: '', color: '' }); // Use selected_tag object

    let delete_dialog_open: boolean = $state(false);

    let maintain_dialog_open: boolean = $state(false);
    let maintain_dialog_mode: 'CREATE' | 'UPDATE' = $state('CREATE');

    const open_delete_confirmation = (tag: ServiceTypes.Tag) => {
        selected_tag = tag;
        delete_dialog_open = true;
    };

    const open_edit_dialog = (tag: ServiceTypes.Tag) => {
        selected_tag = tag;
        maintain_dialog_mode = 'UPDATE';
        maintain_dialog_open = true;
    };

    const open_create_dialog = () => {
        selected_tag = { id: -1, name: '', color: '#000000' }; // Default for new tag
        maintain_dialog_mode = 'CREATE';
        maintain_dialog_open = true;
    };

    const delete_tag = () =>
        store.tags.delete(selected_tag.id).then(() => {
            toast.success(`Tag "${selected_tag.name}" deleted successfully!`);
        });
</script>

{#if store.flags.pages.config.search.value}
    <Input type="search" placeholder="Search..." class="w-full shrink-0" bind:value={search} />
{/if}

{#await store.tags.data}
    <div class="flex h-full flex-col justify-between">
        <div class="flex flex-col gap-4">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
        </div>
        <Skeleton class="h-10 w-full" />
    </div>
{:then tags}
    {@const filtered = filter(tags as ServiceTypes.Tag[], search, (tag) => tag.name)}
    {@const empty = filtered.length === 0}

    <div class="flex-grow flex flex-col overflow-hidden gap-4">
        {#if empty}
            <InfoCard>No tags found.</InfoCard>
        {:else}
            <div class="overflow-y-auto flex-grow flex-shrink flex flex-col gap-4">
                {#each filtered as tag}
                    {@const { id, name, color } = tag}
                    <div class="h-12 w-full flex flex-row items-center justify-between border-b p-2">
                        <div class="flex flex-row items-center gap-2">
                            <span class="inline-block h-5 w-5 rounded-lg" style="background-color: {color};"></span>
                            {name}
                        </div>
                        <div>
                            <Button variant="ghost" size="sm" class="px-2" onclick={() => open_edit_dialog(tag)}>
                                <Edit size="16" class="text-slate-400" />
                            </Button>
                            <Button variant="ghost" size="sm" class="px-2" onclick={() => open_delete_confirmation(tag)}>
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
    description={`Are you sure you want to delete tag "${selected_tag?.name ?? ''}"? The tag will also be removed from related expenses. This action cannot be undone.`}
    delete={delete_tag}
/>

<TagMaintainDialog bind:open={maintain_dialog_open} mode={maintain_dialog_mode} tag={selected_tag} />
