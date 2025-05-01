<script lang="ts" generics="MODE extends 'CREATE' | 'UPDATE'">
    import { Input } from '$lib/components/ui-custom/input';
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Label } from '$lib/components/ui/label';
    import type { ServiceTypes } from '$lib/service';
    import { store } from '$lib/store';
    import { toast } from 'svelte-sonner';

    type Props = {
        open: boolean;
        mode: MODE;
        vendor: ServiceTypes.Vendor;
    };

    let { open = $bindable(), mode, vendor }: Props = $props();

    type TextResource = {
        [key in MODE]: {
            title: string;
            description: string;
        };
    };
    const text: TextResource[MODE] = $derived(
        {
            CREATE: { title: 'Create Vendor', description: 'Enter the details of the vendor you want to create.' },
            UPDATE: { title: 'Update Vendor', description: 'Modify the details of the vendor to update it.' }
        }[mode]
    );

    let disabled = $state(false);

    const create_vendor = async () => {
        if (!vendor.name) {
            toast.error('Name is required');
            return;
        }

        disabled = true;
        store.vendors
            .create({ name: vendor.name })
            .then(() => {
                toast.success(`Vendor "${vendor.name}" created successfully!`);
                open = false;
            })
            .finally(() => {
                disabled = false;
            });
    };

    const update_vendor = async () => {
        if (!vendor.name) {
            toast.error('Name is required');
            return;
        }
        if (!vendor || vendor.id === -1) {
            toast.error('Cannot update without a valid vendor context');
            return;
        }

        disabled = true;
        store.vendors
            .update(vendor.id, { name: vendor.name })
            .then(() => {
                toast.success(`Vendor "${vendor.name}" updated successfully!`);
                open = false;
            })
            .finally(() => {
                disabled = false;
            });
    };
</script>

<Dialog.Root bind:open>
    <Dialog.Content
        class="sm:max-w-[425px]"
        escapeKeydownBehavior={disabled ? 'ignore' : 'close'}
        interactOutsideBehavior={disabled ? 'ignore' : 'close'}
    >
        <Dialog.Header>
            <Dialog.Title>{text.title}</Dialog.Title>
            <Dialog.Description>{text.description}</Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right">Name</Label>
                <Input id="name" bind:value={vendor.name} {disabled} class="col-span-3" placeholder="Enter vendor name..." />
            </div>
        </div>
        <Dialog.Footer class="flex flex-row justify-center gap-2">
            <Button variant="secondary" onclick={() => (open = false)} {disabled}>Cancel</Button>
            {#if mode === 'CREATE'}
                <Button type="submit" onclick={create_vendor} {disabled}>Create</Button>
            {:else}
                <Button type="submit" onclick={update_vendor} {disabled}>Update</Button>
            {/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
