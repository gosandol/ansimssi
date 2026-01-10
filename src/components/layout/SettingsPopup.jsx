import React from 'react';
import {
    Mic,
    Phone,
    Moon,
    Sun,
    HelpCircle,
    FileText,
    MessageSquare,
    Link
} from 'lucide-react';
import styles from './SettingsPopup.module.css';

const SettingsPopup = ({ isOpen, onClose, anchorRef, onOpenModal }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className={styles.backdrop} onClick={onClose} />
            <div className={styles.popup}>
                <div className={styles.section}>
                    <button className={styles.menuItem} onClick={() => { onOpenModal('contacts'); onClose(); }}>
                        <Phone size={18} />
                        <span>안심 연락처 설정</span>
                    </button>
                    <button className={styles.menuItem} onClick={() => { onOpenModal('voice'); onClose(); }}>
                        <Mic size={18} />
                        <span>음성 대화 설정</span>
                    </button>
                    <button className={styles.menuItem} onClick={() => { alert('테마 변경 준비 중'); onClose(); }}>
                        <Moon size={18} />
                        <span>테마 (다크 모드)</span>
                    </button>
                </div>

                <div className={styles.divider} />

                <div className={styles.section}>
                    <button className={styles.menuItem} onClick={() => { window.open('/help'); onClose(); }}>
                        <HelpCircle size={18} />
                        <span>도움말</span>
                    </button>
                    <button className={styles.menuItem} onClick={() => { window.open('/privacy'); onClose(); }}>
                        <FileText size={18} />
                        <span>개인정보처리방침</span>
                    </button>
                </div>

                <div className={styles.divider} />

                <div className={styles.section}>
                    <div className={styles.footerInfo}>
                        <span>Ansimssi v2.1.0</span>
                        <span className={styles.dot}>•</span>
                        <span>서울 (현재 위치)</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingsPopup;
