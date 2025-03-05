import { TODAY } from '$lib/consts/index.ts';
import { CalendarDate, endOfMonth, endOfYear, startOfMonth, startOfYear } from '@internationalized/date';
import { type PeriodWithLabel } from './types.ts';

const [year, month] = [TODAY.year, TODAY.month];
const [year_last_month, month_last_month] = month === 1 ? [year - 1, 12] : [year, month - 1];

export const periods: PeriodWithLabel[] = [
    {
        label: 'This month',
        value: 'THIS_MONTH',
        data: {
            start: startOfMonth(TODAY),
            end: endOfMonth(TODAY),
            days: endOfMonth(TODAY).day,
        },
    },
    {
        label: 'Last month',
        value: 'LAST_MONTH',
        data: {
            start: new CalendarDate(year_last_month, month_last_month, 1),
            end: endOfMonth(new CalendarDate(year_last_month, month_last_month, 1)),
            days: endOfMonth(new CalendarDate(year_last_month, month_last_month, 1)).day,
        },
    },
    {
        label: 'This year',
        value: 'THIS_YEAR',
        data: {
            start: startOfYear(TODAY),
            end: endOfYear(TODAY),
            days: year % 4 === 0 ? 366 : 365,
        },
    },
    {
        label: 'Last year',
        value: 'LAST_YEAR',
        data: {
            start: new CalendarDate(year - 1, 1, 1),
            end: endOfYear(new CalendarDate(year - 1, 1, 1)),
            days: (year - 1) % 4 === 0 ? 366 : 365,
        },
    },
    {
        label: 'All time',
        value: 'ALL_TIME',
        data: {
            start: new CalendarDate(1970, 1, 1),
            end: new CalendarDate(2100, 1, 1),
            days: 365 * 130,
        },
    },
];

export const default_period: PeriodWithLabel = periods[0];
