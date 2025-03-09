import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date';

export const TODAY = today(getLocalTimeZone());

export const currency_formatter = new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0,
    useGrouping: true,
});

export const currency_formatter_short = new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    notation: 'compact',
    maximumFractionDigits: 2,
});

export const currency_parser = (value: string) => {
    return parseInt(value.replace(/\D/g, ''));
};

export const date_formatter = new DateFormatter('hu-HU');

export const number_formatter = new Intl.NumberFormat('hu-HU', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
    useGrouping: true,
});

export const number_parser = (value: string): number => {
    return parseFloat(
        value
            .replace(/[^\d,.]/g, '') // remove non-numeric characters, except comma and dot
            .replace(',', '.') // replace comma with dot
            .replace(/(\.\d{3})\d$/, '$1'), // remove digits after the third decimal place
    );
};
