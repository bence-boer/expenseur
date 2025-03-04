import type { CalendarDate } from '@internationalized/date';

export type Period = {
    start: CalendarDate;
    end: CalendarDate;
};

export type PeriodWithLabel = {
    label: string;
    value: string;
    data: Period;
};
