<script lang="ts">
	import type { FormEventHandler, HTMLInputAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { tick } from 'svelte';

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
		ref = $bindable(),
		value = $bindable(),
		class: className,
		formatter,
		parser,
		...restProps
	}: WithElementRef<HTMLInputAttributes> & Format = $props();

	$effect.pre(() => {
		if (ref)
			(ref as HTMLInputElement).value =
				(value || value === 0) && formatter ? formatter.format(value) : value ? value : '';
	});

	const input: FormEventHandler<HTMLInputElement> = ((event: InputEvent) => {
		const target = event.target as HTMLInputElement;
		const string_value = target.value;

		if (!parser || !formatter) {
			value = string_value;
			return;
		}

		const last_character_decimal = /(^[^.,]*[.,]$)|(^[^.,]*\d[.,]$)/.test(string_value);
		if (last_character_decimal) {
			const string_without_decimal = formatter.format(parser(string_value));
			target.value =
				event.inputType === 'deleteContentBackward'
					? string_without_decimal
					: string_without_decimal.replace(/(.*\d)(\D*)$/, '$1,$2');

			return;
		}
		let _value;

		if (event.inputType === 'deleteContentBackward') {
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
		tick().then(() => (target.value = formatter.format(parser(_value))));

		if (Number.isNaN(value) || Number.isNaN(target.value)) {
			target.value = '';
		}
	}) as any;
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
