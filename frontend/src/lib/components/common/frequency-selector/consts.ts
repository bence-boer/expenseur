import { type Frequency } from './types.ts';

export const frequencies = [
    {
        label: 'Daily',
        key: 'DAILY',
        value: 1,
    },
    {
        label: 'Weekly',
        key: 'WEEKLY',
        value: 7,
    },
    {
        label: 'Monthly',
        key: 'MONTHLY',
        value: 30,
    },
    {
        label: 'Yearly',
        key: 'YEARLY',
        value: 365,
    },
] as const satisfies Frequency[];
