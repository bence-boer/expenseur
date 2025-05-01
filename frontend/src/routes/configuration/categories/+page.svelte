<script lang="ts">
    import { CategoryMaintainDialog } from '$lib/components/common/category-maintain-dialog';
    import { DeleteDialog } from '$lib/components/common/delete-dialog';
    import { ErrorCard } from '$lib/components/common/error-card';
    import { InfoCard } from '$lib/components/common/info-card';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { store } from '$lib/store';
    import { filter } from '$lib/utils';
    import { Edit, Plus, Trash } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';
    import type { ServiceTypes } from '$lib/service';

    let search: string = $state();

    let delete_dialog_open: boolean = $state(false);
    let selected_category: ServiceTypes.Category = $state();

    let maintain_dialog_open: boolean = $state(false);
    let maintain_dialog_mode: 'CREATE' | 'UPDATE' = $state('CREATE');

    const open_delete_confirmation = (category: ServiceTypes.Category) => {
        selected_category = category;
        delete_dialog_open = true;
    };

    const open_edit_dialog = (category: ServiceTypes.Category) => {
        selected_category = category;
        maintain_dialog_mode = 'UPDATE';
        maintain_dialog_open = true;
    };

    const open_create_dialog = () => {
        selected_category = { id: -1, name: '', color: '' };
        maintain_dialog_mode = 'CREATE';
        maintain_dialog_open = true;
    };

    const delete_category = () =>
        store.categories.delete(selected_category.id).then(() => {
            toast.success(`Category "${selected_category.name}" deleted successfully`);
        });
</script>

{#if store.flags.pages.config.search.value}
    <Input type="search" placeholder="Search..." class="w-full shrink-0" bind:value={search} />
{/if}

{#await store.categories.data}
    <div class="flex h-full flex-col justify-between">
        <div class="flex flex-col gap-4">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
        </div>
        <Skeleton class="h-10 w-full" />
    </div>
{:then categories}
    {@const filtered = filter(categories, search, (category) => category.name)}
    {@const empty = filtered.length === 0}

    <div class="flex-grow flex flex-col overflow-hidden gap-4">
        {#if empty}
            <InfoCard>No categories found.</InfoCard>
        {:else}
            <div class="overflow-y-auto flex-grow flex-shrink flex flex-col gap-4">
                {#each filtered as category}
                    {@const { id, name, color } = category}
                    <div class="h-12 w-full flex flex-row items-center justify-between border-b p-2">
                        <div class="flex flex-row items-center gap-2">
                            <span class="inline-block h-5 w-5 rounded-lg" style="background-color: {color};"></span>
                            {name}
                        </div>
                        <div>
                            <Button variant="ghost" size="sm" class="px-2" onclick={() => open_edit_dialog(category)}>
                                <Edit size="16" class="text-slate-400" />
                            </Button>
                            <Button variant="ghost" size="sm" class="px-2" onclick={() => open_delete_confirmation(category)}>
                                <Trash size="16" class="text-red-900" />
                            </Button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
        <Button variant="secondary" class="w-full mt-auto" onclick={open_create_dialog}>
            <Plus size="16" />
            Add Category
        </Button>
    </div>
{:catch error}
    <ErrorCard>
        {error.message}
    </ErrorCard>
{/await}

<DeleteDialog
    bind:open={delete_dialog_open}
    title="Delete category"
    description={`Are you sure you want to delete category "${selected_category.name}"? The category will also be removed from related expenses. This action cannot be undone.`}
    delete={delete_category}
/>

<CategoryMaintainDialog bind:open={maintain_dialog_open} mode={maintain_dialog_mode} category={selected_category} />
