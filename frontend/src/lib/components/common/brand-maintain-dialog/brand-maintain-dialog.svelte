<script lang="ts" generics="MODE extends 'CREATE' | 'UPDATE'">
    import { Input } from '$lib/components/ui-custom/input';
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Label } from '$lib/components/ui/label';
    import type { ServiceTypes } from '$lib/service';
    import { store } from '$lib/store';
    import { toast } from 'svelte-sonner';

    type Props = {
        open?: boolean;
        name?: string;
        mode: MODE;
        brand?: MODE extends 'UPDATE' ? ServiceTypes.Brand : never;
    };

    let { open = $bindable(false), name = $bindable(), mode, brand }: Props = $props();

    type TextResource = {
        [key in MODE]: {
            title: string;
            description: string;
        };
    };
    const text: TextResource[MODE] = $derived(
        {
            CREATE: { title: 'Create Brand', description: 'Enter the name of the brand you want to create.' },
            UPDATE: { title: 'Update Brand', description: 'Modify the name of the brand to update it.' }
        }[mode]
    );

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

        store.brands
            .create({ name })
            .then(() => {
                toast.success(`Brand "${name}" created successfully!`);
                open = false;
                reset_form();
            })
            .finally(() => {
                dialog_disabled = false;
            });
    };

    const update_brand = async () => {
        if (!valid()) return;

        dialog_disabled = true;

        store.brands
            .update(brand.id, { name })
            .then(() => {
                toast.success(`Brand "${name}" updated successfully!`);
                open = false;
                reset_form();
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
            <Dialog.Title>{text.title}</Dialog.Title>
            <Dialog.Description>{text.description}</Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right">Name</Label>
                <Input id="name" bind:value={name} disabled={dialog_disabled} class="col-span-3" placeholder="Enter brand name..." />
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
