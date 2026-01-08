import React from 'react';
import { ArrowLeft, Megaphone } from 'lucide-react';
import styles from './MoreView.module.css'; // Reusing MoreView styles for consistency

const NoticeView = ({ onBack }) => {
    // Mock Data for Notices
    const notices = [
        {
            id: 1,
            title: "우리집 AI 안심씨 클로즈 베타 오픈 안내",
            date: "2026.01.09",
            content: "안녕하세요, 안심씨 팀입니다. \n드디어 '우리집 AI 안심씨' 서비스가 클로즈 베타 오픈했습니다. \n이제 AI 주치의와 함께 건강하고 안전한 일상을 만들어보세요!",
            label: '공지'
        },
        {
            id: 2,
            title: "가족 계정 연결 기능 업데이트",
            date: "2026.01.08",
            content: "가족 구성원을 등록하고 서로의 안부를 확인할 수 있는 기능이 추가되었습니다. \n프로필 메뉴 > 가족 관리에서 확인해보세요.",
            label: '업데이트'
        }
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '60px', height: '60px',
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary-color)'
                    }}>
                        <Megaphone size={32} />
                    </div>
                    <h1>공지사항</h1>
                    <p>안심씨의 새로운 소식을 알려드립니다.</p>
                </div>
            </header>

            <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
                {notices.map((notice) => (
                    <div key={notice.id} style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        marginBottom: '1rem',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                            <span style={{
                                fontSize: '0.8rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '12px',
                                backgroundColor: notice.label === '공지' ? 'var(--primary-color)' : '#60a5fa',
                                color: '#fff',
                                fontWeight: 600
                            }}>
                                {notice.label}
                            </span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{notice.date}</span>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{notice.title}</h3>
                        <p style={{
                            fontSize: '1rem',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-line'
                        }}>
                            {notice.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NoticeView;
