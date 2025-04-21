import { client } from '$lib/service/utils.ts';
import { LoginResponse, RegisterResponse } from '$lib/service/types.ts';

export const session = () => client.api.auth.session.$post();
export const refresh_session = (refresh_token: string) => client.api.auth['refresh-session'].$post({ json: { refresh_token } });
export const login = (email: string, password: string) => client.api.auth.login.$post({ json: { email, password } }).then(schedule_refresh);
export const logout = () => client.api.auth.logout.$post();
export const register = (email: string, password: string) => client.api.auth.register.$post({ json: { email, password } }).then(schedule_refresh);

const schedule_refresh = <RESPONSE extends LoginResponse | RegisterResponse>(response: RESPONSE) => {
    setTimeout(() => refresh_session(response.session!.refresh_token), 1000 * response.session!.expires_in - 60000);
    return response;
};
