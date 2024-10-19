export type DonutDataPoint = {
    label: string;
    value: number;
    backgroundColor: string;
    hoverBackgroundColor: string;
};

export type LineChartData = {
    column_labels: string[];
    lines: SingleDataSeries[];
};

export type SingleDataSeries = {
    label: string;
    color: string;
    values: number[];
};
