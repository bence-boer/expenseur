export type LabelValue<Value extends string | number = string | number> = { label: string; value: Value };

export type Route = {
    name: string;
    path: string;
}

export type ServiceCache = {
    name: string;
    get: <Data>(key: string) => Data | null;
    set: (key: string, data: unknown) => void;
    clear: (key?: string) => void;
}