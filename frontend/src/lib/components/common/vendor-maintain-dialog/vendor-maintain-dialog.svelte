<script lang="ts" generics="MODE extends 'CREATE' | 'UPDATE'">
    import ComboBox from '$lib/components/ui-custom/combo-box/combo-box.svelte';
    import { Input } from '$lib/components/ui-custom/input';
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Label } from '$lib/components/ui/label';
    import { service } from '$lib/service';
    import type { ServiceTypes } from '$lib/service';
    import type { LabelValue } from '$lib/types';
    import { label_value_transform } from '$lib/utils';
    import { toast } from 'svelte-sonner';

    type Props = {
        open?: boolean;
        name?: string;
        mode: MODE;
        vendor?: MODE extends 'UPDATE' ? ServiceTypes.Vendor : never;
        on_vendor_created: (item_id: number) => void;
    };

    let { open = $bindable(false), name = $bindable(), on_vendor_created, mode, vendor }: Props = $props();

    let dialog_disabled = $state(false);

    const reset_form = () => {
        name = undefined;
    };

    $effect(() => {
        name = vendor?.name;
    });

    const valid = () => {
        if (name) return true;

        toast.error('Name is required');
        return false;
    };

    const create_vendor = async () => {
        if (!valid()) return;

        dialog_disabled = true;

        service
            .create_vendor({ name })
            .then((data) => {
                on_vendor_created(data.id);
                toast.success(`Vendor "${name}" created successfully!`);
                open = false;
                reset_form();
            })
            .catch((error) => {
                toast.error(`Failed to create Vendor`);
                throw error;
            })
            .finally(() => {
                dialog_disabled = false;
            });
    };

    const update_vendor = async () => {
        if (!valid()) return;

        dialog_disabled = true;

        service
            .update_vendor(vendor.id, { name })
            .then(() => {
                on_vendor_created(vendor.id);
                toast.success(`Vendor "${name}" updated successfully!`);
                open = false;
                reset_form();
            })
            .catch((error) => {
                toast.error(`Failed to update Vendor`);
                throw error;
            })
            .finally(() => {
                dialog_disabled = false;
            });
    };
</script>

<Dialog.Root bind:open>
    <Dialog.Content
        class="sm:max-w-[425px]"
        escapeKeydownBehavior={dialog_disabled ? 'ignore' : 'close'}
        interactOutsideBehavior={dialog_disabled ? 'ignore' : 'close'}
    >
        <Dialog.Header>
            <Dialog.Title>{mode === 'CREATE' ? 'Create Vendor' : 'Update Vendor'}</Dialog.Title>
            <Dialog.Description>Enter the name of the vendor you want to create.</Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right">Name</Label>
                <Input id="name" bind:value={name} disabled={dialog_disabled} class="col-span-3" placeholder="Enter vendor name..." />
            </div>
        </div>
        <Dialog.Footer>
            {#if mode === 'CREATE'}
                <Button type="submit" onclick={create_vendor} disabled={dialog_disabled}>Create</Button>
            {:else}
                <Button type="submit" onclick={update_vendor} disabled={dialog_disabled}>Update</Button>
            {/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
