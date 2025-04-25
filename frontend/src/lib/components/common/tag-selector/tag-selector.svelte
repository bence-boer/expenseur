<script lang="ts">
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { Button, buttonVariants } from '$lib/components/ui/button';
    import { Tag, Plus } from '@lucide/svelte';
    import { service, ServiceTypes } from '$lib/service';
    import { onMount } from 'svelte';
    import { TagMaintainDialog } from '../tag-maintain-dialog';
    import { toast } from 'svelte-sonner';

    type Props = {
        value: number[];
    };

    let { value = $bindable() }: Props = $props();

    let all_tags: ServiceTypes.Tag[] = $state([]);
    let tag_map: Map<number, ServiceTypes.Tag> = $state(new Map());
    let maintain_dialog_open = $state(false);

    const fetch_tags = () => {
        service
            .get_tags()
            .then((tags) => {
                all_tags = tags;
                tag_map = new Map(tags.map((tag) => [tag.id, tag]));
            })
            .catch((err) => {
                toast.error('Failed to fetch tags');
                console.error(err);
            });
    };

    onMount(fetch_tags);

    const handle_tag_maintained = (tag_id?: number) => {
        fetch_tags();
        if (tag_id && !value.includes(tag_id)) {
            value = [...value, tag_id];
        }
    };

    const open_create_dialog = () => {
        maintain_dialog_open = true;
    };

    const is_selected = (id: number) => value.includes(id);

    const toggle_tag = (id: number) => {
        if (is_selected(id)) {
            value = value.filter((tagId) => tagId !== id);
        } else {
            value = [...value, id];
        }
    };
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        <Button variant="outline" size="icon">
            <Tag />
        </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-56">
        <DropdownMenu.Group>
            <DropdownMenu.GroupHeading>Tags</DropdownMenu.GroupHeading>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
                onSelect={(e) => {
                    e.preventDefault();
                    open_create_dialog();
                }}
                class="flex items-center gap-2"
            >
                <Plus class="size-4" />Create...
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            {#if all_tags.length === 0}
                <DropdownMenu.Item disabled>No tags available</DropdownMenu.Item>
            {:else}
                {#each all_tags as tag (tag.id)}
                    <DropdownMenu.CheckboxItem
                        checked={is_selected(tag.id)}
                        onSelect={(e) => {
                            e.preventDefault();
                            toggle_tag(tag.id);
                        }}
                    >
                        <span class="inline-block h-3 w-3 rounded-sm mr-2" style="background-color: {tag.color};"></span>
                        {tag.name}
                    </DropdownMenu.CheckboxItem>
                {/each}
            {/if}
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>

<TagMaintainDialog bind:open={maintain_dialog_open} mode="CREATE" on_tag_maintained={handle_tag_maintained} />
