import { store } from '$lib/utils';
import { jwtDecode } from 'jwt-decode';

export const token = store<string>();

let role: 'admin' | 'beta' | undefined = $derived(token.value ? (jwtDecode(token.value) as any).user_role : undefined);
let _admin: boolean = $derived(role === 'admin');
let _beta: boolean = $derived(role === 'beta' || role === 'admin');

export const admin = {
    get value() {
        return _admin;
    },
};

export const beta = {
    get value() {
        return _beta;
    },
};
