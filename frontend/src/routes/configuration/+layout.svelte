<script lang="ts">
    import { goto } from '$app/navigation';
    import * as Tabs from '$lib/components/ui/tabs';
    import { store } from '$lib/store';

    interface Props {
        children?: import('svelte').Snippet;
    }

    const tabs = [
        { value: 'items', label: 'Items' },
        { value: 'categories', label: 'Categories' },
        { value: 'brands', label: 'Brands' },
        { value: 'vendors', label: 'Vendors' },
        { value: 'tags', label: 'Tags' },
        { value: 'units', label: 'Units' }
    ] as const satisfies { value: string; label: string }[];
    if (!store.flags.pages.config.units_page.value) tabs.pop();

    let tab: (typeof tabs)[number]['value'] = $state(tabs[0].value);
    $effect(() => {
        goto(`/configuration/${tab}`);
    });

    let { children }: Props = $props();
</script>

<h1 class="text-2xl font-bold sm:text-4xl">Configuration</h1>

<Tabs.Root bind:value={tab} class="w-full max-w-[600px]">
    <Tabs.List class="flex justify-stretch items-stretch">
        {#each tabs as { value, label }}
            <Tabs.Trigger {value} class="flex-grow px-1">{label}</Tabs.Trigger>
        {/each}
    </Tabs.List>
</Tabs.Root>

{@render children?.()}
