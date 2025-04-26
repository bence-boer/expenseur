<script lang="ts">
    import { Input } from '$lib/components/ui-custom/input';
    import { cn } from '$lib/utils';

    type Props = {
        value?: string | undefined;
        show_text_input?: boolean;
        disabled?: boolean;
        class?: string;
        id?: string;
    };

    let { value = $bindable(), show_text_input = true, disabled = false, class: class_name, id = undefined }: Props = $props();

    const COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
    const DEFAULT_COLOR = '#ffffff';

    const is_valid_hex = (color: string | undefined): color is string => !!color && COLOR_REGEX.test(color);
    const get_canonical_color = () => (is_valid_hex(value) ? value : DEFAULT_COLOR);

    let text_input_value = $state(get_canonical_color());

    $effect(() => {
        const canonical_color = get_canonical_color();
        if (text_input_value !== canonical_color) text_input_value = canonical_color;
    });

    function set_text_value(v: string) {
        const lowercase_value = v.toLowerCase();
        text_input_value = lowercase_value;

        if (is_valid_hex(lowercase_value)) value = lowercase_value;
    }

    function set_color_input_value(new_value: string | undefined) {
        const lowercase_value = new_value?.toLowerCase();
        if (is_valid_hex(lowercase_value)) value = lowercase_value;
        else if (lowercase_value === undefined || lowercase_value === '') value = undefined;
    }
</script>

<div class={cn('flex flex-row items-center gap-2', class_name)}>
    {#if show_text_input}
        <Input {id} bind:value={() => text_input_value, set_text_value} {disabled} class="flex-1" aria-label="Color Hex Code" />
    {/if}
    <input
        type="color"
        bind:value={get_canonical_color, set_color_input_value}
        {disabled}
        class={cn(
            'h-8 w-8 appearance-none border-none bg-transparent p-0 disabled:opacity-50 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border',
            !show_text_input && id ? 'color-picker-only' : ''
        )}
        aria-label="Color Picker"
        aria-controls={show_text_input && id ? id : undefined}
    />
</div>
