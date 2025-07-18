"use client";

import { useEffect, useState } from "react";

const ComingSoon = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const endDate = "2025-12-31T23:59:59"; // Replace this with your desired end date

    useEffect(() => {
        const endTime = new Date(endDate).getTime();

        if (isNaN(endTime)) {
            console.error("Invalid end date provided to the countdown timer.");
            return;
        }

        const updateCountdown = () => {
            const currentTime = new Date().getTime();
            const timeDifference = endTime - currentTime;

            if (timeDifference > 0) {
                setTimeLeft({
                    days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
                });
            } else {
                clearInterval(interval);
                setTimeLeft({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                });
            }
        };

        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [endDate]);

    return (
        <div className="rts-coming-soon-area rts-section-gap d-flex align-items-center h-100-vh">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="coming-soon-wrapper-main">
                            <div className="timer-area">
                                <div className="countdown" id="countdown" data-end-date={endDate}>
                                    <h3>Coming Soon</h3>
                                    <div className="timer-section">
                                        <div className="time-unit">
                                            <span id="days">{timeLeft.days}</span>
                                            <small>Days</small>
                                        </div>
                                        <div className="time-unit">
                                            <span id="hours">{timeLeft.hours}</span>
                                            <small>Hours</small>
                                        </div>
                                        <div className="time-unit">
                                            <span id="minutes">{timeLeft.minutes}</span>
                                            <small>Minutes</small>
                                        </div>
                                        <div className="time-unit">
                                            <span id="seconds">{timeLeft.seconds}</span>
                                            <small>Seconds</small>
                                        </div>
                                    </div>
                                </div>
                                <p className="para">
                                    Come back again when we’re live! Thank you for understanding and patience!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
