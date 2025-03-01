import type { Session } from '$lib/service/auth.ts';
import { local_storage_cache } from '$lib/cache.ts';
import { auth } from '$lib/service/index.ts';

export type User = Session['user'];
const cached: Session | null = local_storage_cache.get('session');
let session: Session | null = $state(cached);

const valid = (session: Session): boolean => session.expires_at! > new Date().getSeconds();

export const get = (): Session | null => session;

export const set = (value: Session): void => {
    session = value;
    local_storage_cache.set('session', value);
};

const refresh = (): void => {
    if (!session) throw new Error('Session could not be refreshed, because it is not set.');

    auth.refresh_session({ refresh_token: session.refresh_token })
        .then(response => set(response.session!))
        .catch(() => clear());
};

export const clear = (): void => {
    session = null;
    local_storage_cache.clear('session');
};

type State = 'VALID' | 'EXPIRED' | 'NONE';
const state: State = $derived(session ? valid(session) ? 'VALID' : 'EXPIRED' : 'NONE');
$effect.root(() => {
    $effect(() => subscriptions.forEach(subscription => subscription(state)));
    $effect(() => {
        if (state === 'EXPIRED') refresh();
    });
    return () => { };
});

type Subscription = (value: State) => void;
const subscriptions: Subscription[] = [];
export const subscribe = (callback: Subscription): void => {
    subscriptions.push(callback);
    callback(state);
};