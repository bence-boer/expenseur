import { type Client, get_client } from "$lib/service/client.ts";
import type { ClientResponse } from 'hono/client';

export const client: Client = get_client();

export const extract_data = <Data>(response: ClientResponse<Data>): Promise<Data> =>
    response.ok
        ? response.json() as Promise<Data>
        : Promise.reject(new Error(response.statusText));