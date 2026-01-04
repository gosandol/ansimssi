import React, { useState } from 'react';
import ServiceLayout from '../components/ServiceLayout';
import WidgetCard from '../components/WidgetCard';
import { Megaphone, MessageCircle, Truck, Wrench } from 'lucide-react';
import styles from './LifeView.module.css';

const LifeView = ({ onBack, chatContent }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const notices = [
        { id: 1, title: '[공지] 엘리베이터 정기 점검 안내 (10/5)', date: '2024.10.01', important: true },
        { id: 2, title: '단지 내 재활용 분리수거 일정 변경', date: '2024.09.28', important: false },
        { id: 3, title: '지하주차장 물청소 안내', date: '2024.09.25', important: false },
    ];

    return (
        <ServiceLayout
            title="생활 지원 (Community)"
            onBack={onBack}
            onChatToggle={() => setIsChatOpen(!isChatOpen)}
            isChatOpen={isChatOpen}
            chatContent={chatContent}
        >
            <div className={styles.grid}>
                {/* 1. Apartment Notices (Large) */}
                <WidgetCard title="우리 아파트 공지사항" icon={Megaphone} className={styles.noticeCard} accentColor="#f59e0b">
                    <ul className={styles.noticeList}>
                        {notices.map(notice => (
                            <li key={notice.id} className={styles.noticeItem}>
                                <div className={styles.noticeHeader}>
                                    {notice.important && <span className={styles.badge}>중요</span>}
                                    <span className={styles.noticeTitle}>{notice.title}</span>
                                </div>
                                <span className={styles.noticeDate}>{notice.date}</span>
                            </li>
                        ))}
                    </ul>
                    <button className={styles.moreBtn}>더보기</button>
                </WidgetCard>

                {/* 2. Quick Services */}
                <WidgetCard title="생활 편의 서비스" icon={Wrench}>
                    <div className={styles.quickGrid}>
                        <button className={styles.quickBtn}>
                            <Truck size={24} />
                            <span>택배 조회</span>
                        </button>
                        <button className={styles.quickBtn}>
                            <Wrench size={24} />
                            <span>시설 수리 요청</span>
                        </button>
                        <button className={styles.quickBtn}>
                            <MessageCircle size={24} />
                            <span>민원 접수</span>
                        </button>
                    </div>
                </WidgetCard>
            </div>
        </ServiceLayout>
    );
};

export default LifeView;
