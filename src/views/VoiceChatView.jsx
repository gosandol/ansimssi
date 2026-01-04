import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2 } from 'lucide-react';
import styles from './VoiceChatView.module.css';

const VoiceChatView = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState('listening'); // listening, processing, speaking
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const canvasRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false; // We want to stop after one sentence to process
                recognition.interimResults = false;
                recognition.lang = 'ko-KR';

                recognition.onresult = (event) => {
                    const text = event.results[0][0].transcript;
                    setTranscript(text);
                    handleVoiceQuery(text); // Auto-submit
                };

                recognition.onerror = (event) => {
                    console.error('Voice Recognition Error:', event.error);
                    if (event.error === 'no-speech') {
                        // Restart listening if no speech
                        // but for now let's just stay in listening or maybe prompt?
                    }
                };

                // Prevent auto-listening loop unless explicitly controlled
                recognition.onend = () => {
                    // If status is still 'listening', maybe restart? 
                    // Logic handled in useEffect triggers
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    // State Machine Effects
    useEffect(() => {
        if (!isOpen) return;

        if (status === 'listening') {
            try {
                recognitionRef.current?.start();
            } catch (e) {
                // Already started
            }
        } else if (status === 'processing' || status === 'speaking') {
            recognitionRef.current?.stop();
        }

        return () => {
            recognitionRef.current?.stop();
            synthRef.current?.cancel();
        };
    }, [isOpen, status]);

    const handleVoiceQuery = async (query) => {
        setStatus('processing');

        try {
            const response = await fetch('/api/search', {
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
        utterance.onend = () => {
            setStatus('listening'); // Loop back to listening
        };

        synthRef.current?.speak(utterance);
    };

    // Close handler
    const handleClose = () => {
        recognitionRef.current?.stop();
        synthRef.current?.cancel();
        onClose();
    };


    // Visualizer Logic (Unchanged but ensuring it runs)
    useEffect(() => {
        if (!isOpen) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const time = Date.now() / 1000;
            const centerY = canvas.height / 2;

            ctx.beginPath();
            ctx.lineWidth = 4;
            // Listening = Blue, Processing = Red, Speaking = Green
            ctx.strokeStyle = status === 'listening' ? '#4285f4' : status === 'speaking' ? '#34a853' : '#ea4335';

            for (let x = 0; x < canvas.width; x++) {
                // Amplitude higher for speaking/listening
                let amplitude = 10;
                if (status === 'listening') amplitude = 30 + Math.sin(time * 10) * 10;
                if (status === 'speaking') amplitude = 40 + Math.sin(time * 20) * 20;

                const y = centerY + Math.sin(x * 0.05 + time * 5) * amplitude * Math.sin(x * 0.01);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            animationId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, [isOpen, status]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                <button className={styles.closeButton} onClick={handleClose}>
                    <X size={32} />
                </button>

                <div className={styles.visualizerContainer}>
                    <canvas ref={canvasRef} width={600} height={200} className={styles.canvas} />
                </div>

                <div className={styles.statusText}>
                    {status === 'listening' && '듣고 있습니다...'}
                    {status === 'processing' && '생각 중...'}
                    {status === 'speaking' && '답변 중...'}
                </div>

                <div className={styles.transcript}>
                    {status === 'listening' || status === 'processing' ? transcript : aiResponse}
                </div>

                <div className={styles.controls}>
                    <button
                        className={`${styles.micButton} ${status === 'listening' ? styles.active : ''}`}
                        onClick={() => {
                            if (status === 'listening') {
                                setStatus('processing'); // Force stop/process functionality
                            } else {
                                setStatus('listening');
                            }
                        }}
                    >
                        {status === 'listening' ? <Mic size={32} /> : <MicOff size={32} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoiceChatView;
