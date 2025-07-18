
import BannerThree from "@/components/banner/BannerThree";
import BackToTop from "@/components/common/BackToTop";
import FooterTwo from "@/components/footer/FooterTwo";
import HeaderTwo from "@/components/header/HeaderTwo";
import CaseStudiesThree from "@/components/casestudies/CaseStudiesThree";
import ServiceThree from "@/components/services/ServiceThree";
import CaseStudiesFour from "@/components/casestudies/CaseStudiesFour";
import PricingTwo from "@/components/pricing/PricingTwo";
import FaqOne from "@/components/faq/FaqOne";
import BlogThree from "@/components/blog/BlogThree";

export default function Home() {
    return (
        <div className='#'>

            <HeaderTwo />
            <BannerThree />
            <CaseStudiesThree />
            <ServiceThree />
            <CaseStudiesFour />
            <PricingTwo />
            <FaqOne />
            <BlogThree />


            <FooterTwo />
            <BackToTop />
        </div>
    );
}
