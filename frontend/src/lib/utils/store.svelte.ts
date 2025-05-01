import { promise } from './functions.ts';

export function store<TYPE>(initial: TYPE): { value: TYPE };
export function store<TYPE>(): { value: TYPE | undefined };
export function store<TYPE = unknown>(initial?: TYPE): { value: TYPE | undefined } {
    let value = $state<TYPE | undefined>(initial);

    return {
        get value() {
            return value;
        },
        set value(next: TYPE | undefined) {
            value = next;
        },
    };
}

type Refresh = (id?: number) => Promise<void>;
export function service_store<DATA, UPDATED_DATA, SINGLE_DATA>(options: {
    get: () => Promise<DATA[]>;
    single?: (id: number) => Promise<SINGLE_DATA>;
    create: (data: DATA) => Promise<DATA>;
    update: (id: number, data: Partial<DATA>) => Promise<UPDATED_DATA>;
    delete_: (id: number) => Promise<void>;
    refreshes?: Refresh[];
}) {
    const { get, create, update, delete_: delete_, single: single, refreshes = [] } = options;
    const { promise: initial, resolve, reject } = promise<DATA[]>();
    let data = $state<Promise<DATA[]>>(initial);
    const singles = $state<Record<number, Promise<SINGLE_DATA>>>({});

    const refresh: Refresh = async (id?: number) => {
        const save = data;
        const result = get().catch(() => save);
        if (single && id !== undefined && Object.prototype.hasOwnProperty.call(singles, id)) delete singles[id];
        data = result;
        refreshes.forEach((refresh) => refresh());
        await result;
    };

    return [{
        get data() {
            get().then(resolve).catch(reject);

            Object.defineProperty(this, 'data', {
                get: () => data,
                configurable: true,
                enumerable: true,
            });

            return data;
        },
        async single(id: number): Promise<SINGLE_DATA> {
            if (!single) throw new Error('Single data retrieval function is not defined.');
            if (Object.prototype.hasOwnProperty.call(singles, id)) return await singles[id];

            const result = single(id);
            singles[id] = result;
            return result;
        },
        async create(data: DATA): Promise<DATA> {
            const created_data = await create(data);
            refresh();
            return created_data;
        },
        async update(id: number, data: Partial<DATA>): Promise<UPDATED_DATA> {
            const updated_data = await update(id, data);
            refresh(id);
            return updated_data;
        },
        async delete(id: number): Promise<void> {
            await delete_(id);
            refresh(id);
        },
    }, refresh] as const;
}
