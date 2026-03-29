import { NextResponse } from 'next/server';

const CANONICAL_ORIGIN = 'https://www.justjobs.info';

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

/**
 * Middleware to handle legacy/permanent redirects.
 * - /posts/:slug  -> /blogs/:slug
 *
 * /job/:slug -> /job-listing?query=:slug (legacy share URLs).
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
    const pathTrimmed = pathname.replace(/\/+$/, '') || '/';
    if (pathTrimmed.toLowerCase() === '/index.php') {
      const home = request.nextUrl.clone();
      home.pathname = '/';
      home.search = '';
      return NextResponse.redirect(home, 301);
    }

    // Legacy template URL (no page); canonical blog index is /blogs
    if (pathname === '/blog-details') {
      const redirectUrl = url.clone();
      redirectUrl.pathname = '/blogs';
      return NextResponse.redirect(redirectUrl, 301);
    }

    // Legacy job detail URLs (/job/title-shortid) -> listing with same search slug (page uses ?query=)
    if (pathname === '/job' || pathname === '/job/') {
      const redirectUrl = url.clone();
      redirectUrl.pathname = '/job-listing';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl, 301);
    }
    if (pathname.startsWith('/job/')) {
      let slug = pathname.slice('/job/'.length).replace(/\/+$/, '');
      if (slug && /^[a-z0-9._-]+$/i.test(slug) && slug.length <= 400) {
        const redirectUrl = url.clone();
        redirectUrl.pathname = '/job-listing';
        redirectUrl.search = `?query=${encodeURIComponent(slug)}`;
        return NextResponse.redirect(redirectUrl, 301);
      }
      const fallback = url.clone();
      fallback.pathname = '/job-listing';
      fallback.search = '';
      return NextResponse.redirect(fallback, 301);
    }

    // /posts/:slug -> /blogs/:slug
    if (pathname.startsWith('/posts/')) {
      const slug = pathname.slice('/posts/'.length).replace(/\/+$/, '');
      if (!slug) {
        const redirectUrl = url.clone();
        redirectUrl.pathname = '/blogs';
        redirectUrl.search = '';
        return NextResponse.redirect(redirectUrl, 301);
      }
      const redirectUrl = url.clone();
      redirectUrl.pathname = `/blogs/${slug}`;
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl, 301);
    }

    // For non-redirect responses, add a Link header that explicitly
    // declares the canonical URL (helps crawlers pick the canonical)
    const response = NextResponse.next();
    try {
      const canonical = canonicalLinkHref(url);
      // Set the Link header with rel=canonical
      // Note: If other middleware or framework code sets Link already, this will replace it.
      response.headers.set('Link', `<${canonical}>; rel="canonical"`);
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
