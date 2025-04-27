<script lang="ts" generics="MODE extends 'CREATE' | 'UPDATE'">
    import { ColorPicker } from '$lib/components/ui-custom/color-picker';
    import { Input } from '$lib/components/ui-custom/input';
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Label } from '$lib/components/ui/label';
    import { service, ServiceTypes } from '$lib/service';
    import { toast } from 'svelte-sonner';

    type Props = {
        open: boolean;
        mode: MODE;
        category?: MODE extends 'UPDATE' ? ServiceTypes.Category : never;
        on_category_created: (category_id: number) => void;
    };

    let { open = $bindable(), mode, category, on_category_created }: Props = $props();

    type TextResource = {
        [key in MODE]: {
            title: string;
            description: string;
        };
    };
    const text: TextResource[MODE] = $derived(
        {
            CREATE: { title: 'Create Category', description: 'Enter the details of the category you want to create.' },
            UPDATE: { title: 'Update Category', description: 'Modify the details of the category to update it.' }
        }[mode]
    );

    $effect(() => {
        name = category?.name ?? '';
        color = category?.color;
    });
    let name = $state(category?.name);
    let color = $state<string | undefined>(category?.color);
    let disabled = $state(false);

    const create = () => {
        if (!name) {
            toast.error('Name is required');
            return;
        }
        if (!color) {
            toast.error('Color is required');
            return;
        }

        disabled = true;
        service
            .create_category({ name, color })
            .then((data) => {
                on_category_created(data.id);
                toast.success(`Category "${name}" created successfully!`);
                open = false;
            })
            .catch((error) => {
                toast.error(`Failed to create Category`);
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
        if (!color) {
            toast.error('Color is required');
            return;
        }
        if (!category) {
            toast.error('Cannot update without a category context');
            return;
        }

        disabled = true;
        service
            .update_category(category.id, { name, color })
            .then(() => {
                on_category_created(category.id);
                toast.success(`Category "${name}" updated successfully!`);
                open = false;
            })
            .catch((error) => {
                toast.error(`Failed to update Category`);
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
            <Dialog.Title>{text.title}</Dialog.Title>
            <Dialog.Description>{text.description}</Dialog.Description>
        </Dialog.Header>
        <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="text-right">Name</Label>
            <Input id="name" bind:value={name} {disabled} class="col-span-3" />

            <Label for="color-picker" class="text-right">Color</Label>
            <div class="col-span-3">
                <ColorPicker id="color-picker" bind:value={color} {disabled} />
            </div>
        </div>
        <Dialog.Footer class="flex flex-row justify-center gap-2">
            <Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
            {#if mode === 'CREATE'}<Button variant="default" onclick={create} {disabled}>Create</Button>{/if}
            {#if mode === 'UPDATE'}<Button variant="default" onclick={update} {disabled}>Update</Button>{/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
