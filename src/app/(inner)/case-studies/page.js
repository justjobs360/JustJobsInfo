
import BackToTop from "@/components/common/BackToTop";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import HeaderTwo from "@/components/header/HeaderTwo";
import BannerCaseStudies from "@/components/banner/BannerCaseStudies";
import CtaFour from "@/components/cta/CtaFour";

export default function Home() {
    return (
        <div className='#'>
            <HeaderTwo />
            <BannerCaseStudies />



            <CtaFour />
            <FooterOneDynamic />
            <BackToTop />
        </div>
    );
}
