<script lang="ts">
    import * as Dialog from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { ServiceTypes } from '$lib/service';
    import { toast } from 'svelte-sonner';
    import { Label } from '../../ui/label';
    import { Input } from '../../ui-custom/input';

    type Props = {
        open: boolean;
        mode: 'CREATE' | 'UPDATE';
        category?: ServiceTypes.Category;
    };

    let { open = $bindable(), mode, category }: Props = $props();
    $effect(() => {
        name = category?.name ?? '';
        color = category?.color ?? '';
    });
    let name = $state(category?.name);
    let color = $state(category?.color);
    let disabled = $state(false);

    let color_validator: RegExp = /^#[0-9A-Fa-f]{6}$/;
    // svelte-ignore state_referenced_locally
    let last_valid_color = color_validator.test(color) ? color : '#FFFFFF';
    const format_color = (color: string) => {
        const potential_valid_color = color.startsWith('#') ? color : `#${color}`;
        if (color_validator.test(potential_valid_color)) {
            last_valid_color = potential_valid_color;
            return potential_valid_color;
        }
        return last_valid_color;
    };

    const create = () => {
        toast.info('Creation of category is not implemented yet');
    };

    const update = () => {
        toast.info('Update of category is not implemented yet');
    };
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]" escapeKeydownBehavior="close" interactOutsideBehavior="close">
        <Dialog.Header>
            <Dialog.Title>{mode === 'CREATE' ? 'Create Category' : 'Update Category'}</Dialog.Title>
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
            {#if mode === 'CREATE'}<Button variant="default" onclick={create}>Create</Button>{/if}
            {#if mode === 'UPDATE'}<Button variant="default" onclick={update}>Update</Button>{/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
