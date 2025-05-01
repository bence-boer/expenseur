<script lang="ts">
    import { DeleteDialog } from '$lib/components/common/delete-dialog';
    import { ErrorCard } from '$lib/components/common/error-card';
    import { InfoCard } from '$lib/components/common/info-card';
    import { ItemMaintainDialog } from '$lib/components/common/item-maintain-dialog';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import type { ServiceTypes } from '$lib/service';
    import { store } from '$lib/store';
    import { filter } from '$lib/utils';
    import { Edit, Plus, Trash } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';

    let search: string = $state();
    let selected_item: ServiceTypes.Item = $state({ id: -1, name: '', category_id: -1, unit_id: -1 });

    let delete_dialog_open: boolean = $state(false);
    let maintain_dialog_open: boolean = $state(false);
    let maintain_dialog_mode: 'CREATE' | 'UPDATE' = $state('CREATE');

    const open_delete_confirmation = (item: ServiceTypes.Item) => {
        selected_item = item;
        delete_dialog_open = true;
    };

    const open_create_dialog = () => {
        selected_item = { id: -1, name: '', category_id: -1, unit_id: -1 };
        maintain_dialog_mode = 'CREATE';
        maintain_dialog_open = true;
    };

    const open_update_dialog = (item: ServiceTypes.Item) => {
        selected_item = item;
        maintain_dialog_mode = 'UPDATE';
        maintain_dialog_open = true;
    };

    const delete_item = () =>
        store.items.delete(selected_item.id).then(() => {
            toast.success(`Item "${selected_item.name}" deleted successfully`);
        });
</script>

{#if store.flags.pages.config.search.value}
    <Input type="search" placeholder="Search..." class="w-full shrink-0" bind:value={search} />
{/if}

{#await store.items.data}
    <div class="flex h-full flex-col justify-between">
        <div class="flex flex-col gap-4">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
        </div>
        <Skeleton class="h-10 w-full" />
    </div>
{:then items_data}
    {@const filtered = filter(items_data, search, (item) => item.name)}
    {@const empty = filtered.length === 0}

    <div class="flex-grow flex flex-col overflow-hidden gap-4">
        {#if empty}
            <InfoCard>No items found.</InfoCard>
        {:else}
            <div class="overflow-y-auto flex-grow flex-shrink flex flex-col gap-4">
                {#each filtered as item}
                    {@const { id, name } = item}
                    <div class="h-12 w-full flex flex-row items-center justify-between border-b p-2">
                        <div class="flex flex-row items-center overflow-ellipsis">
                            {name}
                        </div>
                        <div>
                            <Button variant="ghost" size="sm" class="px-2" onclick={() => open_update_dialog(item)}>
                                <Edit size="16" class="text-slate-400" />
                            </Button>
                            <Button variant="ghost" size="sm" class="px-2" onclick={() => open_delete_confirmation(item)}>
                                <Trash size="16" class="text-red-900" />
                            </Button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
        <Button variant="secondary" class="w-full mt-auto" onclick={open_create_dialog}>
            <Plus size="16" />
            Add Item
        </Button>
    </div>
{:catch error}
    <ErrorCard>
        {error.message}
    </ErrorCard>
{/await}

<DeleteDialog
    bind:open={delete_dialog_open}
    title="Delete Item"
    description={`Are you sure you want to delete item "${selected_item?.name ?? ''}"? The item will also be removed from related expenses. This action cannot be undone.`}
    delete={delete_item}
/>

<ItemMaintainDialog bind:open={maintain_dialog_open} item={selected_item} mode={maintain_dialog_mode} />
