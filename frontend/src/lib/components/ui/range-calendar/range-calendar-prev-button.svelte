<script lang="ts">
    import { buttonVariants } from '$lib/components/ui/button/index.js';
    import { cn } from '$lib/utils';
    import { ChevronLeft } from '@lucide/svelte';
    import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
    
    let { ref = $bindable(null), class: className, children, ...restProps }: RangeCalendarPrimitive.PrevButtonProps = $props();
</script>

{#snippet Fallback()}
    <ChevronLeft />
{/snippet}

<RangeCalendarPrimitive.PrevButton
    bind:ref
    class={cn(buttonVariants({ variant: 'outline' }), 'size-7 bg-transparent p-0 opacity-50 hover:opacity-100', className)}
    {...restProps}
    children={children || Fallback}
/>
