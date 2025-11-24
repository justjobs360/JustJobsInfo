"use client";
import dynamic from 'next/dynamic';
import BannerOne from "@/components/banner/BannerOne";
import HeaderOne from "@/components/header/HeaderOne";
import DynamicMetaTags from "@/components/common/DynamicMetaTags";
import StructuredData from "@/components/common/StructuredData";
import CenteredLoader from "@/components/common/CenteredLoader";

// Lazy load below-the-fold components
const FooterOneDynamic = dynamic(() => import("@/components/footer/FooterOneDynamic"), {
  loading: () => <CenteredLoader minHeight="200px" />,
  ssr: true
});

const BackToTop = dynamic(() => import("@/components/common/BackToTop"), {
  ssr: false
});

// Dynamic imports for below-the-fold components - optimized loading
const LargeVideo = dynamic(() => import("@/components/large-video/LargeVideo"), {
  loading: () => <CenteredLoader minHeight="400px" />,
  ssr: false
});

const ServiceOne = dynamic(() => import("@/components/services/ServiceOne"), {
  loading: () => <CenteredLoader minHeight="300px" />,
  ssr: true
});

const CounterUp = dynamic(() => import("@/components/counterup/CounterUp"), {
  loading: () => <CenteredLoader minHeight="200px" />,
  ssr: false
});

const Pricing = dynamic(() => import("@/components/pricing/Pricing"), {
  loading: () => <CenteredLoader minHeight="400px" />,
  ssr: false
});

const FaqOne = dynamic(() => import("@/components/faq/FaqOne"), {
  loading: () => <CenteredLoader minHeight="300px" />,
  ssr: false
});

const Testimonials = dynamic(() => import("@/components/testimonials/Testimonials"), {
  loading: () => <CenteredLoader minHeight="300px" />,
  ssr: false
});

const CtaOne = dynamic(() => import("@/components/cta/CtaOne"), {
  loading: () => <CenteredLoader minHeight="200px" />,
  ssr: false
});

// Optional components (commented out) - ready when needed
const BlogOne = dynamic(() => import("@/components/blog/BlogOne"), {
  loading: () => <CenteredLoader minHeight="400px" />,
  ssr: false
});

const CaseStudies = dynamic(() => import("@/components/casestudies/CaseStudies"), {
  loading: () => <CenteredLoader minHeight="400px" />,
  ssr: false
});

export default function Home() {
  return (
    <DynamicMetaTags pageName="Home">
      <StructuredData 
        type="home"
        pageData={{
          title: 'JustJobsInfo - Professional Resume and Career Services',
          description: 'Professional resume writing services, career guidance, and job search resources to help you land your dream job.',
          image: 'https://justjobs.info/assets/images/og-images/og-home.webp'
        }}
      />
      <div className='#'>
        <HeaderOne />
        <BannerOne />
        <LargeVideo />
        <ServiceOne />
        <CounterUp />
        {/* <CaseStudies />*/}
        <Pricing />
        <FaqOne />
        <Testimonials />
        {/*<BlogOne /> */}
        <CtaOne />
        <FooterOneDynamic />
        <BackToTop />
      </div>
    </DynamicMetaTags>
  );
}
