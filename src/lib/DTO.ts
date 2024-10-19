export type SpendingsInInterval = {
    dates: string[];
    data: {
        category: string;
        color: string;
        values: number[];
    }[];
};