import { apiFetch } from './appClient';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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

function toDemoAccessToken(accountId?: string) {
  const normalized = accountId?.trim() || 'demo-user';
  return `demo-token-${normalized}`;
}

/**
 * POST /auth/signin
 */
export async function signIn(req: SignInReq): Promise<SignInRes> {
  if (DEMO_MODE) {
    return { accessToken: toDemoAccessToken(req.accountId) };
  }
  return apiFetch<SignInRes>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * POST /auth/signout
 */
export async function signOut(): Promise<void> {
  if (DEMO_MODE) return;
  await apiFetch('/auth/signout', {
    method: 'POST',
  });
}
