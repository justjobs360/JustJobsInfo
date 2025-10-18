"use client";
import dynamic from 'next/dynamic';
import BannerOne from "@/components/banner/BannerOne";
import BackToTop from "@/components/common/BackToTop";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import DynamicMetaTags from "@/components/common/DynamicMetaTags";
import StructuredData from "@/components/common/StructuredData";

// Dynamic imports for below-the-fold components
const LargeVideo = dynamic(() => import("@/components/large-video/LargeVideo"), {
  loading: () => <div style={{ minHeight: '400px' }}>Loading...</div>,
  ssr: true
});

const ServiceOne = dynamic(() => import("@/components/services/ServiceOne"), {
  loading: () => <div style={{ minHeight: '300px' }}>Loading...</div>,
  ssr: true
});

const CounterUp = dynamic(() => import("@/components/counterup/CounterUp"), {
  loading: () => <div style={{ minHeight: '200px' }}>Loading...</div>,
  ssr: true
});

const Pricing = dynamic(() => import("@/components/pricing/Pricing"), {
  loading: () => <div style={{ minHeight: '400px' }}>Loading...</div>,
  ssr: true
});

const FaqOne = dynamic(() => import("@/components/faq/FaqOne"), {
  loading: () => <div style={{ minHeight: '300px' }}>Loading...</div>,
  ssr: true
});

const Testimonials = dynamic(() => import("@/components/testimonials/Testimonials"), {
  loading: () => <div style={{ minHeight: '300px' }}>Loading...</div>,
  ssr: true
});

const CtaOne = dynamic(() => import("@/components/cta/CtaOne"), {
  loading: () => <div style={{ minHeight: '200px' }}>Loading...</div>,
  ssr: true
});

// Optional components (commented out) - ready when needed
const BlogOne = dynamic(() => import("@/components/blog/BlogOne"), {
  loading: () => <div style={{ minHeight: '400px' }}>Loading...</div>,
  ssr: false
});

const CaseStudies = dynamic(() => import("@/components/casestudies/CaseStudies"), {
  loading: () => <div style={{ minHeight: '400px' }}>Loading...</div>,
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
