import { currency_formatter, currency_formatter_short, date_formatter } from '$lib/consts/index.ts';
import type { LabelValue } from '$lib/types.ts';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CalendarDate } from '@internationalized/date';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const promise = <T = unknown>() => {
    let resolver: (value: T) => void;
    let rejecter: (error: Error) => void;
    const promise = new Promise<T>((resolve, reject) => {
        resolver = resolve;
        rejecter = reject;
    });

    return { promise, resolve: resolver!, reject: rejecter! };
};

export const label_value_transform = <VALUE extends number | string>(data: { id: VALUE; name: string }): LabelValue<VALUE> => ({
    label: data.name,
    value: data.id,
});

export const sanitize_string = (string?: string | null): string | null => {
    if (!string) return null;

    string = string.replaceAll(/\s+/g, ' ').trim();
    return string === '' ? null : string;
};

export const format_number = (number: number | string): string => {
    if (typeof number === 'string') number = Number.parseInt(number);
    return number.toLocaleString('hu-HU', { useGrouping: true });
};

export const format_date = (date: Date | string): string => {
    if (typeof date === 'string') date = new Date(date);
    return date_formatter.format(date);
};

export const format_currency = (amount: number | string): string => {
    if (typeof amount === 'string') amount = Number.parseInt(amount);
    return currency_formatter.format(amount);
};

export const format_currency_short = (amount: number | string): string => {
    if (typeof amount === 'string') amount = Number.parseInt(amount);
    return currency_formatter_short.format(amount);
};

export const day_difference = (a: CalendarDate, b: CalendarDate): number =>
    Math.ceil(Math.abs(new Date(a.toString()).getTime() - new Date(b.toString()).getTime()) / (1000 * 60 * 60 * 24));
