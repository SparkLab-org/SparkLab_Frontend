/**
 * apiClient.ts
 * 
 * - 모든 API 요청의 공통 진입점
 * - Authorization 헤더 자동 첨부
 * - 401 응답 시 토큰 삭제 및 로그인 처리
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
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
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
