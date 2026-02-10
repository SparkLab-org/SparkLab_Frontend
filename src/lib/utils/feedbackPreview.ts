const STORAGE_KEY = 'feedbackPreview';

type PreviewStore = Record<string, string>;

function readStore(): PreviewStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PreviewStore;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeStore(store: PreviewStore) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore storage errors
  }
}

export function storeFeedbackPreview(id: string, preview: string | null | undefined) {
  if (typeof window === 'undefined') return;
  const trimmed = preview?.trim();
  if (!trimmed) return;
  const store = readStore();
  store[id] = trimmed;
  writeStore(store);
}

export function readFeedbackPreview(id: string): string | null {
  if (typeof window === 'undefined') return null;
  const store = readStore();
  const value = store[id];
  return value && value.trim().length > 0 ? value : null;
}
