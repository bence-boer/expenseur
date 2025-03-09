export type LabelValue<Value extends string | number = string | number> = { label: string; value: Value };

export type Route = {
    name: string;
    path: string;
};

export type LocalCache<KEY extends string> = {
    name: string;
    get: <Data>(key: KEY) => Data | null;
    set: (key: KEY, data: unknown) => void;
    clear: (key?: KEY) => void;
};
