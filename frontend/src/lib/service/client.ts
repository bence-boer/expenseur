import { PUBLIC_API_URL } from '$env/static/public';
import { clear_with_persist, memory_cache } from '$lib/cache.ts';
import type { LocalCache } from '$lib/types.ts';
import type { API } from '@expenseur/backend';
import { type ClientResponse, hc } from 'hono/client';
import type { HcOptions } from 'hono/client/types';
import { toast } from 'svelte-sonner';

const API_URL: string = PUBLIC_API_URL;

const cache: LocalCache<string> = memory_cache as LocalCache<string>;

type UnwrapClientResponse<T> = T extends (...args: infer A) => Promise<ClientResponse<infer U>>
    ? (input?: A[0], options?: HcOptions) => Promise<U extends null ? void : U>
    : T extends object ? { [K in keyof T]: UnwrapClientResponse<T[K]> }
    : T;

type Service<Client extends object> = {
    [K in keyof Client]: UnwrapClientResponse<Client[K]>;
};

export const generate_cache_key = (path: RequestInfo | URL, input?: unknown): string => {
    try {
        const input_key: string = input ? JSON.stringify(input) : 'no-input';
        return `${path}:${input_key}`;
    } catch (e: unknown) {
        console.error('[proxy_cache] Error generating cache key:', e);
        return `${path}:[stringify-error]-${Date.now()}`;
    }
};

const exctract_response_data = <Data = unknown>(response: Response): Promise<Data> => {
    if (!response.ok) {
        return response.text()
            .catch(() => {
                toast.error('An error occurred while processing the response.');
                console.error('Error reading response text:', response);
                return Promise.reject('An error occurred while processing the response.');
            })
            .then((message: string) => {
                toast.error(message);
                console.error('Error response:', response, message);
                return Promise.reject(message);
            });
    }

    const contentless: boolean = [101, 204, 205, 304].includes(response.status);
    if (contentless) return Promise.resolve() as Promise<Data>;

    const content_type = response.headers.get('content-type');
    if (content_type?.includes('application/json')) return response.json();
    else return response.text() as Promise<Data>;
};

const custom_fetch = (endpoint: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (init?.method !== 'GET') {
        return fetch(endpoint, init)
            .catch((error) => {
                toast.error('Error processing request.');
                console.error('Error while trying to fetch:', error);
                return Promise.reject(error);
            })
            .then((response) => {
                const data = exctract_response_data(response);
                clear_with_persist(cache, ['update-session-callback']);
                return data;
            }) as unknown as Promise<Response>;
    }

    const cache_key: string = generate_cache_key(endpoint, init?.body);
    const cached_data: unknown | undefined = cache.get<unknown>(cache_key);
    if (cached_data ?? false) return Promise.resolve(cached_data) as unknown as Promise<Response>;
    else {
        return fetch(endpoint, init).then((response) => exctract_response_data(response)).then((data) => {
            cache.set(cache_key, data);
            return data;
        }) as unknown as Promise<Response>;
    }
};

// Redeclaration of the client allows for pre-compiling types
const client = hc<API>(API_URL);
export type Client = Service<typeof client>;
export const get_client = (): Client =>
    hc<API>(API_URL, {
        init: { credentials: 'include' },
        fetch: custom_fetch,
    }) as unknown as Client;
