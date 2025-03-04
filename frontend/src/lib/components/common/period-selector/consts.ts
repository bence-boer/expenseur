import { TODAY } from '$lib/consts/index.ts';
import { CalendarDate, endOfMonth, endOfYear, startOfMonth, startOfYear } from '@internationalized/date';
import { type PeriodWithLabel } from './types.ts';

const [year, month] = [TODAY.year, TODAY.month];
export const periods: PeriodWithLabel[] = [
    {
        label: 'This month',
        value: 'THIS_MONTH',
        data: {
            start: startOfMonth(TODAY),
            end: endOfMonth(TODAY),
        },
    },
    {
        label: 'Last month',
        value: 'LAST_MONTH',
        data: {
            start: new CalendarDate(year, (month + 12 - 1) % 12, 1),
            end: endOfMonth(new CalendarDate(year, (month + 12 - 1) % 12, 1)),
        },
    },
    {
        label: 'This year',
        value: 'THIS_YEAR',
        data: {
            start: startOfYear(TODAY),
            end: endOfYear(TODAY),
        },
    },
    {
        label: 'Last year',
        value: 'LAST_YEAR',
        data: {
            start: new CalendarDate(year - 1, 1, 1),
            end: endOfYear(new CalendarDate(year - 1, 1, 1)),
        },
    },
    {
        label: 'All time',
        value: 'ALL_TIME',
        data: {
            start: new CalendarDate(1970, 1, 1),
            end: new CalendarDate(2100, 1, 1),
        },
    },
];

export const default_period: PeriodWithLabel = periods[0];
