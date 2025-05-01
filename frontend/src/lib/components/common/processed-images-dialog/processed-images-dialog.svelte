<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import { X } from '@lucide/svelte';

    type Props = {
        open: boolean;
        processed_images: string[];
    };

    let { open = $bindable(), processed_images }: Props = $props();

    const handle_close = () => {
        open = false;
    };
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[800px] max-h-[80vh]" escapeKeydownBehavior="close" onInteractOutside={handle_close}>
        <Dialog.Header>
            <Dialog.Title>Processed Images</Dialog.Title>
        </Dialog.Header>

        <ScrollArea class="max-h-[60vh] w-full">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {#each processed_images as image_url, index}
                    <div class="relative border rounded-md overflow-hidden group aspect-[3/4] sm:aspect-[4/3]">
                        <img src={image_url} alt="Processed receipt {index + 1}" class="object-contain w-full h-full bg-muted/10" />
                    </div>
                {:else}
                    <div class="col-span-full text-center text-muted-foreground py-8">No processed images available</div>
                {/each}
            </div>
        </ScrollArea>

        <Dialog.Footer class="flex flex-row justify-center">
            <Button variant="outline" onclick={handle_close} class="w-24">
                <X class="h-4 w-4" />
                Close
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
