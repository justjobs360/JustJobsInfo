

import BannerFour from "@/components/banner/BannerFour";
import BlogFour from "@/components/blog/BlogFour";
import CaseFive from "@/components/casestudies/CaseFive";
import BackToTop from "@/components/common/BackToTop";
import CtaThree from "@/components/cta/CtaCareer";
import FooterThree from "@/components/footer/FooterThree";
import HeaderOne from "@/components/header/HeaderOne";
import ServiceFive from "@/components/services/ServiceFive";
import ServiceFour from "@/components/services/ServiceFour";
import TestimonialsFour from '@/components/testimonials/TestimonialsFour';

export default function Home() {
  return (
    <div className='#'>
      <HeaderOne />
      <BannerFour />
      <ServiceFour />
      <ServiceFive />
      <CaseFive />
      <TestimonialsFour />
      <BlogFour />
      <CtaThree />
      <FooterThree />
      <BackToTop />
    </div>
  );
}
