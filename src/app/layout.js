import "../../public/assets/css/plugins/fontawesome.css";
import "../../public/assets/css/plugins/metismenu.css";
import "../../public/assets/css/vendor/bootstrap.min.css";
import "../../public/assets/css/style.css";

import { Cabin } from "next/font/google";
import ClientLayout from '@/components/layout/ClientLayout';

const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cabin",
});

export const metadata = {
  metadataBase: new URL('https://justjobs.info'),
  title: {
    default: "JustJobsInfo - Professional Resume and Career Services",
    template: "%s | JustJobsInfo"
  },
  description: "Professional resume writing services, career guidance, and job search resources to help you land your dream job.",
  keywords: ["resume writing", "career services", "job search", "professional development", "career guidance", "CV writing", "job application help"],
  authors: [{ name: "JustJobsInfo Team" }],
  creator: "JustJobsInfo",
  publisher: "JustJobsInfo",
  icons: {
    icon: "/assets/images/logo/favicon.png",
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://justjobs.info/',
    siteName: 'JustJobsInfo',
    title: 'JustJobsInfo - Professional Resume and Career Services',
    description: 'Professional resume writing services, career guidance, and job search resources to help you land your dream job.',
    images: [
      {
        url: '/assets/images/og-images/og-home.webp',
        width: 1200,
        height: 630,
        alt: 'JustJobsInfo - Professional Resume and Career Services',
      }
    ],
    publishedTime: '2024-01-01T00:00:00.000Z',
    modifiedTime: new Date().toISOString(),
  },
  twitter: {
    card: 'summary_large_image',
    site: '@justjobsinfo',
    creator: '@justjobsinfo',
    title: 'JustJobsInfo - Professional Resume and Career Services',
    description: 'Professional resume writing services, career guidance, and job search resources to help you land your dream job.',
    images: ['/assets/images/og-images/og-home.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`index-one ${cabin.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
