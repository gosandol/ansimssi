import React from 'react';
import { Mic, Check, X } from 'lucide-react';
import styles from './VoicePermissionModal.module.css';

const VoicePermissionModal = ({ onAllow, onClose }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={24} />
                </button>

                <div className={styles.iconWrapper}>
                    <div className={styles.pulseRing}></div>
                    <Mic size={48} className={styles.micIcon} />
                </div>

                <h2 className={styles.title}>안심씨와 대화를 시작할까요?</h2>
                <p className={styles.description}>
                    음성 대화 기능을 사용하려면<br />
                    <strong>마이크 접근 권한</strong>이 필요합니다.
                </p>

                <div className={styles.featureList}>
                    <div className={styles.featureItem}>
                        <div className={styles.checkCircle}><Check size={14} /></div>
                        <span>실시간 음성 질의응답</span>
                    </div>
                    <div className={styles.featureItem}>
                        <div className={styles.checkCircle}><Check size={14} /></div>
                        <span>핸즈프리 대화 모드</span>
                    </div>
                </div>

                <button className={styles.allowButton} onClick={onAllow}>
                    대화 시작하기
                </button>

                <p className={styles.subtext}>
                    버튼을 누르면 브라우저의 권한 요청 팝업이 뜹니다.
                </p>
            </div>
        </div>
    );
};

export default VoicePermissionModal;
