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

    // Never modify sitemap/robots responses (Google expects "plain" files).
    // We still allow host/proto redirects below when needed.
    const isSpecialSeoFile =
      pathname === '/sitemap.xml' ||
      pathname === '/sitemap.xml/' ||
      pathname === '/sitemap.xml.gz' ||
      pathname === '/robots.txt';

    // IMPORTANT:
    // Do not apply host/protocol canonical redirects in middleware.
    // Vercel domain configuration already handles domain redirects and can
    // conflict with middleware redirects, causing redirect loops.

    // For sitemap/robots, do not add canonical Link header or other modifications.
    if (isSpecialSeoFile) {
      // Drop conditional validators so static serving returns 200 + body instead of 304
      // (helps crawlers that submit /sitemap.xml without going through a redirect first).
      if (pathname === '/sitemap.xml' || pathname === '/sitemap.xml/') {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.delete('if-none-match');
        requestHeaders.delete('if-modified-since');
        return NextResponse.next({ request: { headers: requestHeaders } });
      }
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
