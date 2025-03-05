<script lang="ts">
	import { service } from '$lib/service';
	import ComboBox from '$lib/components/ui-custom/combo-box/combo-box.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui-custom/input';
	import { Label } from '$lib/components/ui/label';
	import { label_value_transform } from '$lib/utils';
	import type { LabelValue } from '$lib/types';
	import { toast } from 'svelte-sonner';

	interface Props {
		open?: boolean;
		name?: string;
		on_item_created: (item_id: number) => void;
	}

	let { open = $bindable(false), name = $bindable(''), on_item_created }: Props = $props();

	let dialog_disabled = $state(false);

	let category: number | undefined = $state();
	let categories: LabelValue[] = $state([]);

	let unit: number | undefined = $state();
	let units: LabelValue[] = $state([]);

	service.get_categories().then((data) => (categories = data.map(label_value_transform)));
	service.get_units().then((data) => (units = data.map(label_value_transform)));

	const reset_form = () => {
		name = '';
		category = undefined;
		unit = undefined;
	};

	const onOpenChange = (open: boolean) => {
		if (!open) on_item_created(undefined as any as number);
	};

	const create_category = async (label: string) => {
		dialog_disabled = true;
		return service
			.create_category(label)
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
			.create_unit(label)
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

	const create_item = async () => {
		if (!name) {
			toast.error('Name is required');
			return;
		}

		if (!category) {
			toast.error('Category is required');
			return;
		}

		if (!unit) {
			toast.error('Unit is required');
			return;
		}

		dialog_disabled = true;

		service
			.create_item({ name, category_id: category, unit_id: unit })
			.then((data) => {
				on_item_created(data.id);
				open = false;
				reset_form();
			})
			.catch((error) => {
				toast.error(error.message);
				throw error;
			})
			.finally(() => {
				dialog_disabled = false;
			});
	};
</script>

<Dialog.Root bind:open {onOpenChange}>
	<Dialog.Content
		class="sm:max-w-[425px]"
		escapeKeydownBehavior={dialog_disabled ? 'ignore' : 'close'}
		interactOutsideBehavior={dialog_disabled ? 'ignore' : 'close'}
	>
		<Dialog.Header>
			<Dialog.Title>Create Item</Dialog.Title>
			<Dialog.Description>Enter the details of the item you want to create.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="name" class="text-right">Name</Label>
				<Input id="name" bind:value={name} disabled={dialog_disabled} class="col-span-3" />
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
				<ComboBox
					data={units}
					bind:value={unit}
					placeholder="Select unit..."
					create={create_unit}
					disabled={dialog_disabled}
					class="col-span-3"
				></ComboBox>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="submit" onclick={create_item} disabled={dialog_disabled}>Create</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
