<script lang="ts" generics="MODE extends 'CREATE' | 'UPDATE'">
    import ComboBox from '$lib/components/ui-custom/combo-box/combo-box.svelte';
    import { Input } from '$lib/components/ui-custom/input';
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Label } from '$lib/components/ui/label';
    import type { ServiceTypes } from '$lib/service';
    import { service } from '$lib/service';
    import type { LabelValue } from '$lib/types';
    import { label_value_transform } from '$lib/utils';
    import { toast } from 'svelte-sonner';

    type Props = {
        open?: boolean;
        name?: string;
        mode: MODE;
        item?: MODE extends 'UPDATE' ? ServiceTypes.Item : never;
        on_item_created: (item_id: number) => void;
    };

    let { open = $bindable(false), name = $bindable(), on_item_created, mode, item }: Props = $props();

    let dialog_disabled = $state(false);

    let category: number = $state();
    let categories: LabelValue[] = $state([]);

    let unit: number = $state();
    let units: LabelValue[] = $state([]);

    service.get_categories().then((data) => (categories = data.map(label_value_transform)));
    service.get_units().then((data) => (units = data.map(label_value_transform)));

    const reset_form = () => {
        name = undefined;
        category = undefined;
        unit = undefined;
    };

    $effect(() => {
        name = item?.name;
        category = item?.category_id;
        unit = item?.unit_id;
    });

    const create_category = async (label: string) => {
        dialog_disabled = true;
        return service
            .create_category({ name: label })
            .then((data) => {
                categories = [...categories, { label, value: data.id }];
                return data.id;
            })
            .catch((error) => {
                toast.error(error.message);
                throw error;
            })
            .finally(() => {
                dialog_disabled = false;
            });
    };

    const create_unit = async (label: string) => {
        dialog_disabled = true;
        return service
            .create_unit({ name: label })
            .then((data) => {
                units = [...units, { label, value: data.id }];
                return data.id;
            })
            .catch((error) => {
                toast.error(error.message);
                throw error;
            })
            .finally(() => {
                dialog_disabled = false;
            });
    };

    const valid = () => {
        if (!name) {
            toast.error('Name is required');
            return false;
        }

        if (!category) {
            toast.error('Category is required');
            return false;
        }

        if (!unit) {
            toast.error('Unit is required');
            return false;
        }

        return true;
    };

    const create_item = async () => {
        if (!valid()) return;

        dialog_disabled = true;

        service
            .create_item({ name, category_id: category, unit_id: unit })
            .then((data) => {
                on_item_created(data.id);
                toast.success(`Item "${name}" created successfully!`);
                open = false;
                reset_form();
            })
            .catch((error) => {
                toast.error(`Failed to create Item`);
                throw error;
            })
            .finally(() => {
                dialog_disabled = false;
            });
    };

    const update_item = async () => {
        if (!valid()) return;

        dialog_disabled = true;

        service
            .update_item(item.id, { name, category_id: category, unit_id: unit })
            .then(() => {
                on_item_created(item.id);
                toast.success(`Item "${name}" updated successfully!`);
                open = false;
                reset_form();
            })
            .catch((error) => {
                toast.error(`Failed to update Item`);
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
            <Dialog.Title>{mode === 'CREATE' ? 'Create Item' : 'Update Item'}</Dialog.Title>
            <Dialog.Description>Enter the details of the item you want to create.</Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right">Name</Label>
                <Input id="name" bind:value={name} disabled={dialog_disabled} class="col-span-3" placeholder="Enter item name..." />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="category" class="text-right">Category</Label>
                <ComboBox
                    data={categories}
                    bind:value={category}
                    placeholder="Select category..."
                    create={create_category}
                    disabled={dialog_disabled}
                    class="col-span-3"
                ></ComboBox>
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="unit" class="text-right">Unit</Label>
                <ComboBox data={units} bind:value={unit} placeholder="Select unit..." create={create_unit} disabled={dialog_disabled} class="col-span-3"
                ></ComboBox>
            </div>
        </div>
        <Dialog.Footer>
            {#if mode === 'CREATE'}
                <Button type="submit" onclick={create_item} disabled={dialog_disabled}>Create</Button>
            {:else}
                <Button type="submit" onclick={update_item} disabled={dialog_disabled}>Update</Button>
            {/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
