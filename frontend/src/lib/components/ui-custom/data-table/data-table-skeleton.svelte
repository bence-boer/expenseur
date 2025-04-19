<script lang="ts">
    import * as Table from '$lib/components/ui/table';
    import { Skeleton } from '$lib/components/ui/skeleton';

    type Props = {
        columns?: number;
        rows?: number;
    };

    let { columns = 5, rows = 5 }: Props = $props();
</script>

<div class="flex flex-col gap-2">
    <div class="flex gap-2">
        <Skeleton class="h-9 flex-1" />
        <Skeleton class="h-9 w-[90px]" />
    </div>
    <Skeleton class="h-72 w-full" />
    <div class="flex justify-between">
        <Skeleton class="h-9 w-16" />
        <Skeleton class="h-9 w-28" />
    </div>
</div>
