import React, { useState } from 'react';
import { Menu, ArrowLeft, Share, Globe, Image, LogIn, User, BookOpen, GraduationCap, Link } from 'lucide-react';
import styles from './GlobalHeader.module.css';
import { supabase } from '../../lib/supabaseClient';
import ProfileMenu from '../profile/ProfileMenu';

const GlobalHeader = ({ onMenuClick, session, isThreadMode, onBackClick, onLoginClick }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Unified Header (Always visible)
    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <button className={styles.iconButton} onClick={onMenuClick}>
                    <Menu size={24} />
                </button>

                {/* Always show Ansimssi Title */}
                <div className={styles.logoArea} onClick={onBackClick} style={{ cursor: 'pointer' }}>
                    {/* Placeholder for Ansimssi Font Title if implemented, using text for now */}
                    <span className={styles.logoText}>안심씨</span>
                </div>
            </div>

            <div className={styles.rightSection}>
                {session ? (
                    <>
                        <button
                            className={styles.avatarButton}
                            onClick={() => setShowProfileMenu(true)}
                            title="계정 관리"
                        >
                            {session.user.user_metadata.avatar_url ? (
                                <img src={session.user.user_metadata.avatar_url} alt="Profile" className={styles.avatarImg} />
                            ) : (
                                <div className={styles.avatarFallback}>
                                    {session.user.email[0].toUpperCase()}
                                </div>
                            )}
                        </button>
                        {showProfileMenu && (
                            <ProfileMenu
                                session={session}
                                onClose={() => setShowProfileMenu(false)}
                            />
                        )}
                    </>
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
