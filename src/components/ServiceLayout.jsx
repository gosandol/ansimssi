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
                            <MessageSquare size={20} />
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
