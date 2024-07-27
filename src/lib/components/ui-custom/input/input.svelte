<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { InputEvents } from './index.js';
	import { cn } from '$lib/utils.js';

	type $$Props = HTMLInputAttributes & {
		formatter?: Intl.NumberFormat;
		parser?: (value: string) => number;
	};
	type $$Events = InputEvents;

	let className: $$Props['class'] = undefined;
	export let value: $$Props['value'] = undefined;
	export { className as class };

	let node: HTMLInputElement;
	$: if (node && value) node.value = formatter ? formatter.format(value) : value;

	const input = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const string_value = target.value;

		if (!parser || !formatter) {
			value = string_value;
			return;
		}

		const last_character_decimal = /(^[^.,]*[.,]$)|(^[^.,]*\d[.,]$)/.test(string_value);
		if (last_character_decimal) {
			let string_without_decimal = formatter.format(parser(string_value));
			target.value = string_without_decimal.replace(/(.*\d)(\D*)$/, '$1,$2');
			return;
		}
		let _value;

		if ((event as InputEvent).inputType === 'deleteContentBackward') {
			const value2 = String(parser(target.value));
			if (value2 === '') {
				value = undefined;
				return;
			}

			_value = value2.slice(
				0,
				isNaN(parseInt(target.value.charAt(target.value.length - 1))) ? -1 : value2.length
			);

			if (_value === '') {
				value = undefined;
				target.value = '';
				return;
			}
		} else {
			_value = target.value;
		}

		value = parser(_value);

		target.value = formatter.format(value);

		if (target.value === 'NaN') {
			target.value = '';
		}
	};

	// Workaround for https://github.com/sveltejs/svelte/issues/9305
	// Fixed in Svelte 5, but not backported to 4.x.
	export let readonly: $$Props['readonly'] = undefined;
	export let formatter: $$Props['formatter'] = undefined;
	export let parser: $$Props['parser'] = undefined;
</script>

<input
	class={cn(
		'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{readonly}
	on:blur
	on:change
	on:click
	on:focus
	on:focusin
	on:focusout
	on:keydown
	on:keypress
	on:keyup
	on:mouseover
	on:mouseenter
	on:mouseleave
	on:mousemove
	on:paste
	on:input={input}
	on:wheel|passive
	{...$$restProps}
	type={formatter ? 'text' : $$restProps.type}
	bind:this={node}
/>
