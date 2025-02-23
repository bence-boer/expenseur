import { PUBLIC_API_URL } from '$env/static/public';
import type { API } from '@expenseur/backend';
import { hc } from 'hono/client';

// Redeclaration of the client allows for pre-compiling types
const client = hc<API>(PUBLIC_API_URL)
export type Client = typeof client;
export const get_client = (): Client => hc<API>(PUBLIC_API_URL);