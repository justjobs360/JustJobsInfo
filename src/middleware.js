import { NextResponse } from 'next/server';

/**
 * Middleware to handle legacy/permanent redirects.
 * - /posts/:slug  -> /blogs/:slug
 *
 * /job/:slug is no longer redirected; those URLs return 404 so Google can drop them.
 */
export function middleware(request) {
  try {
    const url = request.nextUrl.clone();
    const pathname = url.pathname || '';

    // IMPORTANT:
    // Do not apply host/protocol canonical redirects in middleware.
    // Vercel domain configuration already handles domain redirects and can
    // conflict with middleware redirects, causing redirect loops.

    // Canonical sitemap URL is /sitemap.xml/ (trailing slash). Non-canonical returns 301.
    if (pathname === '/sitemap.xml') {
      const dest = request.nextUrl.clone();
      dest.pathname = '/sitemap.xml/';
      return NextResponse.redirect(dest, 301);
    }

    // Browser URL stays .../sitemap.xml/; internally serve the route handler at /sitemap.xml.
    if (pathname === '/sitemap.xml/') {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.delete('if-none-match');
      requestHeaders.delete('if-modified-since');
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = '/sitemap.xml';
      return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    }

    const isSpecialSeoFile =
      pathname === '/sitemap.xml.gz' || pathname === '/robots.txt';

    if (isSpecialSeoFile) {
      return NextResponse.next();
    }

    // /posts/:slug  -> /blogs/:slug
    if (pathname.startsWith('/posts/')) {
      const slug = pathname.replace('/posts/', '');
      const redirectUrl = url.clone();
      redirectUrl.pathname = `/blogs/${slug}`;
      return NextResponse.redirect(redirectUrl, 301);
    }

    // For non-redirect responses, add a Link header that explicitly
    // declares the canonical URL (helps crawlers pick the canonical)
    const response = NextResponse.next();
    try {
      const canonicalHost = 'https://www.justjobs.info';
      const canonical = `${canonicalHost}${url.pathname}${url.search}`;
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
