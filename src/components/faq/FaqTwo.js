"use client"
import React from 'react'
import Accordion from 'react-bootstrap/Accordion';

function FaqTwo() {
    return (
        <>
            {/* commercial faq area */}
            <div className="professional-faq-area rts-section-gapBottom position-relative">
                <div className="shape-top">
                    <img
                        loading="lazy"
                        rel="preload"
                        src="assets/images/video/shape/01.png"
                        alt=""
                        className="wow move-right"
                        data-wow-offset={120}
                    />
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="text-center-title-bg-white">
                                <h2 className="title" style={{ fontSize: 40 }}>
                                    Common questions
                                </h2>
                                <p>
                                    Offers a unified platform that fosters innovation while providing
                                    end-to-end data management. See how we help your team solve
                                    today’s biggest challenges.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row mt--80">
                        <div className="col-lg-12">
                            <div className="accordion-container-one">

                                <Accordion defaultActiveKey="0">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>How long has Luminous been in business?</Accordion.Header>
                                        <Accordion.Body>
                                            Offers a unified platform that fosters innovation while
                                            providing end-to-end data management. See how we help your
                                            team solve today’s biggest challenges.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>What types of services does Luminous offer?</Accordion.Header>
                                        <Accordion.Body>
                                            Offers a unified platform that fosters innovation while
                                            providing end-to-end data management. See how we help your
                                            team solve today’s biggest challenges.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>Does Luminous work with small businesses or only large
                                            enterprises?</Accordion.Header>
                                        <Accordion.Body>
                                            Offers a unified platform that fosters innovation while
                                            providing end-to-end data management. See how we help your
                                            team solve today’s biggest challenges.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="3">
                                        <Accordion.Header>What technologies does Luminous specialize in?</Accordion.Header>
                                        <Accordion.Body>
                                            Offers a unified platform that fosters innovation while
                                            providing end-to-end data management. See how we help your
                                            team solve today’s biggest challenges.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="4">
                                        <Accordion.Header>How does Luminous stay up-to-date with the latest technology
                                            trends?</Accordion.Header>
                                        <Accordion.Body>
                                            Offers a unified platform that fosters innovation while
                                            providing end-to-end data management. See how we help your
                                            team solve today’s biggest challenges.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="5">
                                        <Accordion.Header>How do I get started with Luminous?</Accordion.Header>
                                        <Accordion.Body>
                                            Offers a unified platform that fosters innovation while
                                            providing end-to-end data management. See how we help your
                                            team solve today’s biggest challenges.
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

    )
}

export default FaqTwo