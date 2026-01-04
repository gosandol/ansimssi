import React from 'react';
import { Globe, Image } from 'lucide-react';
import styles from './MobileResultHeader.module.css';

const MobileResultHeader = ({ activeSection, onNavigate }) => {
    return (
        <div className={styles.header}>
            <button
                className={`${styles.tab} ${activeSection === 'answer' ? styles.active : ''}`}
                onClick={() => onNavigate('answer')}
            >
                <div className={styles.iconWrapper}>
                    {/* Ansimssi Logo (Asterisk) */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L12 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M3.33975 7L20.6603 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M3.33975 17L20.6603 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>
            </button>

            <button
                className={`${styles.tab} ${activeSection === 'sources' ? styles.active : ''}`}
                onClick={() => onNavigate('sources')}
            >
                <div className={styles.iconWrapper}>
                    <Globe size={20} />
                </div>
            </button>

            <button
                className={`${styles.tab} ${activeSection === 'images' ? styles.active : ''}`}
                onClick={() => onNavigate('images')}
            >
                <div className={styles.iconWrapper}>
                    <Image size={20} />
                </div>
            </button>
        </div>
    );
};

export default MobileResultHeader;
