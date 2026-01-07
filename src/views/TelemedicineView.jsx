import React, { useState } from 'react';
import ServiceLayout from '../layouts/ServiceLayout';
import { Stethoscope, Video, Clock, MapPin, Star, User, CheckCircle } from 'lucide-react';
import styles from './TelemedicineView.module.css';

/* 
 * Sero Doctor (Telemedicine) Service View
 * "Health Lab > Sero Doctor > Request"
 */
const TelemedicineView = ({ onBack, chatContent }) => {
    // Mode: 'home' (Selection), 'connecting', 'matched'
    const [mode, setMode] = useState('selection');
    const [selectedSymptom, setSelectedSymptom] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleSymptomSelect = (symptom) => {
        setSelectedSymptom(symptom);
        setMode('connecting');

        // Simulate matching delay
        setTimeout(() => {
            setMode('matched');
        }, 2500);
    };

    const symptoms = [
        { id: 'cold', label: '감기/몸살', icon: '🌡️' },
        { id: 'stomach', label: '소화불량/복통', icon: '💊' },
        { id: 'head', label: '두통', icon: '🤕' },
        { id: 'skin', label: '피부질환', icon: '🧴' },
        { id: 'child', label: '소아과', icon: '👶' },
        { id: 'women', label: '여성질환', icon: '👩' },
        { id: 'chronic', label: '만성질환', icon: '🩺' },
        { id: 'other', label: '기타/상담', icon: '💬' },
    ];

    return (
        <ServiceLayout
            title="새로닥터 (비대면 진료)"
            onBack={onBack}
            onChatToggle={() => setIsChatOpen(!isChatOpen)}
            isChatOpen={isChatOpen}
            chatContent={chatContent}
        >
            <div className={styles.container}>
                {/* Header / Hero */}
                <div className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroBadge}>
                            <div className={styles.liveDot}></div>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>실시간 진료 가능</span>
                        </div>
                        <h1 className={styles.heroTitle}>
                            아플 땐 참지 마세요,<br />
                            <span style={{ color: '#3b82f6' }}>AI 주치의</span>가 연결해드릴게요.
                        </h1>
                        <p className={styles.heroSub}>
                            평균 대기시간 <strong>3분</strong> • 제휴 병원 <strong>1,200+</strong>곳
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className={styles.mainContent}>

                    {/* MODE: SELECTION (Home) */}
                    {mode === 'selection' && (
                        <div className={styles.selectionMode}>
                            <h3 className={styles.sectionTitle}>어디가 불편하신가요?</h3>
                            <div className={styles.symptomGrid}>
                                {symptoms.map(sym => (
                                    <button
                                        key={sym.id}
                                        className={styles.symptomBtn}
                                        onClick={() => handleSymptomSelect(sym)}
                                    >
                                        <span className={styles.symptomIcon}>{sym.icon}</span>
                                        <span className={styles.symptomLabel}>{sym.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className={styles.recentHistory}>
                                <div className={styles.historyHeader}>
                                    <Clock size={16} />
                                    <span>최근 진료 내역</span>
                                </div>
                                <div className={styles.historyItem}>
                                    <div className={styles.historyInfo}>
                                        <span className={styles.hospitalName}>서울 바른 내과</span>
                                        <span className={styles.historyDate}>2025.12.15 • 감기약 처방</span>
                                    </div>
                                    <button className={styles.rebookBtn}>재진료</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODE: CONNECTING */}
                    {mode === 'connecting' && (
                        <div className={styles.connectingMode}>
                            <div className={styles.pulseContainer}>
                                <div className={styles.pulseRing}></div>
                                <div className={styles.pulseIcon}>
                                    <Stethoscope size={48} color="white" />
                                </div>
                            </div>
                            <h2 className={styles.connectingTitle}>
                                {selectedSymptom?.label} 전문 의사 선생님을<br />찾고 있습니다...
                            </h2>
                            <p className={styles.connectingSub}>
                                환자분의 증상과 위치를 분석하여<br />가장 적합한 전문의를 매칭합니다.
                            </p>
                            <div className={styles.matchingSteps}>
                                <div className={`${styles.step} ${styles.completed}`}>초진 정보 분석 완료</div>
                                <div className={`${styles.step} ${styles.active}`}>제휴 병원 대기열 확인 중...</div>
                                <div className={styles.step}>최적의 전문의 매칭</div>
                            </div>
                        </div>
                    )}

                    {/* MODE: MATCHED */}
                    {mode === 'matched' && (
                        <div className={styles.matchedMode}>
                            <div className={styles.matchBadge}>
                                <CheckCircle size={16} className={styles.checkIcon} />
                                <span>매칭 성공!</span>
                            </div>

                            <div className={styles.doctorCard}>
                                <div className={styles.doctorProfile}>
                                    <div className={styles.avatarPlaceholder}>
                                        <User size={32} color="#555" />
                                    </div>
                                    <div className={styles.doctorInfo}>
                                        <h3 className={styles.doctorName}>김안심 원장님</h3>
                                        <p className={styles.doctorSpec}>내과 전문의 • 연세세브란스 수료</p>
                                        <div className={styles.doctorMeta}>
                                            <span className={styles.rating}><Star size={12} fill="#fbbf24" stroke="none" /> 4.9</span>
                                            <span className={styles.distance}><MapPin size={12} /> 1.2km (강남구)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.cardDivider}></div>
                                <div className={styles.availability}>
                                    <div className={styles.statusRow}>
                                        <span className={styles.statusDot}></span>
                                        <span>지금 바로 진료 가능</span>
                                    </div>
                                    <span className={styles.waitTime}>대기 0명</span>
                                </div>
                            </div>

                            <button className={styles.startVideoBtn}>
                                <Video size={20} />
                                <span>화상 진료 시작하기</span>
                            </button>

                            <button className={styles.cancelBtn} onClick={() => setMode('selection')}>
                                매칭 취소
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </ServiceLayout>
    );
};

export default TelemedicineView;
