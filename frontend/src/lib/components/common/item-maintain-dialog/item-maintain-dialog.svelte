<script lang="ts" generics="MODE extends 'CREATE' | 'UPDATE'">
    import ComboBox from '$lib/components/ui-custom/combo-box/combo-box.svelte';
    import { Input } from '$lib/components/ui-custom/input';
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Label } from '$lib/components/ui/label';
    import type { ServiceTypes } from '$lib/service';
    import { store } from '$lib/store';
    import type { LabelValue } from '$lib/types';
    import { label_value_transform } from '$lib/utils';
    import { toast } from 'svelte-sonner';

    type Props = {
        open: boolean;
        mode: MODE;
        item: ServiceTypes.Item;
        on_item_created: (item_id: number) => void;
    };

    let { open = $bindable(), mode, item, on_item_created = () => {} }: Props = $props();

    type TextResource = {
        [key in MODE]: {
            title: string;
            description: string;
        };
    };
    const text: TextResource[MODE] = $derived(
        {
            CREATE: { title: 'Create Item', description: 'Enter the details of the item you want to create.' },
            UPDATE: { title: 'Update Item', description: 'Modify the details of the item to update it.' }
        }[mode]
    );

    let disabled = $state(false);

    let categories_lv: LabelValue[] = $state([]);
    let units_lv: LabelValue[] = $state([]);

    let item_name: string = $state(item?.name ?? '');
    let item_category_id: number | undefined = $state(item?.category_id);
    let item_unit_id: number | undefined = $state(item?.unit_id);

    $effect(() => {
        item_name = item?.name ?? '';
        item_category_id = item?.category_id;
        item_unit_id = item?.unit_id;
    });
    $effect(() => {
        store.categories.data.then((data) => {
            if (data) {
                categories_lv = data.map(label_value_transform);
            }
        });
    });
    $effect(() => {
        store.units.data.then((data) => {
            if (data) {
                units_lv = data.map(label_value_transform);
            }
        });
    });

    const create_new_category = async (label: string) => {
        disabled = true;
        try {
            const new_category = await store.categories.create({ name: label, color: '#000000' });
            toast.success(`Category "${label}" created successfully!`);
            return new_category.id;
        } finally {
            disabled = false;
        }
    };

    const create_new_unit = async (label: string) => {
        disabled = true;
        try {
            const new_unit = await store.units.create({ name: label });
            toast.success(`Unit "${label}" created successfully!`);
            return new_unit.id;
        } finally {
            disabled = false;
        }
    };

    const valid = () => {
        if (!item_name) {
            toast.error('Name is required');
            return false;
        }
        if (item_category_id === undefined || item_category_id === null) {
            toast.error('Category is required');
            return false;
        }
        if (item_unit_id === undefined || item_unit_id === null) {
            toast.error('Unit is required');
            return false;
        }
        return true;
    };

    const create_item = async () => {
        if (!valid()) return;
        disabled = true;

        store.items
            .create({ name: item_name, category_id: item_category_id!, unit_id: item_unit_id! })
            .then(() => {
                toast.success(`Item "${item_name}" created successfully!`);
                open = false;
                on_item_created(item.id);
            })
            .finally(() => {
                disabled = false;
            });
    };

    const update_item = async () => {
        if (!valid()) return;
        if (!item || item.id === -1) {
            toast.error('Cannot update without a valid item context');
            return;
        }
        disabled = true;
        store.items
            .update(item.id, { name: item_name, category_id: item_category_id!, unit_id: item_unit_id! })
            .then(() => {
                toast.success(`Item "${item_name}" updated successfully!`);
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
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right">Name</Label>
                <Input id="name" bind:value={item_name} {disabled} class="col-span-3" placeholder="Enter item name..." />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="category" class="text-right">Category</Label>
                <ComboBox
                    data={categories_lv}
                    bind:value={item_category_id}
                    placeholder="Select category..."
                    create={create_new_category}
                    {disabled}
                    class="col-span-3"
                ></ComboBox>
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="unit" class="text-right">Unit</Label>
                <ComboBox data={units_lv} bind:value={item_unit_id} placeholder="Select unit..." create={create_new_unit} {disabled} class="col-span-3"
                ></ComboBox>
            </div>
        </div>
        <Dialog.Footer class="flex flex-row justify-center gap-2">
            <Button variant="secondary" onclick={() => (open = false)} {disabled}>Cancel</Button>
            {#if mode === 'CREATE'}
                <Button type="submit" onclick={create_item} {disabled}>Create</Button>
            {:else}
                <Button type="submit" onclick={update_item} {disabled}>Update</Button>
            {/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
