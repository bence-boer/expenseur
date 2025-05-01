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
        unit: ServiceTypes.Unit; 
    };

    let { open = $bindable(), mode, unit }: Props = $props(); 

    type TextResource = {
        [key in MODE]: {
            title: string;
            description: string;
        };
    };
    const text: TextResource[MODE] = $derived(
        {
            CREATE: { title: 'Create Unit', description: 'Enter the name of the unit you want to create.' }, 
            UPDATE: { title: 'Update Unit', description: 'Modify the name of the unit to update it.' } 
        }[mode]
    );

    let disabled = $state(false); 

    const create_unit = async () => { 
        if (!unit.name) { 
            toast.error('Name is required');
            return;
        }

        disabled = true;
        store.units 
            .create({ name: unit.name })
            .then(() => {
                toast.success(`Unit "${unit.name}" created successfully!`); 
                open = false;
            })
            .finally(() => {
                disabled = false;
            });
    };

    const update_unit = async () => { 
        if (!unit.name) { 
            toast.error('Name is required');
            return;
        }
        if (!unit || unit.id === -1) { 
            toast.error('Cannot update without a valid unit context');
            return;
        }

        disabled = true;
        store.units 
            .update(unit.id, { name: unit.name })
            .then(() => {
                toast.success(`Unit "${unit.name}" updated successfully!`); 
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
                <Input id="name" bind:value={unit.name} {disabled} class="col-span-3" placeholder="Enter unit name..." /> 
            </div>
        </div>
        <Dialog.Footer class="flex flex-row justify-center gap-2"> 
            <Button variant="secondary" onclick={() => (open = false)} {disabled}>Cancel</Button>
            {#if mode === 'CREATE'}
                <Button type="submit" onclick={create_unit} {disabled}>Create</Button> 
            {:else}
                <Button type="submit" onclick={update_unit} {disabled}>Update</Button> 
            {/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
