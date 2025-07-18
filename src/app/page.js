import BannerOne from "@/components/banner/BannerOne";
import BlogOne from "@/components/blog/BlogOne";
import CaseStudies from "@/components/casestudies/CaseStudies";
import BackToTop from "@/components/common/BackToTop";
import CounterUp from "@/components/counterup/CounterUp";
import CtaOne from "@/components/cta/CtaOne";
import FaqOne from "@/components/faq/FaqOne";
import FooterOne from "@/components/footer/FooterOne";
import HeaderOne from "@/components/header/HeaderOne";
import LargeVideo from "@/components/large-video/LargeVideo";
import Pricing from "@/components/pricing/Pricing";
import ServiceOne from "@/components/services/ServiceOne";
import Testimonials from "@/components/testimonials/Testimonials";


export default function Home() {
  return (
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
      <FooterOne />
      <BackToTop />
    </div>
  );
}
