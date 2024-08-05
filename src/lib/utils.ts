import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import type { LabelValue } from "./types";
import type Color from "colorjs.io";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export const label_value_transform = (data: { id: number; name: string }): LabelValue => ({
	label: data.name,
	value: data.id
});

export const sanitize_string = (string?: string | null): string | null => {
	if (!string) return null;

	string = string.replaceAll(/\s+/g, ' ').trim();
	return string === '' ? null : string;
}

export const color_triangle = (
	color_a: Color,
	color_b: Color,
	color_c: Color,
	steps: number
): Color[] => {
	const arr_a_b = color_a.steps(color_b, {
		space: 'lch',
		outputSpace: 'srgb',
		steps: Math.ceil(steps / 3) + 1
	});
	arr_a_b.pop();

	const arr_b_c = color_b.steps(color_c, {
		space: 'lch',
		outputSpace: 'srgb',
		steps: Math.ceil(steps / 3) + 1
	});
	arr_b_c.pop();

	const arr_c_a = color_c.steps(color_a, {
		space: 'lch',
		outputSpace: 'srgb',
		steps: Math.ceil(steps / 3) + 1
	});
	arr_c_a.pop();

	return [...arr_a_b, ...arr_b_c, ...arr_c_a];
}