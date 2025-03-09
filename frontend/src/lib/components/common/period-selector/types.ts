import type { CalendarDate } from '@internationalized/date';

export type Period = {
    previous_start: CalendarDate;
    previous_end: CalendarDate;
    start: CalendarDate;
    end: CalendarDate;
    days: number;
};

export type PeriodWithLabel = {
    key: string;
    value: Period;
    label: string;
};
