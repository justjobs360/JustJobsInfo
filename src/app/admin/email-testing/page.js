"use client";
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import BackToTop from "@/components/common/BackToTop";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOne from "@/components/footer/FooterOne";

export default function EmailTestingPage() {
    const [testEmail, setTestEmail] = useState('');
    const [testType, setTestType] = useState('verification');
    const [loading, setLoading] = useState(false);
    const [testResults, setTestResults] = useState([]);

    const handleTestEmail = async (e) => {
        e.preventDefault();
        
        if (!testEmail) {
            toast.error('Please enter an email address');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/test-email-deliverability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: testEmail,
                    testType 
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Test email generated successfully!');
                setTestResults(prev => [{
                    ...data.data,
                    timestamp: new Date().toLocaleString()
                }, ...prev]);
            } else {
                toast.error(data.error || 'Failed to generate test email');
            }
        } catch (error) {
            toast.error('Failed to test email deliverability');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <>
            <HeaderOne />
            <div className="email-testing-page-wrapper">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="email-testing-card">
                                <div className="card-header">
                                    <h1>Email Deliverability Testing</h1>
                                    <p>Test email sending and monitor deliverability</p>
                                </div>

                                <div className="card-body">
                                    <form onSubmit={handleTestEmail} className="test-form">
                                        <div className="form-group">
                                            <label htmlFor="testEmail">Test Email Address</label>
                                            <input
                                                type="email"
                                                id="testEmail"
                                                value={testEmail}
                                                onChange={(e) => setTestEmail(e.target.value)}
                                                placeholder="Enter email address to test"
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="testType">Test Type</label>
                                            <select
                                                id="testType"
                                                value={testType}
                                                onChange={(e) => setTestType(e.target.value)}
                                                disabled={loading}
                                            >
                                                <option value="verification">Email Verification</option>
                                                <option value="password-reset">Password Reset</option>
                                            </select>
                                        </div>

                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Testing...' : 'Generate Test Email'}
                                        </button>
                                    </form>

                                    {testResults.length > 0 && (
                                        <div className="test-results">
                                            <div className="results-header">
                                                <h3>Test Results</h3>
                                                <button 
                                                    onClick={clearResults}
                                                    className="btn btn-secondary btn-sm"
                                                >
                                                    Clear Results
                                                </button>
                                            </div>
                                            
                                            <div className="results-list">
                                                {testResults.map((result, index) => (
                                                    <div key={index} className="result-item">
                                                        <div className="result-header">
                                                            <span className="email">{result.email}</span>
                                                            <span className="type">{result.testType}</span>
                                                            <span className="time">{result.timestamp}</span>
                                                        </div>
                                                        <div className="result-details">
                                                            <strong>Action URL:</strong>
                                                            <code className="action-url">{result.actionUrl}</code>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="deliverability-tips">
                                        <h3>Email Deliverability Tips</h3>
                                        <div className="tips-grid">
                                            <div className="tip-item">
                                                <h4>✅ DNS Configuration</h4>
                                                <ul>
                                                    <li>Set up SPF, DKIM, and DMARC records</li>
                                                    <li>Use a custom domain for sending</li>
                                                    <li>Verify domain ownership in Firebase</li>
                                                </ul>
                                            </div>
                                            
                                            <div className="tip-item">
                                                <h4>✅ Email Content</h4>
                                                <ul>
                                                    <li>Use professional, clear language</li>
                                                    <li>Avoid spam trigger words</li>
                                                    <li>Include your brand name</li>
                                                </ul>
                                            </div>
                                            
                                            <div className="tip-item">
                                                <h4>✅ Testing Tools</h4>
                                                <ul>
                                                    <li><a href="https://www.mail-tester.com/" target="_blank" rel="noopener">Mail Tester</a></li>
                                                    <li><a href="https://glockapps.com/" target="_blank" rel="noopener">GlockApps</a></li>
                                                    <li><a href="https://250ok.com/" target="_blank" rel="noopener">250ok</a></li>
                                                </ul>
                                            </div>
                                            
                                            <div className="tip-item">
                                                <h4>✅ Best Practices</h4>
                                                <ul>
                                                    <li>Start with low volume</li>
                                                    <li>Monitor bounce rates</li>
                                                    <li>Use consistent sending patterns</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FooterOne />
            <BackToTop />

            <style jsx>{`
                .email-testing-page-wrapper {
                    min-height: 100vh;
                    background: #f8f9fa;
                    padding: 40px 0;
                }
                
                .email-testing-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                
                .card-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                
                .card-header h1 {
                    margin: 0 0 10px 0;
                    font-size: 28px;
                    font-weight: bold;
                }
                
                .card-header p {
                    margin: 0;
                    opacity: 0.9;
                }
                
                .card-body {
                    padding: 30px;
                }
                
                .test-form {
                    margin-bottom: 30px;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #333;
                }
                
                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e1e5e9;
                    border-radius: 6px;
                    font-size: 16px;
                    transition: border-color 0.3s ease;
                }
                
                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #667eea;
                }
                
                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    display: inline-block;
                }
                
                .btn-primary {
                    background: #667eea;
                    color: white;
                }
                
                .btn-primary:hover:not(:disabled) {
                    background: #5a6fd8;
                    transform: translateY(-2px);
                }
                
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }
                
                .btn-secondary:hover {
                    background: #5a6268;
                }
                
                .btn-sm {
                    padding: 8px 16px;
                    font-size: 14px;
                }
                
                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .test-results {
                    margin-top: 30px;
                    border-top: 2px solid #e1e5e9;
                    padding-top: 20px;
                }
                
                .results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .results-header h3 {
                    margin: 0;
                    color: #333;
                }
                
                .results-list {
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .result-item {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 15px;
                    border-left: 4px solid #667eea;
                }
                
                .result-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                
                .result-header .email {
                    font-weight: 600;
                    color: #333;
                }
                
                .result-header .type {
                    background: #667eea;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    text-transform: uppercase;
                }
                
                .result-header .time {
                    color: #666;
                    font-size: 14px;
                }
                
                .result-details {
                    margin-top: 10px;
                }
                
                .action-url {
                    display: block;
                    background: #e9ecef;
                    padding: 8px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 12px;
                    word-break: break-all;
                    margin-top: 5px;
                }
                
                .deliverability-tips {
                    margin-top: 40px;
                    border-top: 2px solid #e1e5e9;
                    padding-top: 30px;
                }
                
                .deliverability-tips h3 {
                    margin-bottom: 20px;
                    color: #333;
                }
                
                .tips-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }
                
                .tip-item {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #28a745;
                }
                
                .tip-item h4 {
                    margin: 0 0 15px 0;
                    color: #28a745;
                    font-size: 16px;
                }
                
                .tip-item ul {
                    margin: 0;
                    padding-left: 20px;
                }
                
                .tip-item li {
                    margin-bottom: 8px;
                    color: #666;
                    font-size: 14px;
                }
                
                .tip-item a {
                    color: #667eea;
                    text-decoration: none;
                }
                
                .tip-item a:hover {
                    text-decoration: underline;
                }
                
                @media (max-width: 768px) {
                    .card-header {
                        padding: 20px;
                    }
                    
                    .card-body {
                        padding: 20px;
                    }
                    
                    .result-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .tips-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
} 