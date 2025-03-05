import { currency_formatter, date_formatter } from '$lib/consts/index.ts';
import type { LabelValue } from '$lib/types.ts';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const label_value_transform = <VALUE extends number | string>(data: { id: VALUE; name: string }): LabelValue<VALUE> => ({
    label: data.name,
    value: data.id,
});

export const sanitize_string = (string?: string | null): string | null => {
    if (!string) return null;

    string = string.replaceAll(/\s+/g, ' ').trim();
    return string === '' ? null : string;
};

export const format_date = (date: Date | string): string => {
    if (typeof date === 'string') date = new Date(date);
    return date_formatter.format(date);
};

export const format_currency = (amount: number | string): string => {
    if (typeof amount === 'string') amount = Number.parseInt(amount);
    return currency_formatter.format(amount);
};
