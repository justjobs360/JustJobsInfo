"use client"
import React from 'react'
import Link from 'next/link';
import HeaderOne from "@/components/header/HeaderOne";
import FooterOne from '@/components/footer/FooterOne';

function page() {
    return (
        <div>
            <HeaderOne />
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
            {/* Logo */}
            <div style={{
                marginBottom: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span style={{
                    fontSize: '32px',
                    fontWeight: '400',
                    color: '#3366CC',
                    letterSpacing: '-0.5px'
                }}>
                    justjobs
                </span>
                <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#1A73E8',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '500',
                        letterSpacing: '0.5px'
                    }}>
                        .INFO
                    </span>
                </div>
            </div>

            {/* Error Message */}
            <div style={{
                marginBottom: '40px',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '400',
                    color: '#202124',
                    margin: '0 0 8px 0',
                    letterSpacing: '-0.3px'
                }}>
                    404 | Oops! there&apos;s nothing here
                </h1>
            </div>

            {/* Buttons */}
            <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                <Link 
                    href="/" 
                    style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: '#4285F4',
                        color: '#ffffff',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s ease',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#3367D6'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#4285F4'}
                >
                    Take me home
                </Link>
                <Link 
                    href="/blogs" 
                    style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: '#202124',
                        color: '#ffffff',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s ease',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#3C4043'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#202124'}
                >
                    Blog
                </Link>
            </div>
            </div>
            <FooterOne />
        </div>
    )
}

export default page