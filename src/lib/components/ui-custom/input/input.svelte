<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	type Format =
		| {
				formatter: Intl.NumberFormat;
				parser: (value: string) => number;
		  }
		| {
				formatter?: never;
				parser?: never;
		  };

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		formatter,
		parser,
		...restProps
	}: WithElementRef<HTMLInputAttributes> & Format = $props();

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

	// TODO: double check whether this is needed
	$effect(() => {
		if (ref)
			(ref as HTMLInputElement).value =
				(value || value === 0) && formatter ? formatter.format(value) : value ? value : '';
	});
</script>

<input
	bind:this={ref}
	class={cn(
		'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	bind:value
	oninput={input}
	type="text"
	{...restProps}
/>
