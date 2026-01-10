import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Play, Pause } from 'lucide-react';
import styles from './VoiceSettingsModal.module.css';

const VoiceSettingsModal = ({ onClose, settings, onUpdateSettings }) => {
    // Local state initialized from props
    const [showSubtitle, setShowSubtitle] = useState(settings?.showSubtitle ?? true);
    const [voiceSpeed, setVoiceSpeed] = useState(settings?.voiceSpeed ?? 1.1);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState(settings?.selectedVoiceURI || null);

    // Available system voices
    const [availableVoices, setAvailableVoices] = useState([]);
    const [playingPreview, setPlayingPreview] = useState(null); // voiceURI of currently playing
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

    // Mock names from the image to map to real voices if possible, or just use as placeholders
    // Image names: Kyrin, Tylis, Torma, Mylva, Syla, Gravo, Velox, Solva
    // We will try to get real Korean voices and map them. If only 1-2 Korean voices exist (common),
    // we might just duplicate them or show what's there. 
    // REALITY CHECK: Most browsers have 1-2 Korean voices (Google 한국어, Yuna etc).
    // Let's just list the REAL available Korean voices but style them nicely.

    useEffect(() => {
        const loadVoices = () => {
            if (!synthRef.current) return;
            const voices = synthRef.current.getVoices();
            // Filter for Korean voices or just all if none? Prefer KR.
            const krVoices = voices.filter(v => v.lang.includes('ko') || v.lang.includes('KR'));

            // Deduplicate voices based on voiceURI to prevent "double check" UI bugs
            const uniqueVoices = [];
            const seenURIs = new Set();

            for (const v of krVoices) {
                if (!seenURIs.has(v.voiceURI)) {
                    seenURIs.add(v.voiceURI);
                    uniqueVoices.push(v);
                }
            }

            // If no KR voices found (rare but possible), fall back to all or English?
            // Let's assume at least one.
            const finalList = uniqueVoices.length > 0 ? uniqueVoices : voices.slice(0, 5); // Fallback
            setAvailableVoices(finalList);

            // Set default selected if not set
            if (!selectedVoiceURI && finalList.length > 0) {
                // Default to first
                setSelectedVoiceURI(finalList[0].voiceURI);
                // Also update parent immediately? No, wait for user action or save?
                // Usually settings apply immediately in this kind of UI.
            }
        };

        loadVoices();

        // Chrome loads voices asynchronously
        if (synthRef.current && synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = loadVoices;
        }
    }, [selectedVoiceURI]);

    // Apply changes immediately to parent as per modern UX
    useEffect(() => {
        onUpdateSettings({
            showSubtitle,
            voiceSpeed,
            selectedVoiceURI
        });
    }, [showSubtitle, voiceSpeed, selectedVoiceURI]);

    const handlePlayPreview = (voice) => {
        if (playingPreview === voice.voiceURI) {
            synthRef.current.cancel();
            setPlayingPreview(null);
            return;
        }

        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance("안녕하세요, 안심씨입니다.");
        utterance.voice = voice;
        utterance.rate = voiceSpeed;
        utterance.lang = 'ko-KR';

        utterance.onend = () => setPlayingPreview(null);

        synthRef.current.speak(utterance);
        setPlayingPreview(voice.voiceURI);
    };

    // Slider calculations
    // Range 0.5 to 2.0. Center 1.0.
    // Display thumb position manually or use input range
    const handleSliderChange = (e) => {
        setVoiceSpeed(parseFloat(e.target.value));
    };

    return (
        <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                    <div className={styles.title}>음성 및 언어</div>
                    <div style={{ width: 36 }}></div> {/* Spacer for balance */}
                </div>

                {/* Content */}
                <div className={styles.content}>

                    {/* Language / Subtitle Section */}
                    <div>
                        <div className={styles.sectionTitle}>언어</div>
                        <div className={styles.card}>
                            <div className={styles.toggleRow}>
                                <div className={styles.labelGroup}>
                                    <div className={styles.mainLabel}>자막</div>
                                    <div className={styles.subLabel}>답변 기록 보기</div>
                                </div>
                                <div
                                    className={`${styles.switch} ${showSubtitle ? styles.active : ''}`}
                                    onClick={() => setShowSubtitle(!showSubtitle)}
                                >
                                    <div className={styles.knob}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Voices Section */}
                    <div>
                        <div className={styles.sectionTitle}>음성</div>
                        <div className={styles.card}>
                            {availableVoices.length === 0 ? (
                                <div style={{ padding: '1rem', color: '#94a3b8', textAlign: 'center' }}>
                                    사용 가능한 음성이 없습니다.
                                </div>
                            ) : (
                                availableVoices.map((voice, idx) => {
                                    /* Use mock names if we match known system voices, or just Voice 1, 2 */
                                    const displayName = voice.name
                                        .replace('Google', '')
                                        .replace('한국어', '')
                                        .replace(/\(.*\)/g, '') // Remove anything in parens
                                        .trim() || `음성 ${idx + 1}`;
                                    const isSelected = selectedVoiceURI === voice.voiceURI;

                                    return (
                                        <div
                                            key={voice.voiceURI}
                                            className={styles.voiceItem}
                                            onClick={() => setSelectedVoiceURI(voice.voiceURI)}
                                        >
                                            <div className={styles.voiceInfo}>
                                                <button
                                                    className={`${styles.playButton} ${playingPreview === voice.voiceURI ? styles.playing : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePlayPreview(voice);
                                                    }}
                                                >
                                                    {playingPreview === voice.voiceURI ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" style={{ marginLeft: 2 }} />}
                                                </button>
                                                <span className={styles.voiceName}>
                                                    {/* Random name mapping for fun if generic? No, keep honest for now or map to image names randomly */}
                                                    {/* Let's mimic the image names randomly for the first few to look nice if they are generic */}
                                                    {['Kyrin', 'Tylis', 'Torma', 'Mylva', 'Syla'][idx] || displayName}
                                                </span>
                                            </div>
                                            {isSelected && <Check size={20} className={styles.checkIcon} />}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Speed Slider Section */}
                    <div>
                        <div className={styles.sectionTitle}>AI 말하기 속도</div>
                        <div className={`${styles.card} ${styles.sliderCard}`}>
                            <div className={styles.sliderContainer}>
                                <div className={styles.customSliderWrapper}>
                                    {/* Fill Bar */}
                                    <div
                                        className={styles.fillBar}
                                        style={{ width: `${((voiceSpeed - 0.5) / 1.5) * 100}%` }}
                                    ></div>

                                    {/* Native Input (Hidden but functional) */}
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2.0"
                                        step="0.1"
                                        value={voiceSpeed}
                                        onChange={handleSliderChange}
                                        className={styles.sliderInput}
                                    />

                                    {/* Thumb visualization */}
                                    <div
                                        className={styles.thumbDisplay}
                                        style={{
                                            left: `calc(${((voiceSpeed - 0.5) / 1.5) * 100}% - 20px)`
                                        }}
                                    >
                                        {voiceSpeed}x
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default VoiceSettingsModal;
