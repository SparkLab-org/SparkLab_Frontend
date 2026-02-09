import { apiFetch } from './appClient';

/**
 * 백엔드 type.ts와 1:1로 맞춘 타입
 */
export interface SignInReq {
  accountId: string;
  password: string;
}

export interface SignInRes {
  accessToken: string;
}

/**
 * POST /auth/signin
 */
export async function signIn(req: SignInReq): Promise<SignInRes> {
  return apiFetch<SignInRes>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * POST /auth/signout
 */
export async function signOut(): Promise<void> {
  await apiFetch('/auth/signout', {
    method: 'POST',
  });
}
