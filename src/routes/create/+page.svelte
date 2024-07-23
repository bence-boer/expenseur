<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import DatePicker from '$lib/components/ui/date-picker/date-picker.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import * as service from '$lib/service';
	import type { FunctionReturns } from '$lib/types';
	import { type DateValue, getLocalTimeZone, today } from '@internationalized/date';
	import Copy from 'lucide-svelte/icons/copy';
	import Plus from 'lucide-svelte/icons/plus';
	import X from 'lucide-svelte/icons/x';
	import { toast } from 'svelte-sonner';
	import { supabase } from '../../supabase-client';
	import type { Tables, TablesInsert } from '../../types/supabase';
	import ComboBox from './../../lib/components/ui/combo-box/combo-box.svelte';
	import { label_value_transform } from '$lib/utils';
	import CreateItemDialog from './create-item-dialog.svelte';

	const item_details: FunctionReturns['item_details'] = [];
	const update_item_detail = ({ detail }: CustomEvent<{ value: number }>) => {
		if (item_details[detail.value]) return;

		service
			.get_item_details(detail.value)
			.then((details) => (item_details[detail.value] = details!));
	};

	export let data: {
		brands: Tables<'brands'>[];
		categories: Tables<'categories'>[];
		stores: Tables<'stores'>[];
		units: Tables<'units'>[];
		items: Tables<'items'>[];
	};

	type FormSchema = {
		date: string;
		store_id: number;
		purchases: {
			item_id?: number;
			details?: string;
			brand_id?: number;
			quantity?: number;
			price?: number;
		}[];
	};

	const empty_purchase = (): FormSchema['purchases'][number] => ({
		item_id: undefined,
		details: undefined,
		brand_id: undefined,
		quantity: undefined,
		price: undefined
	});

	let purchases: FormSchema['purchases'] = [empty_purchase()];

	let selectable_stores = data.stores.map(label_value_transform);
	let selected_store: number | undefined;

	const create_store = async (label: string) =>
		service
			.create_store(label)
			.then((store) => {
				selectable_stores = [...selectable_stores, { label, value: store.id }];
				selected_store = store.id;
			})
			.catch((error) => {
				toast.error(error.message);
				throw error;
			});

	let date: DateValue | undefined;
	let selectable_items = data.items.map(label_value_transform);
	let selectable_brands = data.brands.map(label_value_transform);

	let create_item_dialog_open = false;
	let create_item_label: string;
	let on_item_created: (item_id: number) => void;

	const create_item = async (label: string) => {
		create_item_dialog_open = true;
		create_item_label = label;

		return new Promise<void>((resolve) => {
			on_item_created = (item_id: number) => {
				selectable_items = [...selectable_items, { label, value: item_id }];
				resolve();
			};
		});
	};

	const create_brand = async (label: string) => {
		return service
			.create_brand(label)
			.then((brand) => {
				selectable_brands = [...selectable_brands, { label, value: brand.id }];
			})
			.catch((error) => {
				toast.error(error.message);
				throw error;
			});
	};

	const duplicate_row = (index: number) =>
		(purchases = [
			...purchases.slice(0, index + 1),
			structuredClone(purchases[index]),
			...purchases.slice(index + 1)
		]);

	const delete_row = (index: number) =>
		(purchases = [...purchases.slice(0, index), ...purchases.slice(index + 1)]);

	const add_row = () => (purchases = [...purchases, empty_purchase()]);

	const handle_submit = (event: Event) => {
		event.preventDefault();

		if (!date || !selected_store) {
			toast.error('Please fill out all fields.');
			return false;
		}
		for (const purchase of purchases) {
			if (!purchase.item_id || !purchase.quantity || !purchase.price) {
				toast.error('Please fill out all fields.');
				return false;
			}
		}

		const formatted_date = date.toString();
		const data: TablesInsert<'purchases'>[] = purchases.map((purchase) => ({
			...(purchase as any),
			brand_id: purchase.brand_id ?? null,
			details:
				purchase.details
					?.split(', ')
					.map((detail) => detail.trim())
					.filter(Boolean) ?? null,
			date: formatted_date,
			store_id: selected_store
		}));

		supabase
			.from('purchases' as any)
			.insert(data)
			.then(({ error }) => {
				if (error) {
					toast.error(error.message);
					return;
				}

				purchases = [empty_purchase()];
				date = undefined;
				selected_store = undefined;
				toast.success('Purchase registered successfully!');
			});
	};
</script>

<h1 class="mb-4 text-4xl font-bold">Register Purchase</h1>
<Separator class="mb-8" />

<div class="mb-4 flex flex-row flex-wrap gap-4">
	<ComboBox
		data={selectable_stores}
		bind:value={selected_store}
		placeholder="Select store..."
		create={create_store}
	></ComboBox>
	<DatePicker
		bind:value={date}
		title="Pick date..."
		placeholder={today(getLocalTimeZone())}
		class="min-w-48 max-w-64 flex-1"
	></DatePicker>
</div>
{#each purchases as purchase, index}
	<div class="mb-4 flex justify-between gap-4">
		<ComboBox
			data={selectable_items}
			bind:value={purchase.item_id}
			placeholder="Select item..."
			create={create_item}
			on:change={update_item_detail}
		></ComboBox>
		<Input placeholder="Details" bind:value={purchase.details} class="min-w-24 flex-1"></Input>
		<ComboBox
			data={selectable_brands}
			bind:value={purchase.brand_id}
			placeholder="Select brand..."
			create={create_brand}
		></ComboBox>
		<Input
			placeholder={`Quantity ${purchase.item_id && item_details[purchase.item_id] ? '(' + item_details[purchase.item_id]?.unit + ')' : ''}`}
			bind:value={purchase.quantity}
			class="min-w-24 max-w-48"
			type="number"
		></Input>
		<Input placeholder="Price" bind:value={purchase.price} class="min-w-24 max-w-48" type="number"
		></Input>
		<div class="flex flex-initial flex-row">
			<Button class="p-2" size="icon" on:click={() => duplicate_row(index)} variant="ghost">
				<Copy class="h-4 w-4 text-muted-foreground" />
			</Button>
			<Button class="p-2" size="icon" on:click={() => delete_row(index)} variant="ghost">
				<X class="h-4 w-4 text-red-600" />
			</Button>
		</div>
	</div>
{/each}

<div class="flex justify-between">
	<Button class="p-2" size="icon" on:click={add_row} variant="outline">
		<Plus class="h-4 w-4 text-muted-foreground" />
	</Button>
	<Button type="submit" class="w-24" on:click={handle_submit}>Submit</Button>
</div>

<CreateItemDialog bind:open={create_item_dialog_open} {on_item_created} name={create_item_label} />
