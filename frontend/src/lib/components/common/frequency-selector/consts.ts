import { type FrequencyWithLabel } from './types.ts';

export const frequencies = [
    {
        label: 'Weekly',
        key: 'WEEKLY',
        value: {
            days: 7,
        },
    },
    {
        label: 'Monthly',
        key: 'MONTHLY',
        value: {
            days: 30,
        },
    },
    {
        label: 'Yearly',
        key: 'YEARLY',
        value: {
            days: 365,
        },
    },
] as const satisfies FrequencyWithLabel[];

export const default_frequency: FrequencyWithLabel = {
    label: 'None',
    key: 'NONE',
    value: {
        days: 0,
    },
};
