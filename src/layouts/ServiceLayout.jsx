import React, { useState } from 'react';
import { MessageSquare, X, ChevronRight, ChevronLeft } from 'lucide-react';
import styles from './ServiceLayout.module.css';

/**
 * ServiceLayout
 * 
 * A wrapper layout for "App Mode" services (Health, Safety, Games).
 * Features:
 * - Specific Header with Title and Close button (returns to Home).
 * - Main Content Area for the service dashboard.
 * - Collapsible "Side Chat" panel for AI assistance without leaving the service.
 */
const ServiceLayout = ({ title, children, onBack, onChatToggle, isChatOpen = false, chatContent }) => {
    return (
        <div className={styles.container}>
            {/* Main Service Area */}
            <div className={`${styles.mainArea} ${isChatOpen ? styles.propertiesShrink : ''}`}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        {onBack && (
                            <button className={styles.backButton} onClick={onBack}>
                                <X size={24} />
                            </button>
                        )}
                        <h1 className={styles.title}>{title}</h1>
                    </div>

                    {!isChatOpen && (
                        <button
                            className={styles.chatToggleButton}
                            onClick={onChatToggle}
                            title="안심씨와 대화하기"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '20px' }}>
                                <defs>
                                    <linearGradient id="serviceChatGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#22d3ee" />
                                        <stop offset="0.5" stopColor="#818cf8" />
                                        <stop offset="1" stopColor="#c084fc" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                                    stroke="url(#serviceChatGradient)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M9 10h6"
                                    stroke="url(#serviceChatGradient)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M12 7v6"
                                    stroke="url(#serviceChatGradient)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span>안심씨 대화</span>
                        </button>
                    )}
                </header>

                <div className={styles.content}>
                    {children}
                </div>
            </div>

            {/* Split View Chat Panel */}
            <div className={`${styles.chatPanel} ${isChatOpen ? styles.chatOpen : ''}`}>
                <div className={styles.chatHeader}>
                    <h3>안심씨 AI</h3>
                    <button className={styles.closeChatButton} onClick={onChatToggle}>
                        <ChevronRight size={20} />
                    </button>
                </div>
                {chatContent ? (
                    <div className={styles.chatContentWrapper}>
                        {chatContent}
                    </div>
                ) : (
                    <div className={styles.chatBodyPlaceholder}>
                        <div className={styles.emptyState}>
                            <MessageSquare size={48} color="var(--border-focus)" />
                            <p>서비스 이용 중 궁금한 점을<br />안심씨에게 물어보세요.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceLayout;
