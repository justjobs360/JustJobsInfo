
import ServiceBanner from "@/components/banner/ServiceBanner";
import BackToTop from "@/components/common/BackToTop";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import HeaderOne from "@/components/header/HeaderOne";
import ServiceSeven from "@/components/services/ServiceSeven";
import ServiceList from "@/components/services/ServiceList";
import SolutionCounter from "@/components/services/SolutionCounter";
import LargeImage from "@/components/large-video/LargeImage";
import FeatureTwo from "@/components/feature/FeatureTwo";
import CtaFive from "@/components/cta/CtaFive";
import TestimonialsFive from "@/components/testimonials/TestimonialsFive";
import CtaSix from "@/components/cta/CtaTeam";

export default function Home() {
    return (
        <div className='#'>
            <HeaderOne />
            <ServiceBanner />
            <ServiceSeven />
            <ServiceList />
            <LargeImage />
            <SolutionCounter />
            <FeatureTwo />

            <TestimonialsFive/>
            <CtaSix/>
            <FooterOneDynamic />
            <BackToTop />
        </div>
    );
}
