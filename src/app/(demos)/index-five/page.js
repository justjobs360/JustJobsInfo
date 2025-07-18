"use client"
import { useEffect } from "react";
import BackToTop from "@/components/common/BackToTop";
import BannerFive from "@/components/banner/BannerFive";
import LargeVideoTwo from "@/components/large-video/LargeVideoTwo";
import FooterFour from "@/components/footer/FooterFour";
import ServiceStikcy from "@/components/services/ServiceStikcy";
import HeaderThree from "@/components/header/HeaderThree";
import Project from "@/components/casestudies/Project";
import FaqTwo from "@/components/faq/FaqTwo";
import BlogFive from "@/components/blog/BlogFive";
import PricingThree from "@/components/pricing/PricingThree";
import ContactOne from "@/components/contact/ContactOne";


export default function Home() {
    useEffect(() => {
        // Add class to body when the page is mounted
        document.body.classList.add("index-five");

        // Cleanup by removing the class when the component unmounts
        return () => {
            document.body.classList.remove("index-five");
        };
    }, []);
    return (
        <div>
            <HeaderThree />
            <BannerFive />
            <LargeVideoTwo />
            <ServiceStikcy />
            <Project />
            <PricingThree />
            <FaqTwo />
            <BlogFive />
            <ContactOne />
            <FooterFour />
            <BackToTop />
        </div>
    );
}
