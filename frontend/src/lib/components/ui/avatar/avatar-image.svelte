<script lang="ts">
	import { Avatar as AvatarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";

	let {
		class: className,
		src,
		alt,
		ref = $bindable(null),
		...restProps
	}: AvatarPrimitive.ImageProps = $props();
</script>

<AvatarPrimitive.Image
	bind:ref
	{src}
	{alt}
	class={cn("aspect-square h-full w-full", className)}
	{...restProps}
/>
