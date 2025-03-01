import type { InferRequestType, InferResponseType } from 'hono/client';
import { client, extract_data } from '$lib/service/utils.ts';
import { session } from '$lib/service/index.ts';

/* SERVICE FUNCTIONS */
//-------------------------------------------------------------------------------------

const $refresh_session = client.api.auth['refresh-session'].$post;
export type RefreshSessionResponse = InferResponseType<typeof $refresh_session>;
export type RefreshSessionPayload = InferRequestType<typeof $refresh_session>;

export const refresh_session =
    (payload: RefreshSessionPayload): Promise<RefreshSessionResponse> =>
        $refresh_session({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------

const $login = client.api.auth.login.$post;
export type LoginPayload = InferRequestType<typeof $login>;
export type LoginResponse = InferResponseType<typeof $login>;
export type Session = LoginResponse['session'];

export const login =
    (payload: LoginPayload) =>
        $login({ json: payload }).then(extract_data)
            .then(response => session.set(response.session));

//-------------------------------------------------------------------------------------

const $logout = client.api.auth.logout.$post;

export const logout =
    (): Promise<void> =>
        $logout().then(extract_data)
            .then(() => session.clear());

//-------------------------------------------------------------------------------------

const $register = client.api.auth.register.$post;
export type RegisterResponse = InferResponseType<typeof $register>;
export type RegisterPayload = InferRequestType<typeof $register>;

export const register =
    (payload: RegisterPayload): Promise<RegisterResponse> =>
        $register({ json: payload }).then(extract_data);

//-------------------------------------------------------------------------------------