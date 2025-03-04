import { type Client, get_client } from '$lib/service/client.ts';
import type { ClientResponse } from 'hono/client';
import { ZodError } from 'zod';

type ErrorResponse = { success: false; error: ZodError } | { error: string };
type ValidResponse<Data> = Data | unknown | never;

export const client: Client = get_client();

export const extract_data = async <Data>(response: ClientResponse<Data>): Promise<Data> => {
    if (!response.ok) return Promise.reject((await response.json() as ErrorResponse).error);

    const contentless: boolean = [101, 204, 205, 304].includes(response.status);
    if (contentless) return Promise.resolve() as Promise<Data>;

    return response.json() as Promise<Data>;
};
