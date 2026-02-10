export async function downloadFile(url: string, filename?: string) {
  if (typeof window === 'undefined') return;
  const token = window.localStorage.getItem('accessToken');
  const performDownload = async (response: Response) => {
    if (!response.ok) {
      throw new Error(`download failed: ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = filename ?? 'attachment';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    await performDownload(res);
    return;
  } catch {
    // Fallback: use same-origin proxy to avoid CORS issues.
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ url, filename }),
    });
    await performDownload(res);
  }
}
