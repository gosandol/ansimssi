import React, { useState, useEffect, useRef } from 'react';

import ImagesSection from '../components/Thread/ImagesSection';
import SourcesSection from '../components/Thread/SourcesSection'; // Keep for Modal
import AcademicSection from '../components/Thread/AcademicSection';
import SourcesRow from '../components/Thread/SourcesRow'; // Keep import if needed, or remove later
import AnswerSection from '../components/Thread/AnswerSection';
import RelatedQuestions from '../components/Thread/RelatedQuestions';
import SearchBar from '../components/SearchBar';
import { createThread, addMessage } from '../lib/db';
import styles from './ThreadView.module.css';
import { API_BASE_URL } from '../lib/api_config';

import { useFamily } from '../context/FamilyContext';

const ThreadView = ({ initialQuery, onSearch, activeSection = 'answer', setActiveSection, isSideChat = false }) => {
    // State for Modal View
    const [viewingDetailedSources, setViewingDetailedSources] = useState(false);
    const [viewingDetailedAcademic, setViewingDetailedAcademic] = useState(false);

    // Mock Data Generation based on query
    const [loading, setLoading] = useState(true);
    const [threadId, setThreadId] = useState(null);

    // Context for Personalization
    const { currentProfile } = useFamily();
    const [loadingMessage, setLoadingMessage] = useState("분석 중...");

    const [sources, setSources] = useState([]);
    const [images, setImages] = useState([]);
    const [academic, setAcademic] = useState([]);
    const [answer, setAnswer] = useState('');
    const [disclaimer, setDisclaimer] = useState('');
    const [related, setRelated] = useState([]);

    const fetchedRef = React.useRef(false);

    // Adaptive Loading Message Timer
    useEffect(() => {
        let timer1, timer2;
        if (loading) {
            setLoadingMessage("빠른 답변을 생성하고 있습니다...");

            // Phase 1: > 2.0s (Voice Warning Threshold)
            timer1 = setTimeout(() => {
                const name = currentProfile?.name || "회원";
                setLoadingMessage(`${name}님을 위한 최고의 답을 찾고 있습니다...`);
            }, 2000);

            // Phase 2: > 4.5s (Deep Research)
            timer2 = setTimeout(() => {
                setLoadingMessage("여러 전문 자료를 비교 분석 중입니다. 잠시만요...");
            }, 4500);
        } else {
            setLoadingMessage("완료!");
        }
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [loading, currentProfile]);

    // 1. Thread Initialization
    useEffect(() => {
        const initThread = async () => {
            try {
                if (!threadId) {
                    const newThread = await createThread(initialQuery);
                    if (newThread) {
                        setThreadId(newThread.id);
                        await addMessage(newThread.id, 'user', initialQuery);
                    }
                }
            } catch (e) {
                console.warn("DB Thread Creation Failed (Non-fatal):", e);
            }
        };
        initThread();
    }, [initialQuery]);

    // 2. Perform Streaming Search (NDJSON) with AbortController
    useEffect(() => {
        let active = true;
        const controller = new AbortController();

        const performSearch = async () => {
            // Reset State
            setLoading(true);
            setAnswer('');
            setSources([]);
            setImages([]);
            setRelated([]);
            setDisclaimer('');

            try {
                const response = await fetch(`${API_BASE_URL}/api/search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: initialQuery }),
                    signal: controller.signal
                });

                if (!response.ok) throw new Error('Search failed');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                // Removed premature setLoading(false) here to listen for first byte

                while (active) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;
                    const lines = buffer.split('\n');
                    buffer = lines.pop(); // Keep incomplete line

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const event = JSON.parse(line);
                            if (!active) break;

                            // Stop loading on first valid data packet
                            if (loading) setLoading(false);

                            if (event.type === 'meta') {
                                setSources(event.sources || []);
                                setImages(event.images || []);
                                setAcademic(event.academic || []);
                                if (event.disclaimer) setDisclaimer(event.disclaimer);
                            }
                            else if (event.type === 'content') {
                                setAnswer(prev => prev + (event.delta || ""));
                            }
                            else if (event.type === 'done') {
                                setRelated(event.related_questions || []);
                            }
                        } catch (e) {
                            console.warn("JSON Parse Error", e);
                        }
                    }
                }

            } catch (error) {
                if (error.name === 'AbortError') return;
                console.error("Search Error:", error);
                if (active) setAnswer(prev => prev + "\n\n[통신 오류가 발생했습니다.]");
            } finally {
                if (active) setLoading(false);
            }
        };

        performSearch();

        return () => {
            active = false;
            controller.abort();
        };
    }, [initialQuery]);

    // 3. Save Assistant Message
    const savedRef = React.useRef(false);
    useEffect(() => {
        const saveAssistantMessage = async () => {
            if (threadId && answer && !savedRef.current && !loading) {
                savedRef.current = true;
                await addMessage(threadId, 'assistant', answer, sources);
            }
        };
        saveAssistantMessage();
    }, [threadId, answer, loading, sources]);

    const handleFollowUp = async (query) => {
        if (threadId) {
            await addMessage(threadId, 'user', query);
        }
        onSearch(query);
    };

    const handleNavigate = (section) => {
        setActiveSection(section);
        const elementId = `${section}-section`;
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className={`${styles.container} ${isSideChat ? styles.sideChatContainer : ''}`}>
            {/* Scrollable Content Area */}
            <div className={styles.contentArea}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.loadingSpinner}></div>
                        <span className={styles.loadingText}>
                            {initialQuery}에 대해 분석 중입니다...
                        </span>
                    </div>
                ) : (
                    <div className={styles.unifiedStream}>
                        {/* Query Title in Content */}
                        <div className={styles.queryDisplay}>
                            {initialQuery}
                        </div>

                        <AnswerSection
                            query={initialQuery}
                            answer={answer}
                            disclaimer={disclaimer}
                            sources={sources}
                            images={images}
                            onSourceClick={() => setViewingDetailedSources(true)}
                        />

                        {/* NO SourcesRow */}
                        {/* NO RelatedQuestions */}

                        <div style={{ height: '120px' }}></div>
                    </div>
                )}
            </div>

            {/* Bottom Sheet for Web Sources */}
            {viewingDetailedSources && (
                <div className={styles.bottomSheetBackdrop} onClick={() => setViewingDetailedSources(false)}>
                    <div className={styles.bottomSheetContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.bottomSheetHeader}>
                            <h3>참조 출처 전체보기</h3>
                            <button onClick={() => setViewingDetailedSources(false)}>✕</button>
                        </div>
                        <SourcesSection sources={sources} />
                    </div>
                </div>
            )}

            {/* Bottom Sheet for Academic Papers */}
            {viewingDetailedAcademic && (
                <div className={styles.bottomSheetBackdrop} onClick={() => setViewingDetailedAcademic(false)}>
                    <div className={styles.bottomSheetContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.bottomSheetHeader}>
                            <h3>전문 임상 자료 전체보기</h3>
                            <button onClick={() => setViewingDetailedAcademic(false)}>✕</button>
                        </div>
                        <AcademicSection papers={academic} />
                    </div>
                </div>
            )}

            {/* Sticky Search Footer */}
            <div className={`${styles.stickySearchWrapper} ${isSideChat ? styles.sideChatSearch : ''}`}>
                <SearchBar onSearch={handleFollowUp} placeholder="이어지는 질문하기" dropUpMode={true} />
            </div>
        </div>
    );
};

export default ThreadView;
