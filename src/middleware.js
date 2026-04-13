import { NextResponse } from 'next/server';

const CANONICAL_ORIGIN = 'https://www.justjobs.info';
/** Legacy redirects on these hosts should target www in one hop (avoid apex→www chains). */
const PRODUCTION_JUSTJOBS_HOSTS = new Set(['justjobs.info', 'www.justjobs.info']);

/**
 * @param {import('next/server').NextRequest} request
 * @param {string} pathname - absolute path e.g. /job-listing
 * @param {string} [search] - including leading ? or empty
 */
function legacyRedirect(request, pathname, search = '') {
  const hostname = request.nextUrl.hostname;
  const normalizedSearch =
    !search ? '' : search.startsWith('?') ? search : `?${search}`;

  if (PRODUCTION_JUSTJOBS_HOSTS.has(hostname)) {
    const dest = new URL(CANONICAL_ORIGIN);
    dest.pathname = pathname;
    dest.search = normalizedSearch;
    return NextResponse.redirect(dest, 301);
  }
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = normalizedSearch;
  return NextResponse.redirect(redirectUrl, 301);
}
const INDEXABLE_EXACT_PATHS = new Set([
  '/',
  '/about',
  '/contact',
  '/blogs',
  '/job-listing',
  '/login',
  '/privacy-policy',
  '/terms-of-use',
  '/cookies-policy',
  '/refund-policy',
  '/advertising-disclosure',
  '/faq',
  '/career',
  '/resume-builder',
  '/resume-audit',
  '/job-fit',
  '/job-alerts',
]);
const INDEXABLE_PREFIX_PATHS = ['/blogs/', '/job/'];

/**
 * Default listing/filter URLs with query params are thin duplicates; canonical = path only (HTTPS www).
 * Avoids "Duplicate, Google chose different canonical than user" for ?search=, ?query=, ?industry=, etc.
 */
function canonicalLinkHref(url) {
  const pathname = url.pathname || '';
  const search = url.search || '';
  const hasQuery = search.length > 1;

  if (hasQuery && (pathname === '/blogs' || pathname === '/job-listing')) {
    return `${CANONICAL_ORIGIN}${pathname}`;
  }

  return `${CANONICAL_ORIGIN}${pathname}${search}`;
}

function normalizePath(pathname) {
  if (!pathname) return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

function isPublicHtmlPath(pathname) {
  if (!pathname) return false;
  if (pathname.startsWith('/_next/')) return false;
  if (pathname.startsWith('/api/')) return false;
  // Any file-like URL such as .xml, .txt, .js, images, etc.
  if (/\.[a-z0-9]+$/i.test(pathname)) return false;
  return true;
}

function isIndexablePath(pathname) {
  const normalized = normalizePath(pathname);
  if (INDEXABLE_EXACT_PATHS.has(normalized)) return true;
  return INDEXABLE_PREFIX_PATHS.some((prefix) => normalized.startsWith(prefix));
}

/**
 * Middleware to handle legacy/permanent redirects.
 * - /posts/:slug  -> /blogs/:slug
 *
 * Bare /job -> /job-listing. /job/[slug] is served by the App Router.
 */
export function middleware(request) {
  try {
    const url = request.nextUrl.clone();
    const pathname = url.pathname || '';

    // IMPORTANT:
    // Do not apply host/protocol canonical redirects in middleware.
    // Vercel domain configuration already handles domain redirects and can
    // conflict with middleware redirects, causing redirect loops.

    // Sitemap: always 200 + XML (no 301). Google Search Console often fails sitemap reads on redirects.
    // /sitemap.xml — direct route. /sitemap.xml/ — rewrite internally to the same handler.
    if (pathname === '/sitemap.xml' || pathname === '/sitemap.xml/') {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.delete('if-none-match');
      requestHeaders.delete('if-modified-since');
      if (pathname === '/sitemap.xml') {
        return NextResponse.next({ request: { headers: requestHeaders } });
      }
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = '/sitemap.xml';
      return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    }

    const isSpecialSeoFile =
      pathname === '/sitemap.xml.gz' || pathname === '/robots.txt';

    if (isSpecialSeoFile) {
      return NextResponse.next();
    }

    // Legacy PHP front-controller URL (site is Next.js — no PHP). Crawlers often got 403 here.
    // Exact path only; strip query on redirect to avoid reflecting untrusted URLs (open redirect).
    const pathTrimmed = normalizePath(pathname);
    if (pathTrimmed.toLowerCase() === '/index.php') {
      return legacyRedirect(request, '/', '');
    }

    // Legacy template URL (no page); canonical blog index is /blogs
    if (pathname === '/blog-details') {
      return legacyRedirect(request, '/blogs', '');
    }

    // Bare /job with no slug -> redirect to job listing
    if (pathname === '/job' || pathname === '/job/') {
      return legacyRedirect(request, '/job-listing', '');
    }
    // /job/[slug] is handled by the App Router page (src/app/(inner)/job/[slug]/page.js)

    // /posts/:slug -> /blogs/:slug
    if (pathname.startsWith('/posts/')) {
      const slug = pathname.slice('/posts/'.length).replace(/\/+$/, '');
      if (!slug) {
        return legacyRedirect(request, '/blogs', '');
      }
      return legacyRedirect(request, `/blogs/${slug}`, '');
    }

    // For non-redirect responses, add a Link header that explicitly
    // declares the canonical URL (helps crawlers pick the canonical)
    const response = NextResponse.next();
    try {
      const canonical = canonicalLinkHref(url);
      // Set the Link header with rel=canonical
      // Note: If other middleware or framework code sets Link already, this will replace it.
      response.headers.set('Link', `<${canonical}>; rel="canonical"`);

      // Filter / deeplink job listing URLs often show "no matching jobs" for expired listings;
      // Google flags that as soft 404. Do not index these URL variants — canonical is /job-listing only.
      if (pathname === '/job-listing') {
        const sp = url.searchParams;
        const nz = (k) => (sp.get(k) ?? '').trim().length > 0;
        if (nz('query') || nz('industry') || nz('job') || nz('q')) {
          response.headers.set('X-Robots-Tag', 'noindex, follow');
        }
      }

      // Keep thin or placeholder marketing/template pages out of index until content is expanded.
      if (!response.headers.get('X-Robots-Tag') && isPublicHtmlPath(pathname) && !isIndexablePath(pathname)) {
        response.headers.set('X-Robots-Tag', 'noindex, follow');
      }
    } catch (e) {
      // silently continue if header setting fails
      console.error('Failed to set canonical Link header in middleware:', e);
    }
    return response;
  } catch (err) {
    // On unexpected errors, allow request to continue so middleware doesn't block traffic
    console.error('Middleware error:', err);
    return NextResponse.next();
  }
}

// Run middleware for legacy URL patterns and all paths for hostname canonicalization
export const config = {
  matcher: ['/', '/:path*', '/posts/:path*', '/job/:path*'],
};
