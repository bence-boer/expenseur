import { DateFormatter } from "@internationalized/date";

export const currency_formatter = new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0,
    useGrouping: true
});

export const currency_parser = (value: string) => {
    return parseInt(value.replace(/\D/g, ''));
};

export const date_formatter = new DateFormatter('hu-HU');

export const number_formatter = new Intl.NumberFormat('hu-HU', {
    style: 'decimal',
    maximumFractionDigits: 0,
    useGrouping: true
});

export const number_parser = (value: string) => {
    return parseInt(value.replace(/\D/g, ''));
};
