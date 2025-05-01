<script lang="ts" generics="MODE extends 'CREATE' | 'UPDATE'">
    import { ColorPicker } from '$lib/components/ui-custom/color-picker';
    import { Input } from '$lib/components/ui-custom/input';
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Label } from '$lib/components/ui/label';
    import { store } from '$lib/store';
    import type { ServiceTypes } from '$lib/service';
    import { toast } from 'svelte-sonner';

    type Props = {
        open: boolean;
        mode: MODE;
        tag: MODE extends 'CREATE' ? ServiceTypes.Tag : ServiceTypes.Tag;
    };

    let { open = $bindable(), mode, tag }: Props = $props();

    type TextResource = {
        [key in MODE]: {
            title: string;
            description: string;
        };
    };
    const text: TextResource[MODE] = $derived(
        {
            CREATE: { title: 'Create Tag', description: 'Enter the details of the tag you want to create.' },
            UPDATE: { title: 'Update Tag', description: 'Modify the details of the tag to update it.' }
        }[mode]
    );

    let disabled = $state(false);

    const create = () => {
        if (!tag.name) {
            toast.error('Name is required');
            return;
        }
        if (!tag.color) {
            toast.error('Color is required');
            return;
        }

        disabled = true;
        store.tags
            .create({ name: tag.name, color: tag.color })
            .then(() => {
                toast.success(`Tag "${tag.name}" created successfully!`);
                open = false;
            })
            .finally(() => {
                disabled = false;
            });
    };

    const update = () => {
        if (!tag) {
            toast.error('Cannot update without a tag context');
            return;
        }
        if (!tag.name) {
            toast.error('Name is required');
            return;
        }
        if (!tag.color) {
            toast.error('Color is required');
            return;
        }

        disabled = true;
        store.tags
            .update(tag.id, { name: tag.name, color: tag.color })
            .then(() => {
                toast.success(`Tag "${tag.name}" updated successfully!`);
                open = false;
            })
            .finally(() => {
                disabled = false;
            });
    };
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]" escapeKeydownBehavior={disabled ? 'ignore' : 'close'} interactOutsideBehavior={disabled ? 'ignore' : 'close'}>
        <Dialog.Header>
            <Dialog.Title>{text.title}</Dialog.Title>
            <Dialog.Description>{text.description}</Dialog.Description>
        </Dialog.Header>
        <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="text-right">Name</Label>
            <Input id="name" bind:value={tag.name} {disabled} class="col-span-3" placeholder="Enter tag name..." />

            <Label for="color-picker" class="text-right">Color</Label>
            <div class="col-span-3">
                <ColorPicker id="color-picker" bind:value={tag.color} {disabled} />
            </div>
        </div>
        <Dialog.Footer class="flex flex-row justify-center gap-2">
            <Button variant="secondary" onclick={() => (open = false)} {disabled}>Cancel</Button>
            {#if mode === 'CREATE'}<Button variant="default" onclick={create} {disabled}>Create</Button>{/if}
            {#if mode === 'UPDATE'}<Button variant="default" onclick={update} {disabled}>Update</Button>{/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
