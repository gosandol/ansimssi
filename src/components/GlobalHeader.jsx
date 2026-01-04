import React from 'react';
import { Menu, ArrowLeft, Share, Globe, Image, LogIn, User } from 'lucide-react';
import styles from './GlobalHeader.module.css';
import { supabase } from '../lib/supabaseClient';

const GlobalHeader = ({ onMenuClick, session, isThreadMode, onBackClick, activeSection, onNavigate, onLoginClick }) => {

    // Thread Mode Header (Search Results) - Kept mostly same but ensures desktop visibility
    if (isThreadMode) {
        return (
            <header className={styles.header}>
                <div className={styles.leftSection}>
                    <button className={styles.iconButton} onClick={onMenuClick} style={{ marginRight: '0.5rem' }}>
                        <Menu size={24} />
                    </button>
                    {/* Optional: Show Logo here too or Back button context? */}
                    {/* User might want Back button functionality on Mobile still */}
                    <button className={`${styles.iconButton} ${styles.mobileOnly}`} onClick={onBackClick}>
                        <ArrowLeft size={24} />
                    </button>
                    {/* Title Hidden in Thread Mode per User Request */}
                    {/* <div className={`${styles.logoArea} ${styles.desktopOnly}`}>
                        <span className={styles.logoText}>안심씨</span>
                    </div> */}
                </div>

                {/* Center: View Toggle Pill */}
                <div className={styles.centerContainer}>
                    <div className={styles.pillContainer}>
                        {/* Answer Tab (Active) */}
                        <div
                            className={`${styles.pillItem} ${activeSection === 'answer' ? styles.active : ''}`}
                            onClick={() => onNavigate('answer')}
                            style={{ cursor: 'pointer' }}
                            data-tooltip="답변"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.ansimssiIcon}>
                                <path d="M12 2L12 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M3.33975 7L20.6603 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M3.33975 17L20.6603 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                            <span className={styles.labelText}>답변</span>
                        </div>

                        {/* Sources Tab */}
                        <div
                            className={`${styles.pillItem} ${activeSection === 'sources' ? styles.active : ''}`}
                            onClick={() => onNavigate('sources')}
                            style={{ cursor: 'pointer' }}
                            data-tooltip="링크"
                        >
                            <Globe size={16} />
                            <span className={styles.labelText}>링크</span>
                        </div>

                        {/* Images Tab */}
                        <div
                            className={`${styles.pillItem} ${activeSection === 'images' ? styles.active : ''}`}
                            onClick={() => onNavigate('images')}
                            style={{ cursor: 'pointer' }}
                            data-tooltip="이미지"
                        >
                            <Image size={16} />
                            <span className={styles.labelText}>이미지</span>
                        </div>
                    </div>
                </div>

                {/* Right: Auth & Share - Hidden in Thread Mode per User Request */}
                <div className={styles.rightSection} style={{ visibility: 'hidden' }}>
                    {/* Kept structure but hidden to prevent layout shift if needed */}
                </div>
            </header>
        );
    }

    // Default Home Header
    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <button className={styles.iconButton} onClick={onMenuClick}>
                    <Menu size={24} />
                </button>

                <div className={styles.logoArea} onClick={onBackClick} style={{ cursor: 'pointer' }}>
                    {/* Logo Icon Removed per user request */}
                    {/* <div className={styles.logoIcon}>...</div> */}
                    <span className={styles.logoText}>안심씨</span>
                </div>
            </div>

            <div className={styles.rightSection}>
                {session ? (
                    <button className={styles.avatarButton} onClick={() => supabase.auth.signOut()} title="로그아웃">
                        {session.user.user_metadata.avatar_url ? (
                            <img src={session.user.user_metadata.avatar_url} alt="Profile" className={styles.avatarImg} />
                        ) : (
                            <div className={styles.avatarFallback}>
                                {session.user.email[0].toUpperCase()}
                            </div>
                        )}
                    </button>
                ) : (
                    <button className={styles.headerLoginBtn} onClick={onLoginClick}>
                        <LogIn size={18} />
                        <span className={styles.desktopOnly}>로그인</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default GlobalHeader;
