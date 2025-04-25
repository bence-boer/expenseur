export type Frequency = {
    days: number;
};

export type FrequencyWithLabel = {
    key: string;
    value: Frequency;
    label: string;
};
