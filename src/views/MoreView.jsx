import React from 'react';
import { Settings, Info, Bell, MessageCircle, FileText, Shield, ArrowLeft } from 'lucide-react';
import styles from './MoreView.module.css';

const MoreView = ({ onBack, onSettingsClick }) => {
    const menuItems = [
        { icon: <Bell size={24} />, label: '공지사항', desc: '새로운 소식 확인', action: () => alert('준비 중입니다.') },
        { icon: <MessageCircle size={24} />, label: '고객센터', desc: '1:1 문의 및 FAQ', action: () => alert('준비 중입니다.') },
        { icon: <Settings size={24} />, label: '앱 설정', desc: '화면, 알림 설정', action: onSettingsClick },
        { icon: <Info size={24} />, label: '서비스 소개', desc: '안심씨 알아보기', action: () => window.open('https://ansimssi.kr', '_blank') },
        { icon: <FileText size={24} />, label: '이용약관', desc: '서비스 이용 규정', action: () => { } },
        { icon: <Shield size={24} />, label: '개인정보처리방침', desc: '소중한 정보 보호', action: () => { } },
    ];

    return (
        <div className={styles.container}>
            <div style={{ marginBottom: '1rem' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-secondary)',
                        padding: 0
                    }}
                >
                    <ArrowLeft size={20} />
                    <span>뒤로가기</span>
                </button>
            </div>

            <header className={styles.header}>
                <h1>더보기</h1>
                <p>안심씨의 다양한 기능을 확인해보세요.</p>
            </header>
            <div className={styles.grid}>
                {menuItems.map((item, idx) => (
                    <button key={idx} className={styles.card} onClick={item.action}>
                        <div className={styles.iconWrapper}>{item.icon}</div>
                        <div className={styles.textWrapper}>
                            <span className={styles.label}>{item.label}</span>
                            <span className={styles.desc}>{item.desc}</span>
                        </div>
                    </button>
                ))}
            </div>
            <div className={styles.footer}>
                <p>현재 버전 1.0.0</p>
            </div>
        </div>
    );
};

export default MoreView;
