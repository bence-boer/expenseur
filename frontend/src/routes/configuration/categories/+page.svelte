<script lang="ts">
    import { CategoryMaintainDialog } from '$lib/components/common/category-maintain-dialog';
    import { DeleteDialog } from '$lib/components/common/delete-dialog';
    import ErrorCard from '$lib/components/common/error-card/error-card.svelte';
    import { InfoCard } from '$lib/components/common/info-card';
    import { Button } from '$lib/components/ui/button';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { service, ServiceTypes } from '$lib/service';
    import { promise } from '$lib/utils';
    import { Edit, Plus, Trash } from '@lucide/svelte';
    import { onMount } from 'svelte';

    let { promise: data, resolve, reject } = promise<ServiceTypes.Category[]>();
    let categories: Promise<ServiceTypes.Category[]> = $state(data);
    let category_map: Map<number, ServiceTypes.Category> = $state(new Map());

    let delete_dialog_open: boolean = $state(false);
    let category_to_delete: number = $state(-1);

    let edit_dialog_open: boolean = $state(false);
    let category_to_edit: number = $state(-1);

    // TODO: Refactor like in items and brands pages
    onMount(() => {
        service
            .get_categories()
            .then((response: ServiceTypes.Category[]) => {
                category_map = new Map(response.map((category) => [category.id, category]));
                resolve(response);
            })
            .catch(reject);
    });

    const open_delete_confirmation = (id: number) => {
        category_to_delete = id;
        delete_dialog_open = true;
    };

    const open_edit_dialog = (id: number) => {
        category_to_edit = id;
        edit_dialog_open = true;
    };

    const delete_category = () => service.delete_category(String(category_to_delete));
</script>

{#await categories}
    <div class="flex h-full flex-col justify-between">
        <div class="flex flex-col gap-4">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
        </div>
        <Skeleton class="h-10 w-full" />
    </div>
{:then categories}
    {@const empty = categories.length === 0}

    <div class="flex-grow flex flex-col overflow-hidden gap-4">
        {#if empty}
            <InfoCard>You have no categories yet</InfoCard>
        {:else}
            <div class="overflow-y-auto flex-grow flex-shrink flex flex-col gap-4">
                {#each categories as { id, name, color }}
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
        <Button variant="secondary" class="w-full mt-auto">
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
    description="Are you sure you want to delete category: {category_map.get(category_to_delete).name}?"
    delete={delete_category}
/>

<CategoryMaintainDialog bind:open={edit_dialog_open} mode="UPDATE" category={category_map.get(category_to_edit)} />
