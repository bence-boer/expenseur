<script lang="ts">
    import { buttonVariants } from '$lib/components/ui/button/index.js';
    import { cn } from '$lib/utils.js';
    import { ChevronRight } from '@lucide/svelte';
    import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';

    let { ref = $bindable(null), class: className, children, ...restProps }: RangeCalendarPrimitive.NextButtonProps = $props();
</script>

{#snippet Fallback()}
    <ChevronRight />
{/snippet}

<RangeCalendarPrimitive.NextButton
    bind:ref
    class={cn(buttonVariants({ variant: 'outline' }), 'size-7 bg-transparent p-0 opacity-50 hover:opacity-100', className)}
    {...restProps}
    children={children || Fallback}
/>
