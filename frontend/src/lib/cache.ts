import type { LocalCache } from '$lib/types.ts';

type SessionStorageCacheKey = 'login-redirect';
export const session_storage_cache: LocalCache<SessionStorageCacheKey> = {
    name: 'session-storage-cache',

    get: <Data>(key: SessionStorageCacheKey): Data | null => {
        const data = sessionStorage.getItem(key);
        if (!data) return null;
        return JSON.parse(data) as Data;
    },

    set: (key: SessionStorageCacheKey, data: unknown): void => {
        sessionStorage.setItem(key, JSON.stringify(data));
    },

    clear: (key?: SessionStorageCacheKey): void => {
        if (key) sessionStorage.removeItem(key);
        else sessionStorage.clear();
    },
};

type LocalStorageCacheKey = never;
export const local_storage_cache: LocalCache<LocalStorageCacheKey> = {
    name: 'local-storage-cache',

    get: <Data>(key: LocalStorageCacheKey): Data | null => {
        const data = localStorage.getItem(key);
        if (!data) return null;
        return JSON.parse(data) as Data;
    },

    set: (key: LocalStorageCacheKey, data: unknown): void => {
        localStorage.setItem(key, JSON.stringify(data));
    },

    clear: (key?: LocalStorageCacheKey): void => {
        if (key) localStorage.removeItem(key);
        else localStorage.clear();
    },
};

type MemoryCacheKey =
    | 'update-session-callback'
    | 'update-avatar-callback';
const storage: Map<MemoryCacheKey, unknown> = new Map<MemoryCacheKey, unknown>();
export const memory_cache: LocalCache<MemoryCacheKey> = {
    name: 'in-memory-cache',

    get: <Data>(key: MemoryCacheKey): Data | null => {
        if (!storage.has(key)) return null;
        return storage.get(key) as Data;
    },

    set: (key: MemoryCacheKey, data: unknown): void => {
        storage.set(key, data);
    },

    clear: (key?: MemoryCacheKey): void => {
        if (key) storage.delete(key);
        else storage.clear();
    },
};

export const clear_with_persist = <KEY extends string>(cache: LocalCache<KEY>, persist: KEY[]): void => {
    const persistence: Map<KEY, unknown> = new Map<KEY, unknown>(persist.map((key) => [key, cache.get(key)]));
    cache.clear();
    persistence.forEach((value, key) => {
        if (value ?? false) cache.set(key, value);
    });
};
