import { Fragment } from 'react';
import Script from 'next/script';

const criticalStyles = [
  '/assets/css/vendor/bootstrap.min.css',
  '/assets/css/style.css',
];

const asyncStyles = [
  '/assets/css/plugins/fontawesome.css',
  '/assets/css/plugins/magnifying-popup.css',
  '/assets/css/plugins/swiper.css',
  '/assets/css/plugins/metismenu.css',
  '/assets/css/plugins/modal-video.min.css',
];

export default function GlobalStyleLinks() {
  return (
    <>
      {/* Preconnect to same origin for faster CSS loading */}
      <link rel="preconnect" href="/" />
      
      {/* Preload critical CSS */}
      {criticalStyles.map((href) => (
        <Fragment key={href}>
          <link rel="preload" as="style" href={href} />
          <link
            rel="stylesheet"
            href={href}
          />
        </Fragment>
      ))}

      {asyncStyles.map((href) => (
        <Fragment key={href}>
          <link rel="preload" as="style" href={href} />
          <link
            rel="stylesheet"
            href={href}
            media="print"
            data-async-style="true"
          />
        </Fragment>
      ))}

      <Script id="async-style-loader" strategy="afterInteractive">
        {`
          (function () {
            const hydrateAsyncStyles = () => {
              const links = document.querySelectorAll('link[data-async-style]');

              links.forEach((link) => {
                if (!link || link.dataset.processed === 'true') return;
                link.dataset.processed = 'true';

                const enableStyles = () => {
                  if (link.media !== 'all') {
                    link.media = 'all';
                  }
                };

                if (link.sheet) {
                  enableStyles();
                } else {
                  link.addEventListener('load', enableStyles, { once: true });
                }
              });
            };

            // Use requestIdleCallback for better performance, fallback to setTimeout
            if (typeof requestIdleCallback !== 'undefined') {
              requestIdleCallback(hydrateAsyncStyles, { timeout: 2000 });
            } else {
              setTimeout(hydrateAsyncStyles, 1);
            }
          })();
        `}
      </Script>

      <noscript
        dangerouslySetInnerHTML={{
          __html: asyncStyles
            .map((href) => `<link rel="stylesheet" href="${href}" />`)
            .join(''),
        }}
      />
    </>
  );
}


