export type BarDataPoint = {
    label: string;
    value: number;
    color: string;
    hidden?: boolean;
};

export type DonutDataPoint = {
    label: string;
    value: number;
    backgroundColor: string;
    hoverBackgroundColor: string;
    hidden?: boolean;
};

export type LineChartData = {
    column_labels: string[];
    lines: SingleDataSeries[];
};

export type SingleDataSeries = {
    label: string;
    color: string;
    hidden?: boolean;
    values: number[];
};
