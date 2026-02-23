/**
 * Cloudflare Worker: reverse proxy so that
 *   www.garbereder.com/start-at-05/
 * is served at
 *   start-at-05.com and www.start-at-05.com
 *
 * Redirects from the origin are followed server-side so the client never sees a redirect to the origin domain.
 */

const ORIGIN = 'https://www.garbereder.com';
const ORIGIN_HOST = 'www.garbereder.com';
const ORIGIN_PREFIX = '/start-at-05';
const MAX_REDIRECTS = 10;

export interface Env {}

function originPath(url: URL): string {
  const pathname = url.pathname;
  // Site-wide assets (Astro build, images, etc.) live at origin root
  if (
    pathname.startsWith('/_astro/') ||
    pathname.startsWith('/img/') ||
    pathname === '/favicon.ico' ||
    pathname === '/apple-touch-icon.png' ||
    pathname === '/site.webmanifest' ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/android-') ||
    pathname.startsWith('/mstile-')
  ) {
    return pathname + url.search;
  }
  // Everything else is under /start-at-05 on the origin
  const subPath = pathname === '/' ? '' : pathname;
  return ORIGIN_PREFIX + subPath + url.search;
}

function isRedirect(status: number): boolean {
  return (status >= 301 && status <= 303) || status === 307 || status === 308;
}

function mustPreserveMethodAndBody(status: number): boolean {
  return status === 307 || status === 308;
}

async function fetchFollowingRedirects(
  request: Request,
  redirectCount: number,
  bodyBuffer: ArrayBuffer | null
): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(request);
  } catch (err) {
    return new Response('Bad Gateway', { status: 502 });
  }

  if (redirectCount >= MAX_REDIRECTS || !isRedirect(response.status)) {
    return response;
  }

  const location = response.headers.get('Location');
  if (!location) {
    return response;
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(location, request.url);
  } catch {
    return response;
  }
  // Only follow redirects to our origin; pass through redirects to other hosts
  if (targetUrl.host !== ORIGIN_HOST) {
    return response;
  }

  const preserve = mustPreserveMethodAndBody(response.status);
  const nextRequest = new Request(targetUrl, {
    method: preserve ? request.method : 'GET',
    headers: request.headers,
    body: preserve ? bodyBuffer : null,
    redirect: 'manual',
  });
  nextRequest.headers.set('Host', ORIGIN_HOST);

  return fetchFollowingRedirects(nextRequest, redirectCount + 1, bodyBuffer);
}

export default {
  async fetch(request: Request, _env: Env, _ctx: unknown): Promise<Response> {
    let url: URL;
    try {
      url = new URL(request.url);
    } catch {
      return new Response('Bad Request', { status: 400 });
    }

    // Buffer body once so it can be reused for 307/308 redirects (body is single-use)
    let bodyBuffer: ArrayBuffer | null = null;
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
      try {
        bodyBuffer = await request.clone().arrayBuffer();
      } catch {
        return new Response('Bad Request', { status: 400 });
      }
    }

    const originUrl = ORIGIN + originPath(url);
    const originHeaders = new Headers(request.headers);
    originHeaders.set('Host', ORIGIN_HOST);
    const originRequest = new Request(originUrl, {
      method: request.method,
      headers: originHeaders,
      body: bodyBuffer ?? request.body,
      redirect: 'manual',
    });

    return fetchFollowingRedirects(originRequest, 0, bodyBuffer);
  },
};
