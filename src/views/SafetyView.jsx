import React, { useState } from 'react';
import ServiceLayout from '../layouts/ServiceLayout';
import WidgetCard from '../components/WidgetCard';
import { ShieldAlert, Video, Lock, Zap, Flame, Droplets } from 'lucide-react';
import styles from './SafetyView.module.css';

const SafetyView = ({ onBack, chatContent }) => {
    // Internal Chat State for Split View Demo
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Mock IoT States
    const [doorLocked, setDoorLocked] = useState(true);
    const [gasValveOpen, setGasValveOpen] = useState(false);
    const [powerSaverMode, setPowerSaverMode] = useState(true);

    return (
        <ServiceLayout
            title="생활 안전 (Life Safety)"
            onBack={onBack}
            onChatToggle={() => setIsChatOpen(!isChatOpen)}
            isChatOpen={isChatOpen}
            chatContent={chatContent}
        >
            <div className={styles.dashboardGrid}>
                {/* 1. Emergency SOS Section (Full Width or Prominent) */}
                <WidgetCard
                    title="긴급 호출 (SOS)"
                    icon={ShieldAlert}
                    className={styles.sosCard}
                    accentColor="#ef4444"
                >
                    <div className={styles.sosContent}>
                        <p>위급 상황 시 버튼을 3초간 누르세요.</p>
                        <button className={styles.sosButton}>
                            <ShieldAlert size={48} />
                            <span>119 호출</span>
                        </button>
                        <div className={styles.sosContacts}>
                            <span>관리사무소 연결</span>
                            <div className={styles.divider}></div>
                            <span>가족에게 알림</span>
                        </div>
                    </div>
                </WidgetCard>

                {/* 2. CCTV Monitoring */}
                <WidgetCard
                    title="실시간 CCTV"
                    icon={Video}
                    className={styles.cctvCard}
                >
                    <div className={styles.cctvGrid}>
                        <div className={styles.cctvFeed}>
                            <div className={styles.liveBadge}>LIVE</div>
                            <span className={styles.feedLabel}>현관</span>
                            {/* Placeholder for Video Feed */}
                            <div className={styles.placeholderPattern}></div>
                        </div>
                        <div className={styles.cctvFeed}>
                            <div className={styles.liveBadge}>LIVE</div>
                            <span className={styles.feedLabel}>놀이터</span>
                            <div className={styles.placeholderPattern}></div>
                        </div>
                    </div>
                </WidgetCard>

                {/* 3. Home Safety IoT Controls */}
                <WidgetCard title="우리집 안전 제어" icon={Lock} className={styles.iotCard}>
                    <div className={styles.iotGrid}>
                        <button
                            className={`${styles.iotButton} ${doorLocked ? styles.active : ''}`}
                            onClick={() => setDoorLocked(!doorLocked)}
                        >
                            <Lock size={24} />
                            <span>{doorLocked ? '현관 잠김' : '현관 열림'}</span>
                        </button>
                        <button
                            className={`${styles.iotButton} ${!gasValveOpen ? styles.active : styles.warning}`}
                            onClick={() => setGasValveOpen(!gasValveOpen)}
                        >
                            <Flame size={24} />
                            <span>{gasValveOpen ? '가스 열림' : '가스 잠김'}</span>
                        </button>
                        <button
                            className={`${styles.iotButton} ${powerSaverMode ? styles.active : ''}`}
                            onClick={() => setPowerSaverMode(!powerSaverMode)}
                        >
                            <Zap size={24} />
                            <span>대기전력 {powerSaverMode ? '차단' : '공급'}</span>
                        </button>
                        <button className={styles.iotButton}>
                            <Droplets size={24} />
                            <span>누수 감지 정상</span>
                        </button>
                    </div>
                </WidgetCard>
            </div>
        </ServiceLayout>
    );
};

export default SafetyView;
