import type { ServiceCache } from "./types";

export const session_storage_cache: ServiceCache = {
    name: 'Session Storage Cache',

    get: <Data>(key: string): Data | null => {
        const data = sessionStorage.getItem(key);
        if (!data) return null;
        return JSON.parse(data) as Data;
    },

    set: (key: string, data: unknown): void => {
        sessionStorage.setItem(key, JSON.stringify(data));
    },

    clear: (key?: string): void => {
        if (key) sessionStorage.removeItem(key);
        else sessionStorage.clear();
    }
};

export const local_storage_cache: ServiceCache = {
    name: 'Local Storage Cache',

    get: <Data>(key: string): Data | null => {
        const data = localStorage.getItem(key);
        if (!data) return null;
        return JSON.parse(data) as Data;
    },

    set: (key: string, data: unknown): void => {
        localStorage.setItem(key, JSON.stringify(data));
    },

    clear: (key?: string): void => {
        if (key) localStorage.removeItem(key);
        else localStorage.clear();
    }
};

const storage: Map<string, unknown> = new Map();
export const memory_cache: ServiceCache = {
    name: 'In-Memory Storage Cache',

    get: <Data>(key: string): Data | null => {
        if (!storage.has(key)) return null;
        return storage.get(key) as Data;
    },

    set: (key: string, data: unknown): void => {
        storage.set(key, data);
    },

    clear: (key?: string): void => {
        if (key) storage.delete(key);
        else storage.clear();
    }
};