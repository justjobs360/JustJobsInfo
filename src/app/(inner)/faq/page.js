"use client";
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import HeaderOne from "@/components/header/HeaderOne";
import CtaOne from "@/components/cta/CtaOne";
import FaqOne from "@/components/faq/FaqOne";
import StructuredData from "@/components/common/StructuredData";
import { generateFAQSchema } from "@/utils/structuredDataService";

export default function Home() {
    // FAQ data for structured data
    const faqs = [
        {
            question: "What is an AI resume auditor?",
            answer: "An AI resume auditor is a powerful tool that utilizes artificial intelligence to analyze and evaluate resumes. It provides users with detailed insights, feedback, and suggestions to enhance the effectiveness of their resumes in job applications."
        },
        {
            question: "Can the AI resume auditor help with specific industries?",
            answer: "Absolutely! The tool is designed to cater to a wide range of industries. Whether you're in technology, marketing, finance, or any other field, the AI resume auditor provides customized feedback to suit your career goals."
        },
        {
            question: "Can the AI resume auditor help with formatting and design?",
            answer: "Absolutely! In addition to content analysis, our tool offers suggestions on formatting and design to ensure your resume is visually appealing and stands out to recruiters."
        },
        {
            question: "How does the intelligent scanning feature work?",
            answer: "The intelligent scanning feature uses advanced algorithms to examine resumes, identifying key strengths and potential areas for improvement. It considers industry-specific requirements, helping users tailor their resumes to stand out in their respective fields."
        },
        {
            question: "How often can I use the AI resume auditor?",
            answer: "You can use the AI resume auditor as often as needed. Whether you're updating your resume for a new job opportunity or seeking continuous improvement, our tool is here to assist you at every step of your career journey."
        },
        {
            question: "How long does it take to receive feedback from the AI resume auditor?",
            answer: "The analysis is typically completed within minutes. You'll receive instant feedback on your resume, allowing you to make timely improvements and stay ahead in your job search."
        }
    ];

    return (
        <div className='#'>
            <StructuredData 
                type="faq"
                pageData={{
                    title: 'Frequently Asked Questions - JustJobsInfo',
                    description: 'Find answers to common questions about our AI resume auditor and career services.',
                    image: 'https://justjobs.info/assets/images/og-images/og-faq.webp'
                }}
                customSchema={generateFAQSchema(faqs)}
            />
            <HeaderOne />
            <Breadcrumb />
            <FaqOne />
            <CtaOne />
            <FooterOneDynamic />
            <BackToTop />
        </div>
    );
}
