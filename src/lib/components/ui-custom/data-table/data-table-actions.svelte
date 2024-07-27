<script lang="ts">
	import { Ellipsis, Trash2, Pencil } from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';

	export let id: string | number;
	export let delete_item: ((id: number) => Promise<void>) | ((id: string) => Promise<void>);
	let open = false;

	const edit = () => {
		toast.error('Feature not implemented');
	};
	const _delete = async () => {
		open = false;
		if (typeof id === 'number' && typeof delete_item === 'function') {
			await (delete_item as (id: number) => Promise<void>)(id);
		} else if (typeof id === 'string' && typeof delete_item === 'function') {
			await (delete_item as (id: string) => Promise<void>)(id);
		}
	};
</script>

<DropdownMenu.Root closeOnItemClick={false} bind:open>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<Ellipsis class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item on:click={edit}>
			<Pencil class="mr-2 h-4 w-4" />
			Edit
		</DropdownMenu.Item>
		<DropdownMenu.Item>
			<AlertDialog.Root>
				<AlertDialog.Trigger class="flex flex-row justify-center text-red-600">
					<Trash2 class="mr-2 h-4 w-4" />
					Delete
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Are you sure you want to delete this record?</AlertDialog.Title>
						<AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
						<AlertDialog.Action on:click={_delete}>Delete</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
