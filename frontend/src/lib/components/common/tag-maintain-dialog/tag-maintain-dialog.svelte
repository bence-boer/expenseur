<script lang="ts">
    import * as Dialog from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { service, ServiceTypes } from '$lib/service';
    import { toast } from 'svelte-sonner';
    import { Label } from '../../ui/label';
    import { Input } from '../../ui-custom/input';

    type Props = {
        open: boolean;
        mode: 'CREATE' | 'UPDATE';
        tag?: ServiceTypes.Tag;
        on_tag_maintained: (tag_id?: number) => void;
    };

    let { open = $bindable(), mode, tag, on_tag_maintained }: Props = $props();
    $effect(() => {
        name = tag?.name ?? '';
        color = tag?.color ?? '#FFFFFF';
    });
    let name = $state(tag?.name);
    let color = $state(tag?.color ?? '#FFFFFF');
    let disabled = $state(false);

    let color_validator: RegExp = /^#[0-9A-Fa-f]{6}$/;

    const create = () => {
        if (!name) {
            toast.error('Name is required');
            return;
        }
        if (!color_validator.test(color)) {
            toast.error('Color is invalid (must be hex format, e.g., #RRGGBB)');
            return;
        }

        disabled = true;
        service
            .create_tag({ name, color })
            .then((data) => {
                on_tag_maintained(data.id);
                toast.success(`Tag "${name}" created successfully!`);
                open = false;
            })
            .catch((error) => {
                toast.error(`Failed to create Tag`);
                throw error;
            })
            .finally(() => {
                disabled = false;
            });
    };

    const update = () => {
        if (!name) {
            toast.error('Name is required');
            return;
        }
        if (!color_validator.test(color)) {
            toast.error('Color is invalid (must be hex format, e.g., #RRGGBB)');
            return;
        }
        if (!tag) {
            toast.error('Cannot update without a tag context');
            return;
        }

        disabled = true;
        service
            .update_tag(String(tag.id), { name, color })
            .then(() => {
                on_tag_maintained();
                toast.success(`Tag "${name}" updated successfully!`);
                open = false;
            })
            .catch((error) => {
                toast.error(`Failed to update Tag`);
                throw error;
            })
            .finally(() => {
                disabled = false;
            });
    };
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]" escapeKeydownBehavior="close" interactOutsideBehavior="close">
        <Dialog.Header>
            <Dialog.Title>{mode === 'CREATE' ? 'Create Tag' : 'Update Tag'}</Dialog.Title>
        </Dialog.Header>
        <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="text-right">Name</Label>
            <Input id="name" bind:value={name} {disabled} class="col-span-3" />

            <Label for="color" class="text-right">Color</Label>
            <div class="col-span-3 flex flex-row items-center gap-2">
                <Input id="color" bind:value={color} {disabled} />
                <input type="color" bind:value={color} {disabled} />
            </div>
        </div>
        <Dialog.Footer class="flex flex-row justify-center gap-2">
            <Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
            {#if mode === 'CREATE'}<Button variant="default" onclick={create} {disabled}>Create</Button>{/if}
            {#if mode === 'UPDATE'}<Button variant="default" onclick={update} {disabled}>Update</Button>{/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
