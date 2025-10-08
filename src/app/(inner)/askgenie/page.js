"use client"
import React, { useState, useRef, useEffect } from 'react';
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import BackToTop from "@/components/common/BackToTop";
import { ReactSVG } from 'react-svg';
import './askgenie.css';

export default function AskGenie() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'assistant',
            content: "Hello! I'm here to help with career advice, resumes tips, job search strategies, and more. What's on your mind today?",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Removed auto-scroll functionality - users can scroll manually

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputValue,
                    conversationHistory: messages
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI');
            }

            const data = await response.json();
            
            const aiResponse = {
                id: messages.length + 2,
                type: 'assistant',
                content: data.response,
                timestamp: new Date(data.timestamp)
            };
            
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Fallback response in case of error
            const errorResponse = {
                id: messages.length + 2,
                type: 'assistant',
                content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment. In the meantime, I can help you with career advice, resume tips, job search strategies, and professional development questions.",
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className='#'>
            <HeaderOne />
            
            {/* Chat Interface */}
            <div className="ask-genie-container">
                <div className="chat-header">
                    <div className="chat-header-content">
                        <div className="genie-avatar">
                            <div className="genie-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                                    <path d="M19 15L19.74 17.74L22.5 18.5L19.74 19.26L19 22L18.26 19.26L15.5 18.5L18.26 17.74L19 15Z" fill="currentColor"/>
                                    <path d="M5 6L5.37 7.37L6.75 7.75L5.37 8.13L5 9.5L4.63 8.13L3.25 7.75L4.63 7.37L5 6Z" fill="currentColor"/>
                                </svg>
                            </div>
                        </div>
                        <div className="header-text">
                            <h2>Ask Genie</h2>
                            <p>Smart Career Advice on Demand - Get personalized advice on resumes, job search strategies, career planning, and professional development.</p>
                        </div>
                    </div>
                </div>

                <div className="chat-wrapper">
                    <div className="chat-messages">
                        {messages.map((message) => (
                            <div key={message.id} className={`message ${message.type}`}>
                                <div className="message-avatar">
                                    {message.type === 'assistant' ? (
                                        <div className="genie-avatar-small">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                                                <path d="M19 15L19.74 17.74L22.5 18.5L19.74 19.26L19 22L18.26 19.26L15.5 18.5L18.26 17.74L19 15Z" fill="currentColor"/>
                                                <path d="M5 6L5.37 7.37L6.75 7.75L5.37 8.13L5 9.5L4.63 8.13L3.25 7.75L4.63 7.37L5 6Z" fill="currentColor"/>
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="user-avatar">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="message-content">
                                    <div className="message-text">
                                        {message.content.split('\n').map((line, index) => (
                                            <div key={index}>
                                                {line}
                                                {index < message.content.split('\n').length - 1 && <br />}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="message-time">
                                        {formatTime(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="message assistant">
                                <div className="message-avatar">
                                    <div className="genie-avatar-small">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                                            <path d="M19 15L19.74 17.74L22.5 18.5L19.74 19.26L19 22L18.26 19.26L15.5 18.5L18.26 17.74L19 15Z" fill="currentColor"/>
                                            <path d="M5 6L5.37 7.37L6.75 7.75L5.37 8.13L5 9.5L4.63 8.13L3.25 7.75L4.63 7.37L5 6Z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-container">
                        <div className="input-wrapper">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about careers, resumes, job search..."
                                className="chat-input"
                                rows="1"
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="send-button"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                        <div className="input-footer">
                            <p>Press Enter to send, Shift+Enter for new line</p>
                        </div>
                    </div>
                </div>
            </div>

            <FooterOneDynamic />
            <BackToTop />
        </div>
    );
}
