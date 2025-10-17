
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import HeaderTwo from "@/components/header/HeaderTwo";
import FeatureTwo from "@/components/feature/FeatureTwo";
import ServiceSingle from "@/components/banner-service/ServiceSingle";
import TestimonialsFive from "@/components/testimonials/TestimonialsFive";
import CtaSix from "@/components/cta/CtaTeam";
import SingleDetails from "@/components/service-component/SingleDetails";
import MoreSolutions from "@/components/service-component/MoreSolution";

export default function Home() {
    return (
        <div className='#'>
            <HeaderTwo />
            <Breadcrumb />
            <ServiceSingle />
            <SingleDetails />
            <MoreSolutions/>


            <FeatureTwo />
            <TestimonialsFive />
            <CtaSix />
            <FooterOneDynamic />
            <BackToTop />
        </div>
    );
}
