import React, { useEffect, useState } from 'react';
import { Activity, Bell, FileText, Stethoscope } from 'lucide-react';
import styles from './HealthLabView.module.css';

const HealthLabView = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/health-data');
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to fetch health data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className={styles.container}>Loading Health Data...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>건강연구소</h1>
                <div style={{ display: 'flex', gap: '0.5rem', color: '#888' }}>
                    <Activity size={20} />
                    <span>Real-time KDCA Data</span>
                </div>
            </div>

            {/* AI Briefing */}
            <div className={styles.briefingSection}>
                <div className={styles.briefingTitle}>
                    <Stethoscope size={20} />
                    <span>안심씨 브리핑</span>
                </div>
                <p>{data?.summary || "데이터를 분석 중입니다..."}</p>
            </div>

            <div className={styles.grid}>
                {/* Infectious Disease Alerts */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>
                        <Bell size={18} style={{ display: 'inline', marginRight: '8px' }} />
                        감염병 발생 정보
                    </h2>
                    {data?.alerts?.map((alert) => (
                        <div key={alert.id} className={styles.alertItem}>
                            <div>
                                <div style={{ fontWeight: 500 }}>{alert.disease}</div>
                                <div style={{ fontSize: '0.85rem', color: '#888' }}>{alert.message}</div>
                            </div>
                            <div className={styles.alertBadges}>
                                <span className={`${styles.badge} ${styles[alert.level_color]}`}>
                                    {alert.level}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Health News */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>
                        <FileText size={18} style={{ display: 'inline', marginRight: '8px' }} />
                        건강 소식
                    </h2>
                    {data?.news?.map((news) => (
                        <a key={news.id} href={news.url} className={styles.newsItem}>
                            <div className={styles.newsTitle}>{news.title}</div>
                            <div className={styles.newsMeta}>
                                {news.source} • {news.date}
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HealthLabView;
