import { NextResponse } from 'next/server';

/**
 * Middleware to handle legacy/permanent redirects and hostname canonicalization.
 * - /posts/:slug  -> /blogs/:slug
 * - /job/:slug    -> /job-listing?query=:slug  (best-effort mapping)
 * - www.justjobs.info -> justjobs.info (canonical)
 *
 * This prevents crawlers (and users) from getting 404s for legacy paths
 * while we clean up the sitemap and external links.
 */
export function middleware(request) {
  try {
    const url = request.nextUrl.clone();
    const pathname = url.pathname || '';

    // Ensure HTTPS: redirect http requests to https (use x-forwarded-proto when behind a proxy)
    // NOTE: During local development (localhost, 127.0.0.1) we should not force HTTPS
    // because the dev server typically doesn't serve TLS and that causes browsers
    // to attempt https://localhost:3000 which will result in ERR_CONNECTION_REFUSED.
    const protoHeader = request.headers.get('x-forwarded-proto');
    const proto = protoHeader || (url.protocol ? url.protocol.replace(':', '') : '');
    const hostname = url.hostname || '';
    const isProdHost = hostname === 'justjobs.info' || hostname === 'www.justjobs.info';
    if ((proto === 'http' || proto === 'http:') && isProdHost) {
      const redirectUrl = url.clone();
      redirectUrl.protocol = 'https:';
      // canonicalize host to non-www
      redirectUrl.hostname = redirectUrl.hostname === 'www.justjobs.info' ? 'justjobs.info' : redirectUrl.hostname;
      // Ensure full origin uses https
      const target = `https://${redirectUrl.hostname}${redirectUrl.pathname}${redirectUrl.search}`;
      return NextResponse.redirect(target, 301);
    }

    // Canonicalize www -> non-www for the production host only
    if (url.hostname === 'www.justjobs.info') {
      const redirectUrl = url.clone();
      redirectUrl.hostname = 'justjobs.info';
      return NextResponse.redirect(redirectUrl, 301);
    }

    // /posts/:slug  -> /blogs/:slug
    if (pathname.startsWith('/posts/')) {
      const slug = pathname.replace('/posts/', '');
      const redirectUrl = url.clone();
      redirectUrl.pathname = `/blogs/${slug}`;
      return NextResponse.redirect(redirectUrl, 301);
    }

    // /job/:slug -> /job-listing?query=:slug
    // We can't reliably map old slug -> internal job id here, so point users to
    // the job listing with a query that helps them find it. This is better than 404.
    if (pathname.startsWith('/job/')) {
      const slug = pathname.replace('/job/', '');
      const redirectUrl = url.clone();
      redirectUrl.pathname = '/job-listing';
      // add the slug as a query param so users/search can attempt to surface it
      redirectUrl.searchParams.set('query', slug);
      return NextResponse.redirect(redirectUrl, 301);
    }

    // For non-redirect responses, add a Link header that explicitly
    // declares the canonical URL (helps crawlers pick the canonical)
    const response = NextResponse.next();
    try {
      const canonicalHost = 'https://justjobs.info';
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
