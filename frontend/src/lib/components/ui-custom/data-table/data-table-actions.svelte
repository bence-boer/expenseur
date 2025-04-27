<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { Edit, Ellipsis, Trash2 } from '@lucide/svelte';

    type Props = {
        delete: () => Promise<void>;
        edit: () => Promise<void>;
    };
    let { delete: delete_row, edit }: Props = $props();
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
            <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
                <span class="sr-only">Open menu</span>
                <Ellipsis />
            </Button>
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
        <DropdownMenu.Item onclick={delete_row} class="text-red-500">
            <Trash2 />
            Delete
        </DropdownMenu.Item>
        <DropdownMenu.Item onclick={edit}>
            <Edit />
            Edit
        </DropdownMenu.Item>
    </DropdownMenu.Content>
</DropdownMenu.Root>
