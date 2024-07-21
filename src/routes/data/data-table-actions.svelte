<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import Trash from 'lucide-svelte/icons/trash-2';
	import Pencil from 'lucide-svelte/icons/pencil';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';

	export let id: string | number;
	export let delete_item: ((id: number) => void) | ((id: string) => void);

	const edit = () => {
		toast.error('Feature not implemented');
	};
	const _delete = () => {
		if (typeof id === 'number' && typeof delete_item === 'function') {
			(delete_item as (id: number) => void)(id);
		} else if (typeof id === 'string' && typeof delete_item === 'function') {
			(delete_item as (id: string) => void)(id);
		}
	};
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<Ellipsis class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item on:click={() => toast.message('🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻🤷🏻')}>
				Idk dude 🤷🏻🤷🏻🤷🏻
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item on:click={edit}>
			<Pencil class="mr-2 h-4 w-4" />
			Edit
		</DropdownMenu.Item>
		<DropdownMenu.Item class="text-red-600" on:click={_delete}>
			<Trash class="mr-2 h-4 w-4" />
			Delete
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
