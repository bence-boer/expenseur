<script lang="ts">
    import { Badge } from '$lib/components/ui/badge';
    import type { ServiceTypes } from '$lib/service';

    type Props = {
        tag: ServiceTypes.Tag;
    };
    let { tag }: Props = $props();
</script>

<Badge variant="secondary" style="background-color: {tag.color}66; border: 1px solid {tag.color}">{tag.name}</Badge>
