<script lang="ts">
    import { DeleteDialog } from '$lib/components/common/delete-dialog';
    import { ErrorCard } from '$lib/components/common/error-card';
    import { InfoCard } from '$lib/components/common/info-card';
    import { VendorMaintainDialog } from '$lib/components/common/vendor-maintain-dialog';
    import { Button } from '$lib/components/ui/button';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { service, ServiceTypes } from '$lib/service';
    import { Edit, Plus, Trash } from '@lucide/svelte';
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';

    let vendors: Promise<ServiceTypes.Vendor[]> = $state(new Promise(() => []));
    let vendor_map: Map<number, ServiceTypes.Vendor> = $state(new Map());

    let delete_dialog_open: boolean = $state(false);
    let vendor_to_delete: number = $state(-1);

    let maintain_dialog_open: boolean = $state(false);
    let maintain_dialog_mode: 'CREATE' | 'UPDATE' = $state('CREATE');
    let vendor_to_edit: number = $state(-1);

    const fetch = () => {
        vendors = service.get_vendors().then((response: ServiceTypes.Vendor[]) => {
            vendor_map = new Map(response.map((vendor) => [vendor.id, vendor]));
            return response;
        });
    };

    onMount(fetch);

    const open_delete_confirmation = (id: number) => {
        vendor_to_delete = id;
        delete_dialog_open = true;
    };

    const open_edit_dialog = (id: number) => {
        vendor_to_edit = id;
        maintain_dialog_mode = 'UPDATE';
        maintain_dialog_open = true;
    };

    const open_create_dialog = () => {
        vendor_to_edit = -1;
        maintain_dialog_mode = 'CREATE';
        maintain_dialog_open = true;
    };

    const delete_vendor = () =>
        service
            .delete_vendor(String(vendor_to_delete))
            .then(() => {
                const name = vendor_map.get(vendor_to_delete).name;
                toast.success(`Vendor "${name}" deleted successfully`);
                fetch();
            })
            .catch((error) => {
                toast.error('Failed to delete vendor');
                console.error('Delete vendor error:', error);
            });
</script>

{#await vendors}
    <div class="flex h-full flex-col justify-between">
        <div class="flex flex-col gap-4">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
        </div>
        <Skeleton class="h-10 w-full" />
    </div>
{:then vendors}
    {@const empty = vendors.length === 0}

    <div class="flex-grow flex flex-col overflow-hidden gap-4">
        {#if empty}
            <InfoCard>You have no vendors yet</InfoCard>
        {:else}
            <div class="overflow-y-auto flex-grow flex-shrink flex flex-col gap-4">
                {#each vendors as { id, name }}
                    <div class="h-12 w-full flex flex-row items-center justify-between gap-2 border-b p-2">
                        <div class="flex flex-row items-center flex-1 min-w-0">
                            <div class="overflow-hidden text-ellipsis whitespace-nowrap">
                                {name}
                            </div>
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
            Add Vendor
        </Button>
    </div>
{:catch error}
    <ErrorCard>
        {error.message}
    </ErrorCard>
{/await}

<DeleteDialog
    bind:open={delete_dialog_open}
    title="Delete Vendor"
    description={`Are you sure you want to delete vendor "${vendor_map.get(vendor_to_delete).name}"? The vendor will also be removed from related expenses. This action cannot be undone.`}
    delete={delete_vendor}
/>

<VendorMaintainDialog bind:open={maintain_dialog_open} vendor={vendor_map.get(vendor_to_edit)} mode={maintain_dialog_mode} on_vendor_created={fetch} />
