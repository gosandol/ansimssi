import React, { useState } from 'react';
import ServiceLayout from '../components/ServiceLayout';
import WidgetCard from '../components/WidgetCard';
import { Gamepad2, Brain, BookOpen, Music, Video } from 'lucide-react';
import styles from './EntertainmentView.module.css';

const EntertainmentView = ({ onBack, mode = 'game', chatContent }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const isLearning = mode === 'learning';
    const title = isLearning ? "배움터 (Learning)" : "놀이터 (Game)";
    const icon = isLearning ? BookOpen : Gamepad2;

    const apps = isLearning ? [
        { id: 'brain', title: '두뇌 트레이닝', icon: Brain, color: '#ec4899' },
        { id: 'math', title: '생활 수학', icon: BookOpen, color: '#3b82f6' },
        { id: 'coding', title: '시니어 코딩', icon: Video, color: '#8b5cf6' },
    ] : [
        { id: 'gostop', title: '맞고 (GoStop)', icon: Gamepad2, color: '#ef4444' },
        { id: 'sudoku', title: '스도쿠', icon: Gamepad2, color: '#10b981' },
        { id: 'karaoke', title: '노래방', icon: Music, color: '#f59e0b' },
    ];

    return (
        <ServiceLayout
            title={title}
            onBack={onBack}
            onChatToggle={() => setIsChatOpen(!isChatOpen)}
            isChatOpen={isChatOpen}
            chatContent={chatContent}
        >
            <div className={styles.container}>
                <WidgetCard title={isLearning ? "추천 학습 프로그램" : "인기 게임"} icon={icon} className={styles.fullCard}>
                    <div className={styles.appGrid}>
                        {apps.map(app => (
                            <button key={app.id} className={styles.appIconBtn}>
                                <div className={styles.iconBox} style={{ backgroundColor: app.color }}>
                                    <app.icon size={32} color="white" />
                                </div>
                                <span className={styles.appName}>{app.title}</span>
                            </button>
                        ))}
                        <button className={styles.appIconBtn}>
                            <div className={`${styles.iconBox} ${styles.addBtn}`}>
                                +
                            </div>
                            <span className={styles.appName}>추가하기</span>
                        </button>
                    </div>
                </WidgetCard>
            </div>
        </ServiceLayout>
    );
};

export default EntertainmentView;
