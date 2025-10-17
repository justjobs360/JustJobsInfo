
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import HeaderOne from "@/components/header/HeaderOne";
import CtaOne from "@/components/cta/CtaOne";
import FaqOne from "@/components/faq/FaqOne";
export default function Home() {
    return (
        <div className='#'>
            <HeaderOne />
            <Breadcrumb />






            <FaqOne />
            <CtaOne />
            <FooterOneDynamic />
            <BackToTop />
        </div>
    );
}
