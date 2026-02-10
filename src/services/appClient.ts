/**
 * apiClient.ts
 * 
 * - 모든 API 요청의 공통 진입점
 * - Authorization 헤더 자동 첨부
 * - 401 응답 시 토큰 삭제 및 로그인 처리
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

let authMeInFlight: Promise<void> | null = null;

async function hydrateAccountIdentity(token: string) {
  if (typeof window === 'undefined') return;
  const stored = window.localStorage.getItem('accountId');
  if (stored && stored.trim().length > 0) return;
  if (authMeInFlight) return authMeInFlight;

  authMeInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const me = (await res.json()) as {
        accountId?: string;
        roles?: string[];
        mentorId?: number;
        menteeId?: number;
        plannerId?: number;
      };
      if (typeof me.accountId === 'string') {
        window.localStorage.setItem('accountId', me.accountId);
      }
      if (typeof me.mentorId === 'number') {
        window.localStorage.setItem('mentorId', String(me.mentorId));
      }
      if (typeof me.menteeId === 'number') {
        window.localStorage.setItem('menteeId', String(me.menteeId));
      }
      if (typeof me.plannerId === 'number') {
        window.localStorage.setItem('plannerId', String(me.plannerId));
        if (typeof me.accountId === 'string') {
          window.localStorage.setItem(`plannerId:${me.accountId}`, String(me.plannerId));
        }
      }
      if (Array.isArray(me.roles) && me.roles[0]) {
        window.localStorage.setItem('role', String(me.roles[0]).toUpperCase());
      }
    } catch {
      // ignore hydration errors
    } finally {
      authMeInFlight = null;
    }
  })();

  return authMeInFlight;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const shouldHydrate =
    typeof window !== 'undefined' &&
    token &&
    !path.startsWith('/auth/signin') &&
    !path.startsWith('/auth/me');
  if (shouldHydrate) {
    await hydrateAccountIdentity(token);
  }
  const accountId =
    typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const isAuthPath = path.startsWith('/auth/');

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(accountId && !isAuthPath && { 'X-Account-Id': accountId }),
      ...(options.headers || {}),
    },
  });

  console.log('API_BASE_URL', API_BASE_URL, 'path', path);

  // 🔥 401 공통 처리
  if (res.status === 401) {
    localStorage.removeItem('accessToken');
    if (typeof window !== 'undefined') {
      window.alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
    }
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    let details = '';
    try {
      const data = (await res.json()) as { message?: string };
      if (data && typeof data === 'object') {
        details = data.message ? data.message : JSON.stringify(data);
      }
    } catch {
      try {
        details = await res.text();
      } catch {
        details = '';
      }
    }
    const error = new Error(
      `API Error: ${res.status}${details ? ` - ${details}` : ''}`
    ) as Error & { status?: number; details?: string };
    error.status = res.status;
    error.details = details;
    throw error;
  }

  return res.json() as Promise<T>;
}
