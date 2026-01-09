import React from 'react';
import { X, Mail } from 'lucide-react';
import styles from './LoginModal.module.css';

import { supabase } from '../../lib/supabaseClient';
import AnsimssiLogo from '../AnsimssiLogo';

const LoginModal = ({ onClose }) => {

    const handleLogin = async (provider) => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) console.error('Error logging in:', error.message);
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    const handleLinkClick = (path) => {
        // Manual routing to support App.jsx's custom router (no React Router)
        window.history.pushState({}, '', path);
        // Trigger popstate event so App.jsx catches the URL change
        window.dispatchEvent(new PopStateEvent('popstate'));
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={24} />
                </button>

                <div className={styles.content}>
                    <div className={styles.iconArea}>
                        <AnsimssiLogo size={48} className={styles.logo} />
                    </div>

                    <h2 className={styles.title}>검색 기록을<br />저장하려면 로그인하세요</h2>
                    <p className={styles.subtitle}>무료로 계정을 만드세요</p>

                    <div className={styles.buttonGroup}>
                        <button className={`${styles.btn} ${styles.btnApple}`} onClick={() => handleLogin('apple')}>
                            <svg className={styles.btnIcon} viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 4.09-.94 1.15.05 2.19.46 2.92 1.35-2.6 1.4-2.18 5.61.19 6.84-.52 1.54-1.23 3.09-2.28 4.98zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                            <span>Apple로 계속하기</span>
                        </button>

                        <button className={`${styles.btn} ${styles.btnGoogle}`} onClick={() => handleLogin('google')}>
                            <svg className={styles.btnIcon} viewBox="0 0 24 24" width="20" height="20">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Google 계정으로 계속하기</span>
                        </button>

                        <button className={`${styles.btn} ${styles.btnKakao}`} onClick={() => handleLogin('kakao')}>
                            <svg className={styles.btnIcon} viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M12 3C7.58 3 4 5.79 4 9.24c0 1.96 1.15 3.76 3.1 4.94-.09.64-.56 2.03-.64 2.33-.1.35.13.35.27.23.08-.06 3.41-2.3 3.92-2.67.44.06.89.09 1.35.09 4.42 0 8-2.79 8-6.24C20 5.79 16.42 3 12 3z" />
                            </svg>
                            <span>카카오로 계속하기</span>
                        </button>

                        <button className={`${styles.btn} ${styles.btnNaver}`} onClick={() => handleLogin('naver')}>
                            <svg className={styles.btnIcon} viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                            </svg>
                            <span>네이버로 계속하기</span>
                        </button>


                        <button className={`${styles.btn} ${styles.btnEmail}`}>
                            <Mail size={20} className={styles.btnIcon} />
                            <span>이메일로 로그인하기</span>
                        </button>
                    </div>

                    <div className={styles.footer}>
                        <span onClick={() => handleLinkClick('/sso')} style={{ cursor: 'pointer' }}>싱글 사인온(SSO)</span>
                    </div>

                    <div className={styles.bottomTerms}>
                        <span onClick={() => handleLinkClick('/privacy')} style={{ cursor: 'pointer' }}>개인정보 보호정책</span>
                        <span onClick={() => handleLinkClick('/terms')} style={{ cursor: 'pointer' }}>서비스 이용 약관</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
