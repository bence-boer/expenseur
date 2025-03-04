import type { Session } from '$lib/service/auth.ts';
import { local_storage_cache } from '$lib/cache.ts';
import { auth } from '$lib/service/index.ts';

export type User = Session['user'];
export type SessionState = 'VALID' | 'INVALID' | 'EXPIRED' | 'NONE';

const validity = (): SessionState => {
    if (!session) return 'NONE';

    const expiry: number | undefined = session.expires_at;
    if (!expiry) return 'INVALID';

    const now: number = new Date().getSeconds();
    return now < expiry ? 'VALID' : 'EXPIRED';
}

const refresh = (): void => {
    if (!session) throw new Error('Session could not be refreshed, because it is not set.');

    auth.refresh_session({ refresh_token: session.refresh_token })
        .then(response => set(response.session!))
        .catch(() => clear());
};

const cached: Session | null = local_storage_cache.get('session');
let session: Session | null = cached;
let state: SessionState = validity();

if (state === 'EXPIRED') refresh();

export const get = (): Session | null => session;

export const set = (value: Session): void => {
    session = value;
    local_storage_cache.set('session', value);

    notify();
};

export const clear = (): void => {
    session = null;
    local_storage_cache.clear('session');

    notify();
};

// -------------------------------------------------------------------------------------
// Subscriptions
// -------------------------------------------------------------------------------------

type Subscription = (value: SessionState) => void;
const subscriptions: Subscription[] = [];

export const subscribe = (callback: Subscription): void => {
    subscriptions.push(callback);
    callback(state);
};

export const unsubscribe = (callback: Subscription): void => {
    const index = subscriptions.indexOf(callback);
    if (index > -1) subscriptions.splice(index, 1);
};

const notify = (): void => {
    const new_state: SessionState = validity();

    if (state === new_state) return;

    state = new_state;
    subscriptions.forEach(subscription => subscription(state));
};