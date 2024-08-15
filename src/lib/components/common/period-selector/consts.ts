import { TODAY } from '$lib/consts';
import {
    CalendarDate,
    endOfMonth,
    endOfYear,
    startOfMonth,
    startOfYear
} from '@internationalized/date';
import { type PeriodWithLabel } from './types';

const [year, month] = [TODAY.year, TODAY.month];
export const periods: PeriodWithLabel[] = [
    {
        label: 'This month',
        value: {
            start: startOfMonth(TODAY),
            end: endOfMonth(TODAY)
        }
    },
    {
        label: 'Last month',
        value: {
            start: new CalendarDate(year, (month + 12 - 1) % 12, 1),
            end: endOfMonth(new CalendarDate(year, (month + 12 - 1) % 12, 1))
        }
    },
    {
        label: 'This year',
        value: {
            start: startOfYear(TODAY),
            end: endOfYear(TODAY)
        }
    },
    {
        label: 'Last year',
        value: {
            start: new CalendarDate(year - 1, 1, 1),
            end: endOfYear(new CalendarDate(year - 1, 1, 1))
        }
    },
    {
        label: 'All time',
        value: {
            start: new CalendarDate(1970, 1, 1),
            end: new CalendarDate(2100, 1, 1)
        }
    }
];

export const default_period: PeriodWithLabel = periods[0];