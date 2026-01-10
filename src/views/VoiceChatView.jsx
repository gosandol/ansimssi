import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Settings } from 'lucide-react';
import styles from './VoiceChatView.module.css';
import { API_BASE_URL } from '../lib/api_config';
import VoicePermissionModal from '../components/modals/VoicePermissionModal';
import VoiceSettingsModal from '../components/modals/VoiceSettingsModal';

const VoiceChatView = ({ isOpen, onClose }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [status, setStatus] = useState('listening'); // listening, processing, speaking
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // New Error State

    // Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [voiceSettings, setVoiceSettings] = useState({
        showSubtitle: true,
        voiceSpeed: 1.1,
        selectedVoiceURI: null,
        isHandsFree: true // Default true
    });

    // Refs
    const recognitionRef = useRef(null);
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

    // 1. Check Permission & Load Settings
    useEffect(() => {
        if (isOpen) {
            const storedPerm = localStorage.getItem('ansimssi_voice_permission');
            if (storedPerm === 'granted') {
                setHasPermission(true);
            } else {
                setHasPermission(false);
            }

            const storedSettings = localStorage.getItem('ansimssi_voice_settings');
            if (storedSettings) {
                try {
                    setVoiceSettings(prev => ({ ...prev, ...JSON.parse(storedSettings) }));
                } catch (e) { }
            }
        }
    }, [isOpen]);

    // Save Settings
    const handleUpdateSettings = (newSettings) => {
        setVoiceSettings(newSettings);
        localStorage.setItem('ansimssi_voice_settings', JSON.stringify(newSettings));
    };

    // 2. Initialize Speech Recognition (Only if hasPermission)
    useEffect(() => {
        if (typeof window !== 'undefined' && hasPermission) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = 'ko-KR';

                recognition.onresult = (event) => {
                    let interim = '';
                    let final = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            final += event.results[i][0].transcript;
                        } else {
                            interim += event.results[i][0].transcript;
                        }
                    }

                    if (final) {
                        setTranscript(final);
                        handleVoiceQuery(final);
                    } else if (interim) {
                        setTranscript(interim);
                    }
                };

                recognition.onerror = (event) => {
                    console.error('Voice Recognition Error:', event.error);
                    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                        setStatus('error');
                        setErrorMessage("마이크 권한이 거부되었거나 사용할 수 없습니다.");
                        setHasPermission(false);
                        localStorage.removeItem('ansimssi_voice_permission');
                    } else if (event.error === 'no-speech') {
                        console.log("No speech detected.");
                    } else if (event.error === 'network') {
                        setStatus('error');
                        setErrorMessage("네트워크 연결을 확인해 주세요.");
                    }
                };

                recognition.onend = () => {
                    // Restarts only if listening AND hands-free is ON (default true) AND settings closed
                    // Use ref to access latest 'voiceSettings' if needed, or rely on closure (might be stale?)
                    // Closure of useEffect captures initial/dep voiceSettings. 
                    // To be safe, we added voiceSettings.isHandsFree to deps, so this effect recreates.
                    if (status === 'listening' && !showSettings && voiceSettings.isHandsFree) {
                        try {
                            console.log("Restarting recognition (Hands-Free)...");
                            recognition.start();
                        } catch (e) { /* ignore */ }
                    }
                };

                recognitionRef.current = recognition;

                // RAPID START: Start immediately if status is listening
                if (status === 'listening') {
                    try {
                        recognition.start();
                    } catch (e) { /* ignore */ }
                }

            } else {
                setStatus('error');
                setErrorMessage("이 브라우저는 음성 인식을 지원하지 않습니다.");
            }
        }
    }, [hasPermission, status, showSettings, voiceSettings.isHandsFree]);

    // 3. State Machine Controller
    useEffect(() => {
        if (!isOpen || !hasPermission || showSettings) {
            // Stop listening while settings are open
            recognitionRef.current?.stop();
            return;
        }

        const recognition = recognitionRef.current;

        if (status === 'listening') {
            try {
                recognition?.start();
            } catch (e) { /* Already started */ }
        } else {
            recognition?.stop();
        }

        return () => {
            recognition?.stop();
            synthRef.current?.cancel();
        };
    }, [isOpen, status, hasPermission, showSettings]);


    const handleVoiceQuery = async (query) => {
        setStatus('processing');

        // Ensure UI updates
        setAiResponse('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });
            const data = await response.json();
            const answer = data.answer || "죄송합니다. 답변을 찾을 수 없습니다.";
            setAiResponse(answer);
            speakResponse(answer);
        } catch (error) {
            console.error(error);
            const errorMsg = "오류가 발생했습니다.";
            setAiResponse(errorMsg);
            speakResponse(errorMsg);
        }
    };

    const speakResponse = (text) => {
        setStatus('speaking');

        // Strip functionality for cleaner TTS
        const cleanText = text.replace(/[*#]/g, '').replace(/\[.*?\]/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ko-KR';
        utterance.rate = voiceSettings.voiceSpeed || 1.1; // Use setting

        // Set Voice if selected
        if (voiceSettings.selectedVoiceURI && synthRef.current) {
            const voices = synthRef.current.getVoices();
            const selected = voices.find(v => v.voiceURI === voiceSettings.selectedVoiceURI);
            if (selected) utterance.voice = selected;
        }

        utterance.onend = () => {
            // After speaking, go back to listening
            setTranscript(''); // Clear old user query
            setStatus('listening');
        };

        synthRef.current?.cancel(); // Stop any previous
        synthRef.current?.speak(utterance);
    };

    const handleAllowPermission = (isHandsFree = true) => {
        // Save Hands-Free preference
        const newSettings = { ...voiceSettings, isHandsFree };
        setVoiceSettings(newSettings);
        localStorage.setItem('ansimssi_voice_settings', JSON.stringify(newSettings));

        // We can't actually "request" reliably via JS API without a stream, 
        // but starting recognition usually triggers the prompt.
        // We set state to true, which triggers the useEffect -> recognition.start() -> Prompt.
        localStorage.setItem('ansimssi_voice_permission', 'granted');
        setHasPermission(true);
    };

    const handleClose = () => {
        recognitionRef.current?.stop();
        synthRef.current?.cancel();
        setStatus('listening'); // Reset for next time
        setTranscript('');
        setAiResponse('');
        onClose();
    };

    if (!isOpen) return null;

    // View: Permission Modal
    if (!hasPermission) {
        return (
            <VoicePermissionModal
                onAllow={handleAllowPermission}
                onClose={handleClose}
            />
        );
    }

    // View: Main Futuristic Interface
    const getStatusClass = () => {
        if (status === 'error') return ''; // No specific class for container on error, handled inline or generic
        if (status === 'listening') return styles.stateListening;
        if (status === 'processing') return styles.stateProcessing;
        if (status === 'speaking') return styles.stateSpeaking;
        return '';
    };

    const getStatusText = () => {
        if (status === 'error') return errorMessage || '오류가 발생했습니다.';
        if (status === 'listening') return '듣고 있습니다...';
        if (status === 'processing') return '생각하는 중...';
        if (status === 'speaking') return '안심씨가 답변 중입니다';
        return '';
    };

    return (
        <div className={styles.overlay}>
            {/* Settings Modal */}
            {showSettings && (
                <VoiceSettingsModal
                    onClose={() => setShowSettings(false)}
                    settings={voiceSettings}
                    onUpdateSettings={handleUpdateSettings}
                />
            )}

            {/* Top Right Settings */}
            <button
                className={styles.settingsButton}
                onClick={() => setShowSettings(true)}
                style={{ opacity: showSettings ? 0 : 1 }}
            >
                <Settings size={24} />
            </button>

            <div className={`${styles.container} ${getStatusClass()}`}>
                {/* Visualizer */}
                <div className={styles.visualizerContainer}>
                    {status === 'error' ? (
                        <div style={{ color: '#ef4444', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <MicOff size={64} style={{ opacity: 0.8, marginBottom: '1rem' }} />
                            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>연결 끊김</div>
                        </div>
                    ) : (
                        <div className={styles.orbWrapper}>
                            <div className={styles.orbRing} style={{ animationDelay: '0s' }}></div>
                            <div className={styles.orbRing} style={{ animationDelay: '0.5s' }}></div>
                            <div className={styles.orb}></div>
                        </div>
                    )}
                </div>

                {/* Status & Content */}
                <div className={styles.contentArea}>
                    <div className={styles.statusLabel} style={{ color: status === 'error' ? '#ef4444' : '' }}>
                        {getStatusText()}
                    </div>

                    {/* Transcript or Error Action */}
                    {status === 'error' ? (
                        <div style={{ textAlign: 'center' }}>
                            <button
                                className={styles.retryButton}
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.8rem 2rem',
                                    borderRadius: '30px',
                                    border: '1px solid #ef4444',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    fontSize: '1rem',
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    setStatus('listening');
                                    setErrorMessage('');
                                }}
                            >
                                다시 시도
                            </button>
                        </div>
                    ) : (
                        voiceSettings.showSubtitle && (
                            <div className={styles.transcript}>
                                {status === 'speaking' ? (
                                    <span className={styles.aiResponse}>{aiResponse}</span>
                                ) : (
                                    <span className={styles.userTranscript}>{transcript || "말씀해 주세요..."}</span>
                                )}
                            </div>
                        )
                    )}
                </div>

                {/* Bottom Control Bar */}
                <div className={styles.bottomBar}>
                    {/* Bottom Left Close */}
                    <button className={styles.bottomButton} onClick={handleClose}>
                        <X size={28} />
                    </button>

                    {/* Bottom Right Mic */}
                    {status !== 'error' && (
                        <button
                            className={`${styles.bottomButton} ${styles.micButton} ${status === 'listening' ? styles.active : ''}`}
                            onClick={() => {
                                if (status === 'listening') {
                                    setStatus('processing'); // Manual stop
                                    recognitionRef.current?.stop();
                                } else {
                                    setStatus('listening');
                                }
                            }}
                        >
                            {status === 'listening' ? <MicOff size={28} /> : <Mic size={28} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceChatView;
