<script lang="ts">
    import * as Dialog from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { Trash } from '@lucide/svelte';

    type Props = {
        open: boolean;
        title: string;
        description: string;
        delete: () => Promise<unknown>;
    };

    let { open = $bindable(), title, description, delete: remove }: Props = $props();

    const on_delete_click = () => {
        remove().then(() => {
            open = false;
        });
    };
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]" escapeKeydownBehavior="close" interactOutsideBehavior="close">
        <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>{description}</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer class="flex flex-row justify-center gap-2">
            <Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
            <Button variant="destructive" onclick={on_delete_click}>Delete</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
