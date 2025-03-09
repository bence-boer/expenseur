<script lang="ts">
    import { CircleX } from '@lucide/svelte';

    type Props = {
        children?: () => any;
    };

    let { children }: Props = $props();
</script>

<div class="flex flex-row items-center gap-4  border border-muted rounded-lg p-4">
    <CircleX size="24" class="text-muted-foreground" />
    {@render children?.()}
</div>
