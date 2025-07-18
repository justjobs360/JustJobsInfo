"use client"
import React from 'react'
import Accordion from 'react-bootstrap/Accordion';

function FaqOne() {
    return (
        <div>
            <>
                {/* commercial faq area */}
                <div className="professional-faq-area rts-section-gap position-relative">
                    
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="text-center-title-bg-white">
                                    <h2 className="title" style={{ fontSize: 40 }}>
                                        Common questions
                                    </h2>
                                    <p>
                                    If you can&apos;t find what you&apos;re looking for, email us and we&apos;ll get back to you as soon as possible.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="row mt--80">
                            <div className="col-lg-12">
                                <div className="accordion-container-one">

                                    <Accordion defaultActiveKey="0">
                                        <Accordion.Item eventKey="0">
                                            <Accordion.Header>What is an AI resume auditor?</Accordion.Header>
                                            <Accordion.Body>
                                            An AI resume auditor is a powerful tool that utilizes artificial intelligence to analyze and evaluate resumes. It provides users with detailed insights, feedback, and suggestions to enhance the effectiveness of their resumes in job applications.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="1">
                                            <Accordion.Header>Can the AI resume auditor help with specific industries?</Accordion.Header>
                                            <Accordion.Body>
                                            Absolutely! The tool is designed to cater to a wide range of industries. Whether you&apos;re in technology, marketing, finance, or any other field, the AI resume auditor provides customized feedback to suit your career goals.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="2">
                                            <Accordion.Header>Can the AI resume auditor help with formatting and design?</Accordion.Header>
                                            <Accordion.Body>
                                            Absolutely! In addition to content analysis, our tool offers suggestions on formatting and design to ensure your resume is visually appealing and stands out to recruiters.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="3">
                                            <Accordion.Header>How does the intelligent scanning feature work?</Accordion.Header>
                                            <Accordion.Body>
                                            The intelligent scanning feature uses advanced algorithms to examine resumes, identifying key strengths and potential areas for improvement. It considers industry-specific requirements, helping users tailor their resumes to stand out in their respective fields.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="4">
                                            <Accordion.Header>How often can I use the AI resume auditor?</Accordion.Header>
                                            <Accordion.Body>
                                            You can use the AI resume auditor as often as needed. Whether you&apos;re updating your resume for a new job opportunity or seeking continuous improvement, our tool is here to assist you at every step of your career journey.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="5">
                                            <Accordion.Header>How long does it take to receive feedback from the AI resume auditor?</Accordion.Header>
                                            <Accordion.Body>
                                            The analysis is typically completed within minutes. You&apos;ll receive instant feedback on your resume, allowing you to make timely improvements and stay ahead in your job search.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </div>
                            </div>
                        </div>
                        <div className="row mt--80">
                            <div className="col-lg-12 text-center">
                                <p>
                                    Still have a question?{" "}
                                    <a
                                        href="/free-consultation"
                                        style={{ color: "var(--color-primary)" }}
                                    >
                                        Feel free to ask
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* commercial faq area end */}
            </>

        </div>
    )
}

export default FaqOne