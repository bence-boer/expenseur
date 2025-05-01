import { type PeriodWithLabel } from '$lib/components/common/period-selector/types.ts';
import { TODAY } from '$lib/consts/index.ts';
import { CalendarDate, endOfMonth, endOfYear, startOfMonth, startOfYear } from '@internationalized/date';

const [year, month] = [TODAY.year, TODAY.month];
const [year_last_month, month_last_month] = month === 1 ? [year - 1, 12] : [year, month - 1];

export const periods = [
    {
        label: 'This month',
        key: 'THIS_MONTH',
        value: {
            previous_start: startOfMonth(startOfMonth(TODAY).subtract({ days: 1 })),
            previous_end: startOfMonth(TODAY).subtract({ days: 1 }),
            start: startOfMonth(TODAY),
            end: endOfMonth(TODAY),
            days: endOfMonth(TODAY).day,
        },
    },
    {
        label: 'Last month',
        key: 'LAST_MONTH',
        value: {
            previous_start: startOfMonth(new CalendarDate(year_last_month, month_last_month, 1).subtract({ days: 1 })),
            previous_end: new CalendarDate(year_last_month, month_last_month, 1).subtract({ days: 1 }),
            start: new CalendarDate(year_last_month, month_last_month, 1),
            end: endOfMonth(new CalendarDate(year_last_month, month_last_month, 1)),
            days: endOfMonth(new CalendarDate(year_last_month, month_last_month, 1)).day,
        },
    },
    {
        label: 'This year',
        key: 'THIS_YEAR',
        value: {
            previous_start: startOfYear(startOfYear(TODAY).subtract({ days: 1 })),
            previous_end: startOfYear(TODAY).subtract({ days: 1 }),
            start: startOfYear(TODAY),
            end: endOfYear(TODAY),
            days: year % 4 === 0 ? 366 : 365,
        },
    },
    {
        label: 'Last year',
        key: 'LAST_YEAR',
        value: {
            previous_start: startOfYear(new CalendarDate(year - 1, 1, 1).subtract({ days: 1 })),
            previous_end: new CalendarDate(year - 1, 1, 1).subtract({ days: 1 }),
            start: new CalendarDate(year - 1, 1, 1),
            end: endOfYear(new CalendarDate(year - 1, 1, 1)),
            days: (year - 1) % 4 === 0 ? 366 : 365,
        },
    },
    {
        label: 'All time',
        key: 'ALL_TIME',
        value: {
            previous_start: new CalendarDate(1970, 1, 1),
            previous_end: new CalendarDate(1970, 1, 1),
            start: new CalendarDate(1970, 1, 1),
            end: new CalendarDate(2100, 1, 1),
            days: 365 * 130,
        },
    },
] as const satisfies PeriodWithLabel[];

export const default_period: typeof periods[number] = periods[0];
