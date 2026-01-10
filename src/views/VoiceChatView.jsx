import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2 } from 'lucide-react';
import styles from './VoiceChatView.module.css';
import { API_BASE_URL } from '../lib/api_config';
import VoicePermissionModal from '../components/modals/VoicePermissionModal';

const VoiceChatView = ({ isOpen, onClose }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [status, setStatus] = useState('listening'); // listening, processing, speaking
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');

    // Refs
    const recognitionRef = useRef(null);
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

    // 1. Check Permission on Mount
    useEffect(() => {
        if (isOpen) {
            const stored = localStorage.getItem('ansimssi_voice_permission');
            if (stored === 'granted') {
                setHasPermission(true);
            } else {
                setHasPermission(false);
            }
        }
    }, [isOpen]);

    // 2. Initialize Speech Recognition (Only if hasPermission)
    useEffect(() => {
        if (typeof window !== 'undefined' && hasPermission) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false; // Single turn for robustness, loop manually
                recognition.interimResults = true; // For "live" feel in transcript
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
                    if (event.error === 'no-speech' || event.error === 'network') {
                        // Silent fail or restart? For now, if listening, maybe restart
                        // But let's rely on manual toggle if it fails hard
                        if (status === 'listening') {
                            // recognition.stop();
                            // setTimeout(() => recognition.start(), 500); // Retry?
                        }
                    }
                };

                // Auto-restart loop if we are still in 'listening' state and it stopped naturally
                recognition.onend = () => {
                    if (status === 'listening') {
                        // recognition.start(); // This causes "continuous" feel
                        // INFO: Browsers might block auto-restart without user interaction.
                        // Ideally 'continuous=true' is better for this but 'false' + restart is safer for results.
                        // Let's try to restart if logic dictates.
                        try {
                            recognition.start();
                        } catch (e) { /* ignore already started */ }
                    }
                };

                recognitionRef.current = recognition;
            }
        }
    }, [hasPermission]); // Re-init if permission granted

    // 3. State Machine Controller
    useEffect(() => {
        if (!isOpen || !hasPermission) return;

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
    }, [isOpen, status, hasPermission]);


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
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0;

        utterance.onend = () => {
            // After speaking, go back to listening
            setTranscript(''); // Clear old user query
            setStatus('listening');
        };

        synthRef.current?.cancel(); // Stop any previous
        synthRef.current?.speak(utterance);
    };

    const handleAllowPermission = () => {
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
        if (status === 'listening') return styles.stateListening;
        if (status === 'processing') return styles.stateProcessing;
        if (status === 'speaking') return styles.stateSpeaking;
        return '';
    };

    const getStatusText = () => {
        if (status === 'listening') return '듣고 있습니다...';
        if (status === 'processing') return '생각하는 중...';
        if (status === 'speaking') return '안심씨가 답변 중입니다';
        return '';
    };

    return (
        <div className={styles.overlay}>
            <button className={styles.closeButton} onClick={handleClose}>
                <X size={24} />
            </button>

            <div className={`${styles.container} ${getStatusClass()}`}>
                {/* Visualizer */}
                <div className={styles.visualizerContainer}>
                    <div className={styles.orbWrapper}>
                        <div className={styles.orbRing} style={{ animationDelay: '0s' }}></div>
                        <div className={styles.orbRing} style={{ animationDelay: '0.5s' }}></div>
                        <div className={styles.orb}></div>
                    </div>
                </div>

                {/* Status & Content */}
                <div className={styles.contentArea}>
                    <div className={styles.statusLabel}>{getStatusText()}</div>

                    <div className={styles.transcript}>
                        {status === 'speaking' ? (
                            <span className={styles.aiResponse}>{aiResponse}</span>
                        ) : (
                            <span className={styles.userTranscript}>{transcript || "말씀해 주세요..."}</span>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className={styles.controls}>
                    <button
                        className={`${styles.micButton} ${status === 'listening' ? styles.active : ''}`}
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
                </div>
            </div>
        </div>
    );
};

export default VoiceChatView;
