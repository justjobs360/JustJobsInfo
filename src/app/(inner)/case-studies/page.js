
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import HeaderTwo from "@/components/header/HeaderTwo";
import BannerCaseStudies from "@/components/banner/BannerCaseStudies";
import CtaFour from "@/components/cta/CtaFour";

export default function Home() {
    return (
        <div className='#'>
            <HeaderTwo />
            <BannerCaseStudies />



            <CtaFour />
            <FooterOne />
            <BackToTop />
        </div>
    );
}
