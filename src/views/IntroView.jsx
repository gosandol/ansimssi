import React, { useState } from 'react';
import { Settings, ArrowRight, PenSquare, Layers, Box } from 'lucide-react';
import LoginModal from '../components/modals/LoginModal';
import SettingsModal from '../components/modals/SettingsModal';
import styles from './IntroView.module.css';

import introCabinet from '../assets/intro_cabinet.png';
import introWoman from '../assets/intro_woman.png';

const IntroView = ({ onComplete }) => {
    const [activeTab, setActiveTab] = useState('threads'); // 'threads' or 'spaces'
    const [showLogin, setShowLogin] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const content = {
        threads: {
            title: "스레드 시작하기",
            description: "호기심과 지식이 가득한 새로운 세계로 안내할 스레드를 만들어 보세요",
            buttonText: "스레드 만들기",
            icon: <Layers size={20} />,
            image: introWoman
        },
        spaces: {
            title: "공간 시작하기",
            description: "스레드를 체계적으로 정리하고 탐구를 향한 여정 속에서 다른 이들과 협력해 보세요",
            buttonText: "공간 만들기",
            icon: <Box size={20} />,
            image: introCabinet
        }
    };

    const currentContent = content[activeTab];

    const handleActionClick = () => {
        setShowLogin(true);
    };

    return (
        <div className={styles.container}>
            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

            <div className={styles.header}>
                <button className={styles.iconButton} onClick={() => setShowSettings(true)}>
                    <Settings size={24} />
                </button>
                {/* Top Right Arrow acts as "Skip" to App */}
                <button className={`skip-button ${styles.iconButton}`} onClick={onComplete} aria-label="Skip Intro">
                    <ArrowRight size={24} />
                </button>
            </div>

            <div className={styles.cardContainer}>
                <div className={styles.imageWrapper}>
                    <img src={currentContent.image} alt={currentContent.title} className={styles.bgImage} />
                    <div className={styles.overlayGradient} />
                </div>

                <div className={styles.contentOverlay}>
                    <h2 className={styles.title}>{currentContent.title}</h2>
                    <p className={styles.description}>{currentContent.description}</p>
                    <button className={styles.actionButton} onClick={handleActionClick}>
                        {currentContent.icon}
                        <span>{currentContent.buttonText}</span>
                    </button>
                </div>
            </div>

            <div className={styles.bottomNav}>
                <div className={styles.tabToggle}>
                    <button
                        className={`${styles.tab} ${activeTab === 'threads' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('threads')}
                    >
                        <Layers size={20} />
                        <span>스레드</span>
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'spaces' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('spaces')}
                    >
                        <Box size={20} />
                        <span>공간</span>
                    </button>

                    {/* Animation indicator background if we want standard sliding pill */}
                    <div className={`${styles.activeIndicator} ${activeTab === 'spaces' ? styles.shiftRight : ''}`} />
                </div>

                <button className={styles.fabButton} onClick={handleActionClick}>
                    <PenSquare size={24} />
                </button>
            </div>
        </div>
    );
};

export default IntroView;
