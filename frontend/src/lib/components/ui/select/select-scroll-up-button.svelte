<script lang="ts">
    import { cn } from '$lib/utils';
    import { ChevronUp } from '@lucide/svelte';
    import { Select as SelectPrimitive, type WithoutChildrenOrChild } from 'bits-ui';

    let { ref = $bindable(null), class: className, ...restProps }: WithoutChildrenOrChild<SelectPrimitive.ScrollDownButtonProps> = $props();
</script>

<SelectPrimitive.ScrollUpButton bind:ref class={cn('flex cursor-default items-center justify-center py-1', className)} {...restProps}>
    <ChevronUp class="size-4" />
</SelectPrimitive.ScrollUpButton>
