import { client } from '$lib/service/utils.ts';

export const session = () => client.api.auth.session.$post();
export const refresh_session = (refresh_token: string) => client.api.auth['refresh-session'].$post({ json: { refresh_token } });
export const login = (email: string, password: string) => client.api.auth.login.$post({ json: { email, password } });
export const logout = () => client.api.auth.logout.$post();
export const register = (email: string, password: string) => client.api.auth.register.$post({ json: { email, password } });
