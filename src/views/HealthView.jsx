import React, { useState } from 'react';
import ServiceLayout from '../layouts/ServiceLayout';
import WidgetCard from '../components/WidgetCard';
import { Activity, Heart, Calendar, Pill, Stethoscope, FileText, ChevronRight } from 'lucide-react';
import styles from './HealthView.module.css';

const HealthView = ({ onBack, chatContent }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <ServiceLayout
            title="건강 연구소 (Health Lab)"
            onBack={onBack}
            onChatToggle={() => setIsChatOpen(!isChatOpen)}
            isChatOpen={isChatOpen}
            chatContent={chatContent}
        >
            <div className={styles.grid}>
                {/* 1. Health Summary (Vitals) */}
                <WidgetCard title="나의 건강 요약" icon={Activity} className={styles.vitalsCard}>
                    <div className={styles.vitalsGrid}>
                        <div className={styles.vitalItem}>
                            <span className={styles.vitalLabel}>혈압</span>
                            <span className={styles.vitalValue} style={{ color: '#ef4444' }}>120/80</span>
                            <span className={styles.vitalUnit}>mmHg</span>
                            <span className={styles.vitalStatus}>정상</span>
                        </div>
                        <div className={styles.vitalItem}>
                            <span className={styles.vitalLabel}>혈당</span>
                            <span className={styles.vitalValue} style={{ color: '#f59e0b' }}>95</span>
                            <span className={styles.vitalUnit}>mg/dL</span>
                            <span className={styles.vitalStatus}>식후 2H</span>
                        </div>
                        <div className={styles.vitalItem}>
                            <span className={styles.vitalLabel}>체중</span>
                            <span className={styles.vitalValue}>68.5</span>
                            <span className={styles.vitalUnit}>kg</span>
                            <span className={styles.vitalStatus}>-0.5kg</span>
                        </div>
                    </div>
                    <div className={styles.vitalAction}>
                        <button className={styles.updateButton}>기기 연동하여 측정하기</button>
                    </div>
                </WidgetCard>

                {/* 2. Telemedicine */}
                <WidgetCard title="비대면 진료" icon={Stethoscope} className={styles.teleCard}>
                    <div className={styles.menuList}>
                        <button className={styles.menuItem}>
                            <div className={styles.menuIconBg}><Stethoscope size={20} color="#3b82f6" /></div>
                            <div className={styles.menuText}>
                                <span className={styles.menuTitle}>의사 선생님 진료 요청</span>
                                <span className={styles.menuDesc}>가장 빠른 내과/가정의학과 찾기</span>
                            </div>
                            <ChevronRight size={20} color="var(--text-tertiary)" />
                        </button>
                        <button className={styles.menuItem}>
                            <div className={styles.menuIconBg}><FileText size={20} color="#10b981" /></div>
                            <div className={styles.menuText}>
                                <span className={styles.menuTitle}>처방전 관리</span>
                                <span className={styles.menuDesc}>최근 처방 내역 및 약국 전송</span>
                            </div>
                            <ChevronRight size={20} color="var(--text-tertiary)" />
                        </button>
                    </div>
                </WidgetCard>

                {/* 3. Medication */}
                <WidgetCard title="복약 알림" icon={Pill} className={styles.medCard}>
                    <div className={styles.medTimeline}>
                        <div className={`${styles.medItem} ${styles.done}`}>
                            <span className={styles.medTime}>08:00</span>
                            <span className={styles.medName}>혈압약, 비타민</span>
                            <span className={styles.medCheck}>복용완료</span>
                        </div>
                        <div className={`${styles.medItem} ${styles.active}`}>
                            <span className={styles.medTime}>13:00</span>
                            <span className={styles.medName}>관절영양제</span>
                            <button className={styles.takePillBtn}>복용하기</button>
                        </div>
                        <div className={styles.medItem}>
                            <span className={styles.medTime}>19:00</span>
                            <span className={styles.medName}>혈압약</span>
                        </div>
                    </div>
                </WidgetCard>
            </div>
        </ServiceLayout>
    );
};

export default HealthView;
