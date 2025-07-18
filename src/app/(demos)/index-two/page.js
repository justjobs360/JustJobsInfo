
import BannerTwo from "@/components/banner/BannerTwo";
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import HeaderTwo from "@/components/header/HeaderTwo";
import Brand from "@/components/brand/Brand";
import ServiceTwo from "@/components/services/ServiceTwo";
import CaseStudiesTwo from "@/components/casestudies/CaseStudiesTwo";
import TestimonialsTwo from "@/components/testimonials/TestimonialsTwo";
import BlogTwo from "@/components/blog/BlogTwo";
import CtaTwo from "@/components/cta/CtaTwo";
export default function Home() {
    return (
        <div className='#'>

            <HeaderTwo />
            <BannerTwo />
            <Brand />
            <ServiceTwo />
            <CaseStudiesTwo />
            <TestimonialsTwo />
            <BlogTwo />
            <CtaTwo />
            <FooterOne />
            <BackToTop />
        </div>
    );
}
