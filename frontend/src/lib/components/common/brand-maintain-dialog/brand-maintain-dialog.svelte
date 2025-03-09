<script lang="ts" generics="MODE extends 'CREATE' | 'UPDATE'">
    import ComboBox from '$lib/components/ui-custom/combo-box/combo-box.svelte';
    import { Input } from '$lib/components/ui-custom/input';
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Label } from '$lib/components/ui/label';
    import { service } from '$lib/service';
    import type { Brand, Item } from '$lib/service/service';
    import type { LabelValue } from '$lib/types';
    import { label_value_transform } from '$lib/utils';
    import { toast } from 'svelte-sonner';

    type Props = {
        open?: boolean;
        name?: string;
        mode: MODE;
        brand?: MODE extends 'UPDATE' ? Brand : never;
        on_brand_created: (item_id: number) => void;
    };

    let { open = $bindable(false), name = $bindable(), on_brand_created, mode, brand }: Props = $props();

    let dialog_disabled = $state(false);

    const reset_form = () => {
        name = undefined;
    };

    $effect(() => {
        name = brand?.name;
    });

    const valid = () => {
        if (name) return true;

        toast.error('Name is required');
        return false;
    };

    const create_brand = async () => {
        if (!valid()) return;

        dialog_disabled = true;

        service
            .create_brand({ name })
            .then((data) => {
                on_brand_created(data.id);
                toast.success(`Brand "${name}" created successfully!`);
                open = false;
                reset_form();
            })
            .catch((error) => {
                toast.error(`Failed to create Brand`);
                throw error;
            })
            .finally(() => {
                dialog_disabled = false;
            });
    };

    const update_brand = async () => {
        if (!valid()) return;

        dialog_disabled = true;

        service
            .update_brand(brand.id, { name })
            .then(() => {
                on_brand_created(brand.id);
                toast.success(`Brand "${name}" updated successfully!`);
                open = false;
                reset_form();
            })
            .catch((error) => {
                toast.error(`Failed to update Brand`);
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
            <Dialog.Title>{mode === 'CREATE' ? 'Create Brand' : 'Update Brand'}</Dialog.Title>
            <Dialog.Description>Enter the name of the brand you want to create.</Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right">Name</Label>
                <Input id="name" bind:value={name} disabled={dialog_disabled} class="col-span-3" placeholder="Enter item name..." />
            </div>
        </div>
        <Dialog.Footer>
            {#if mode === 'CREATE'}
                <Button type="submit" onclick={create_brand} disabled={dialog_disabled}>Create</Button>
            {:else}
                <Button type="submit" onclick={update_brand} disabled={dialog_disabled}>Update</Button>
            {/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
