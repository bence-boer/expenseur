<script lang="ts">
    import { cn } from '$lib/utils.js';
    import type { WithElementRef } from 'bits-ui';
    import type { HTMLAnchorAttributes } from 'svelte/elements';
    import { badgeVariants, type BadgeVariant } from '.';

    let {
        ref = $bindable(null),
        href,
        class: className,
        variant = 'default',
        children,
        ...restProps
    }: WithElementRef<HTMLAnchorAttributes> & {
        variant?: BadgeVariant;
    } = $props();
</script>

<svelte:element this={href ? 'a' : 'span'} bind:this={ref} {href} class={cn(badgeVariants({ variant }), className)} {...restProps}>
    {@render children?.()}
</svelte:element>
