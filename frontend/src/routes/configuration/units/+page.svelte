<script lang="ts">
    import { UnitMaintainDialog } from '$lib/components/common/unit-maintain-dialog';
    import { DeleteDialog } from '$lib/components/common/delete-dialog';
    import { ErrorCard } from '$lib/components/common/error-card';
    import { InfoCard } from '$lib/components/common/info-card';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import type { ServiceTypes } from '$lib/service'; 
    import { store } from '$lib/store';
    import { filter } from '$lib/utils';
    import { Edit, Plus, Trash } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';

    let search: string = $state();
    let selected_unit: ServiceTypes.Unit = $state({ id: -1, name: '' }); 

    let delete_dialog_open: boolean = $state(false);

    let maintain_dialog_open: boolean = $state(false);
    let maintain_dialog_mode: 'CREATE' | 'UPDATE' = $state('CREATE');

    const open_delete_confirmation = (unit: ServiceTypes.Unit) => {
        selected_unit = unit;
        delete_dialog_open = true;
    };

    const open_edit_dialog = (unit: ServiceTypes.Unit) => {
        selected_unit = unit;
        maintain_dialog_mode = 'UPDATE';
        maintain_dialog_open = true;
    };

    const open_create_dialog = () => {
        selected_unit = { id: -1, name: '' }; 
        maintain_dialog_mode = 'CREATE';
        maintain_dialog_open = true;
    };

    const delete_unit = () =>
        store.units.delete(selected_unit.id).then(() => {
            toast.success(`Unit "${selected_unit.name}" deleted successfully`);
        });
</script>

{#if store.flags.pages.config.search.value}
    <Input type="search" placeholder="Search..." class="w-full shrink-0" bind:value={search} />
{/if}

{#await store.units.data} 
    <div class="flex h-full flex-col justify-between">
        <div class="flex flex-col gap-4">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
        </div>
        <Skeleton class="h-10 w-full" />
    </div>
{:then units}
    {@const filtered = filter(units, search, (unit) => unit.name)}
    {@const empty = filtered.length === 0}

    <div class="flex-grow flex flex-col overflow-hidden gap-4">
        {#if empty}
            <InfoCard>No units found.</InfoCard>
        {:else}
            <div class="overflow-y-auto flex-grow flex-shrink flex flex-col gap-4">
                {#each filtered as unit} 
                    {@const { id, name } = unit}
                    <div class="h-12 w-full flex flex-row items-center justify-between gap-2 border-b p-2">
                        <div class="flex flex-row items-center flex-1 min-w-0">
                            <div class="overflow-hidden text-ellipsis whitespace-nowrap">
                                {name}
                            </div>
                        </div>
                        <div>
                            <Button variant="ghost" size="sm" class="px-2" onclick={() => open_edit_dialog(unit)}>
                                <Edit size="16" class="text-slate-400" />
                            </Button>
                            <Button variant="ghost" size="sm" class="px-2" onclick={() => open_delete_confirmation(unit)}>
                                <Trash size="16" class="text-red-900" />
                            </Button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
        <Button variant="secondary" class="w-full mt-auto" onclick={open_create_dialog}>
            <Plus size="16" />
            Add Unit
        </Button>
    </div>
{:catch error}
    <ErrorCard>
        {error.message}
    </ErrorCard>
{/await}

<DeleteDialog
    bind:open={delete_dialog_open}
    title="Delete Unit"
    description={`Are you sure you want to delete unit "${selected_unit?.name ?? ''}"? The unit will also be removed from related items. This action cannot be undone.`}
    delete={delete_unit}
/>

<UnitMaintainDialog bind:open={maintain_dialog_open} unit={selected_unit} mode={maintain_dialog_mode} />
