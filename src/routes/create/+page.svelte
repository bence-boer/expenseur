<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import DatePicker from '$lib/components/ui-custom/date-picker/date-picker.svelte';
	import { Input } from '$lib/components/ui-custom/input';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import {
		currency_formatter,
		currency_parser,
		number_formatter,
		number_parser
	} from '$lib/consts';
	import * as service from '$lib/service';
	import type { FunctionReturns } from '$lib/types';
	import { label_value_transform, sanitize_string } from '$lib/utils';
	import { type DateValue, getLocalTimeZone, today } from '@internationalized/date';
	import { Copy, Plus, X } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { Tables, TablesInsert } from '../../types/supabase';
	import ComboBox from '../../lib/components/ui-custom/combo-box/combo-box.svelte';
	import CreateItemDialog from './create-item-dialog.svelte';

	const item_details: FunctionReturns['item_details'] = $state([]);
	const formatters: Intl.NumberFormat[] = $state([]);
	const update_item_detail = (index: number) => {
		if (item_details[index]) return;

		service.get_item_details(index).then((details) => {
			item_details[index] = details!;
			formatters[index] = formatter_for_unit(details!.unit);
		});
	};

	interface Props {
		data: {
			brands: Tables<'brands'>[];
			categories: Tables<'categories'>[];
			stores: Tables<'stores'>[];
			units: Tables<'units'>[];
			items: Tables<'items'>[];
		};
	}

	let { data }: Props = $props();

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

	let purchases: FormSchema['purchases'] = $state([empty_purchase()]);

	let selectable_stores = $state(data.stores.map(label_value_transform));
	let selected_store: number | undefined = $state();

	let date: DateValue | undefined = $state(); // TODO: REFACTOR INTO SCHEMA OBJECT
	let selectable_items = $state(data.items.map(label_value_transform));
	let selectable_brands = $state(data.brands.map(label_value_transform));

	let create_item_dialog_open = $state(false);
	let create_item_label: string | undefined = $state();
	let on_item_created: (item_id: number) => void = $state(() => void 0);

	const total = $derived(
		currency_formatter.format(
			purchases.reduce((total, purchase) => total + (purchase.price ?? 0), 0)
		)
	);

	const create_store = async (label: string | null): Promise<number> => {
		label = sanitize_string(label);
		if (!label) {
			toast.error('Store name should contain characters other than whitespaces!');
			return Promise.reject();
		}

		return service
			.create_store(label)
			.then((store) => {
				selectable_stores = [...selectable_stores, { label, value: store.id }];
				toast.success(`Store "${label}" created successfully!`);
				return store.id;
			})
			.catch((error) => {
				toast.error(error.message);
				throw error;
			});
	};

	const create_item = async (label: string | null): Promise<number> => {
		label = sanitize_string(label);
		if (!label) {
			toast.error('Item name should contain characters other than whitespaces!');
			return Promise.reject();
		}

		create_item_dialog_open = true;
		create_item_label = label;

		return new Promise((resolve) => {
			on_item_created = (item_id: number) => {
				if (item_id) selectable_items = [...selectable_items, { label, value: item_id }];
				// TODO: refresh units and items
				toast.success(`Item "${label}" created successfully!`);
				resolve(item_id);
			};
		});
	};

	const create_brand = async (label: string | null): Promise<number> => {
		label = sanitize_string(label);
		if (!label) {
			toast.error('Store name should contain characters other than whitespaces!');
			return Promise.reject();
		}

		return service
			.create_brand(label)
			.then((brand) => {
				selectable_brands = [...selectable_brands, { label, value: brand.id }];
				toast.success(`Brand "${label}" created successfully!`);
				return brand.id;
			})
			.catch((error) => {
				toast.error(error.message);
				throw error;
			});
	};

	const duplicate_item = (index: number) => {
		purchases = [
			...purchases.slice(0, index + 1),
			structuredClone(purchases[index]),
			...purchases.slice(index + 1)
		];
		const message: string = `Item ${selectable_items.find((item) => item.value === purchases[index].item_id)?.label ?? ''} duplicated!`;
		toast.success(message);
	};

	const delete_row = (index: number) =>
		(purchases = [...purchases.slice(0, index), ...purchases.slice(index + 1)]);

	const add_row = () => (purchases = [...purchases, empty_purchase()]);

	const handle_submit = (event: Event) => {
		event.preventDefault();

		const errors: string[] = [];
		if (!date) errors.push('Date is required!');
		if (!selected_store) errors.push('Store is required!');

		if (purchases.some((purchase) => !purchase.item_id))
			errors.push('Each purchase should have an item chosen!');

		if (
			purchases.some(
				(purchase) => (!purchase.quantity && purchase.quantity !== 0) || purchase.quantity < 0
			)
		)
			errors.push('Each purchase should have a qunatity specified!');
		if (purchases.some((purchase) => !purchase.price))
			errors.push('Each purchase should have a price specified!');

		if (errors.length > 0) {
			errors.forEach((message) => toast.error(message));
			return false;
		}

		const formatted_date = date!.toString();
		const data: TablesInsert<'purchases'>[] = purchases.map((purchase) => ({
			...(purchase as any),
			brand_id: purchase.brand_id ?? null,
			details:
				purchase.details
					?.split(', ')
					.map((detail) => sanitize_string(detail))
					.filter(Boolean) ?? null,
			date: formatted_date,
			store_id: selected_store
		}));

		service
			.create_purchases(data)
			.then((data) => {
				const sum = total;
				purchases = [empty_purchase()];
				date = undefined;
				selected_store = undefined;

				toast.success(`Purchase of ${sum} registered successfully!`);
			})
			.catch((error) => {
				toast.error(error.message);
			});
	};

	const formatter_for_unit = (unit: string) =>
		({
			format: (value: number) => `${number_formatter.format(value)} ${unit}`
		}) as Intl.NumberFormat;
</script>

<h1 class="text-2xl font-bold sm:text-4xl">Register Purchase</h1>
<Separator />

<div class="flex flex-row flex-wrap gap-4">
	<ComboBox
		data={selectable_stores}
		bind:value={selected_store}
		placeholder="Select store..."
		create={create_store}
		class="sm:w-48"
	></ComboBox>
	<DatePicker
		bind:value={date}
		title="Pick date..."
		placeholder={today(getLocalTimeZone())}
		class="flex-1 sm:min-w-48 sm:max-w-64"
	></DatePicker>
</div>
<ScrollArea class="flex-auto rounded-md border p-4" orientation="vertical">
	{#each purchases as purchase, index}
		{#if index > 0}
			<Separator class="mb-4 mt-2"></Separator>
		{/if}
		<div class="flex flex-col gap-2">
			<div class="flex flex-row">
				<ComboBox
					data={selectable_items}
					bind:value={purchase.item_id}
					placeholder="Select item..."
					create={create_item}
					onchange={update_item_detail}
					class="sm:w-48"
				></ComboBox>
				<Button class="ml-2" size="icon" onclick={() => duplicate_item(index)} variant="ghost">
					<Copy class="h-4 w-4 text-muted-foreground" />
				</Button>
				<Button size="icon" onclick={() => delete_row(index)} variant="ghost">
					<X class="h-4 w-4 text-red-600" />
				</Button>
			</div>
			<Input placeholder="Details" bind:value={purchase.details} class="w-full sm:w-48"></Input>
			<ComboBox
				data={selectable_brands}
				bind:value={purchase.brand_id}
				placeholder="Select brand..."
				create={create_brand}
				class="sm:w-48"
			></ComboBox>
			<div class="flex flex-row flex-nowrap gap-2">
				<Input
					placeholder={`Quantity ${purchase.item_id && item_details[purchase.item_id] ? '(' + item_details[purchase.item_id]?.unit + ')' : ''}`}
					bind:value={purchase.quantity}
					class="min-w-24 max-w-48"
					formatter={purchase.item_id && item_details[purchase.item_id]
						? formatters[purchase.item_id]
						: number_formatter}
					parser={number_parser}
				></Input>
				<Input
					placeholder="Price"
					bind:value={purchase.price}
					class="min-w-24 max-w-48"
					formatter={currency_formatter}
					parser={currency_parser}
				></Input>
			</div>
		</div>
	{/each}

	<div class="flex justify-end py-2">
		<Button class="p-2" size="icon" onclick={add_row} variant="outline">
			<Plus class="h-4 w-4 text-muted-foreground" />
		</Button>
	</div>
</ScrollArea>

<div class="flex items-end justify-between">
	<span class="text-sm text-muted-foreground">Total: {total}</span>
	<Button type="submit" class="w-24" onclick={handle_submit}>Submit</Button>
</div>

<CreateItemDialog bind:open={create_item_dialog_open} {on_item_created} name={create_item_label} />
