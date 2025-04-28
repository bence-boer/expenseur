<script lang="ts">
    import { DeleteDialog } from '$lib/components/common/delete-dialog';
    import { ErrorCard } from '$lib/components/common/error-card';
    import { InfoCard } from '$lib/components/common/info-card';
    import { ItemMaintainDialog } from '$lib/components/common/item-maintain-dialog';
    import { Button } from '$lib/components/ui/button';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { service, ServiceTypes } from '$lib/service';
    import { Edit, Plus, Trash } from '@lucide/svelte';
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';

    let items: Promise<ServiceTypes.Item[]> = $state(new Promise(() => []));
    let item_map: Map<number, ServiceTypes.Item> = $state(new Map());

    let delete_dialog_open: boolean = $state(false);
    let item_to_delete: number = $state(-1);

    let maintain_dialog_open: boolean = $state(false);
    let maintain_dialog_mode: 'CREATE' | 'UPDATE' = $state('CREATE');
    let item_to_edit: number = $state(-1);

    const fetch = () => {
        items = service.get_items().then((response: ServiceTypes.Category[]) => {
            item_map = new Map(response.map((item) => [item.id, item]));
            return response;
        });
    };

    onMount(fetch);

    const open_delete_confirmation = (id: number) => {
        item_to_delete = id;
        delete_dialog_open = true;
    };

    const open_create_dialog = () => {
        item_to_edit = -1;
        maintain_dialog_mode = 'CREATE';
        maintain_dialog_open = true;
    };

    const open_update_dialog = (id: number) => {
        item_to_edit = id;
        maintain_dialog_mode = 'UPDATE';
        maintain_dialog_open = true;
    };

    const delete_item = () =>
        service
            .delete_item(String(item_to_delete))
            .then(() => {
                const name = item_map.get(item_to_delete).name;
                toast.success(`Item "${name}" deleted successfully`);
                fetch();
            })
            .catch((error) => {
                toast.error('Failed to delete item');
                console.error('Delete item error:', error);
            });
</script>

{#await items}
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
            <InfoCard>You have no items yet</InfoCard>
        {:else}
            <div class="overflow-y-auto flex-grow flex-shrink flex flex-col gap-4">
                {#each categories as { id, name }}
                    <div class="h-12 w-full flex flex-row items-center justify-between border-b p-2">
                        <div class="flex flex-row items-center overflow-ellipsis">
                            {name}
                        </div>
                        <div>
                            <Button variant="ghost" size="sm" class="px-2" onclick={() => open_update_dialog(id)}>
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
    description={`Are you sure you want to delete item "${item_map.get(item_to_delete).name}"? The item will also be removed from related expenses. This action cannot be undone.`}
    delete={delete_item}
/>

<ItemMaintainDialog bind:open={maintain_dialog_open} item={item_map.get(item_to_edit)} mode={maintain_dialog_mode} on_item_created={fetch} />
