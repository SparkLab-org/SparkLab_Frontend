import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { url?: string; filename?: string };
    const url = body?.url;
    if (!url || typeof url !== 'string') {
      return new Response('Invalid url', { status: 400 });
    }

    const auth = req.headers.get('authorization') ?? undefined;
    const upstream = await fetch(url, {
      headers: auth ? { Authorization: auth } : undefined,
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return new Response(text || 'Upstream download failed', {
        status: upstream.status,
      });
    }

    const contentType =
      upstream.headers.get('content-type') ?? 'application/octet-stream';
    const buffer = await upstream.arrayBuffer();
    const safeName =
      body?.filename && body.filename.trim().length > 0
        ? body.filename.replace(/[^\w.\-]/g, '_')
        : 'attachment';

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeName}"`,
      },
    });
  } catch {
    return new Response('Download failed', { status: 500 });
  }
}
