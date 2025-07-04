<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import { service, type ServiceTypes } from '$lib/service';
    import type { AIExpensePrediction } from '$lib/service/_manual-types';
    import { Plus, WandSparkles, X } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';

    type Props = {
        open: boolean;
        on_upload_complete: (data: AIExpensePrediction, processed_images: string[]) => void;
    };

    let { open = $bindable(), on_upload_complete: on_upload_complete }: Props = $props();

    let files: File[] = $state([]);
    let previews: string[] = $state([]);
    let is_loading = $state(false);

    const handle_file_select = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.files) {
            const new_files = Array.from(target.files);
            const valid_files = new_files.filter((file) => {
                if (!['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'].includes(file.type)) {
                    toast.warning(`Skipping unsupported file type: ${file.name} (${file.type})`);
                    return false;
                }
                return true;
            });

            if (valid_files.length > 0) {
                files = [...files, ...valid_files];
                generate_previews(valid_files);
            }
            target.value = '';
        }
    };

    const generate_previews = (new_files: File[]) => {
        new_files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                previews = [...previews, e.target?.result as string];
            };
            reader.readAsDataURL(file);
        });
    };

    const remove_image = (index: number) => {
        files = [...files.slice(0, index), ...files.slice(index + 1)];
        previews = [...previews.slice(0, index), ...previews.slice(index + 1)];
    };

    const handle_upload = async () => {
        if (files.length !== 1) {
            toast.error('Please select an image to upload.');
            return;
        }

        // if (files.length === 0) {
        //     toast.error('Please select at least one image to upload.');
        //     return;
        // }

        is_loading = true;

        try {
            const response = await service.get_ai_suggestions([files[0]]);

            on_upload_complete(response, [...previews]);
            toast.success('Receipt processed successfully!');
            files = [];
            previews = [];
            open = false;
        } catch (error: any) {
            console.error('AI Upload Error:', error);
            toast.error(`Failed to process receipt: ${error.message || 'Unknown error'}`);
        } finally {
            is_loading = false;
        }
    };

    const handle_cancel = () => {
        if (is_loading) return;
        files = [];
        previews = [];
        open = false;
    };

    $effect(() => {
        if (!open) {
            files = [];
            previews = [];
            is_loading = false;
        }
    });
</script>

<Dialog bind:open>
    <DialogContent class="sm:max-w-[600px]" escapeKeydownBehavior="close" onInteractOutside={handle_cancel}>
        <DialogHeader>
            <DialogTitle>Upload Receipt</DialogTitle>
        </DialogHeader>
        <ScrollArea class="max-h-[60vh]">
            <div class="grid grid-cols-1 gap-4 items-center justify-center w-full">
                {#each previews as preview, index}
                    <div class="relative border aspect-[3/4] sm:aspect-[5/3] rounded-md overflow-hidden group">
                        <img src={preview} alt="Receipt preview {index + 1}" class="object-contain w-full h-full bg-muted/10" />
                        <Button
                            variant="ghost"
                            size="icon"
                            class="absolute top-1 right-1 h-6 w-6 opacity-20 group-hover:opacity-100 transition-opacity z-10"
                            onclick={() => remove_image(index)}
                            disabled={is_loading}
                        >
                            <X class="h-4 w-4" />
                        </Button>
                    </div>
                {/each}
                {#if files.length === 0}
                    <div class="relative flex-1 aspect-[3/4] sm:aspect-[5/3] border border-dashed border-secondary rounded-md">
                        <Label for="image" class="flex items-center justify-center gap-2 cursor-pointer h-full">
                            <Plus size={48} class="text-secondary" />
                        </Label>
                        <Input
                            type="file"
                            class="absolute right-0 left-0 top-0 bottom-0 h-full"
                            onchange={handle_file_select}
                            accept="image/png, image/jpeg, image/webp, image/heic, image.heif"
                            multiple
                            disabled={is_loading}
                        />
                    </div>
                {/if}
            </div>
        </ScrollArea>

        <DialogFooter class="flex flex-row justify-stretch gap-2">
            <Button class="flex-1" variant="outline" onclick={handle_cancel} disabled={is_loading}>Cancel</Button>
            <Button class="flex-1" onclick={handle_upload} disabled={files.length === 0 || is_loading}>
                <WandSparkles size={16} />
                Process {files.length > 0 ? `(${files.length})` : ''}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
