import { apiFetch } from './appClient';

/**
 * 백엔드 type.ts와 1:1로 맞춘 타입
 */
export interface SignInReq {
  loginId: string;
  loginPw: string;
}

export interface SignInRes {
  accessToken?: string;
  token?: string;
}

/**
 * POST /auth/login
 */
export async function signIn(req: SignInReq): Promise<SignInRes> {
  return apiFetch<SignInRes>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}
