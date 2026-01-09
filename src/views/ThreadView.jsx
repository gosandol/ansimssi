import React, { useState, useEffect, useRef } from 'react';

import ImagesSection from '../components/Thread/ImagesSection';
import SourcesSection from '../components/Thread/SourcesSection'; // Keep for Modal
import AcademicSection from '../components/Thread/AcademicSection';
import SourcesRow from '../components/Thread/SourcesRow'; // NEW
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
    const [viewingDetailedAcademic, setViewingDetailedAcademic] = useState(false); // If we want separate modal for academic

    // Mock Data Generation based on query
    const [loading, setLoading] = useState(true);
    const [threadId, setThreadId] = useState(null);

    // Context for Personalization
    const { currentProfile } = useFamily();
    const [loadingMessage, setLoadingMessage] = useState("분석 중...");

    const [sources, setSources] = useState([]);
    const [images, setImages] = useState([]);
    const [academic, setAcademic] = useState([]); // New
    const [answer, setAnswer] = useState('');
    const [disclaimer, setDisclaimer] = useState('');
    const [related, setRelated] = useState([]);

    // Removed local activeSection state since it's now passed from props

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

    useEffect(() => {
        // Reset state for new query
        fetchedRef.current = false;

        // 1. Create Thread (Idempotent-ish check) - Wrapped in try-catch to allow UI progress even if DB fails
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

        // 2. Perform Search
        const performSearch = async () => {
            // Prevent duplicate fetches if Strict Mode invokes twice rapidly for SAME query
            // But allow re-fetch if query changed (dependency array handles trigger)

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
                    body: JSON.stringify({ query: initialQuery })
                });

                if (!response.ok) throw new Error('Search failed');

                const data = await response.json();
                setSources(data.sources || []);
                setImages(data.images || []);
                setAcademic(data.academic || []); // New
                setAnswer(data.answer || "");
                setDisclaimer(data.disclaimer || "");
                setRelated(data.related_questions || []);
            } catch (error) {
                console.error("Search Error:", error);
                setAnswer("죄송합니다. 검색 중 오류가 발생했습니다. 다시 시도해 주세요.");
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [initialQuery]); // Re-run when query changes

    // 3. Save Assistant Message when both threadId and answer are ready
    const savedRef = React.useRef(false);
    useEffect(() => {
        const saveAssistantMessage = async () => {
            if (threadId && answer && !savedRef.current && !loading) {
                savedRef.current = true;
                // Note: We might want to save disclaimer too if schema supports it, for now just answer
                await addMessage(threadId, 'assistant', answer, sources);
            }
        };
        saveAssistantMessage();
    }, [threadId, answer, loading, sources]);

    // Update handler for follow-up searches to save messages
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



    // 4. Source Toggle Handler (Deprecated, replaced by specific modals)
    // const [showSources, setShowSources] = useState(false);

    // Gemini Sparkle Icon SVG
    const SparkleIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L14.4 9.6L20 12L14.4 14.4L12 20L9.6 14.4L4 12L9.6 9.6L12 4Z" fill="url(#sparkle_grad)" />
            <defs>
                <linearGradient id="sparkle_grad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4285F4" />
                    <stop offset="1" stopColor="#9B72CB" />
                </linearGradient>
            </defs>
        </svg>
    );

    return (
        <div className={`${styles.container} ${isSideChat ? styles.sideChatContainer : ''}`}>
            {/* Scrollable Content Area */}
            <div className={styles.contentArea}>
                {/* Header content removed per user request (Global Header handles it) */}

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

                        {/* Sources & Related Questions removed per user request */}

                        <div style={{ height: '120px' }}></div>
                    </div>
                )}

            </div>

            {/* Bottom Sheet for Web Sources */}
            {
                viewingDetailedSources && (
                    <div className={styles.bottomSheetBackdrop} onClick={() => setViewingDetailedSources(false)}>
                        <div className={styles.bottomSheetContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.bottomSheetHeader}>
                                <h3>참조 출처 전체보기</h3>
                                <button onClick={() => setViewingDetailedSources(false)}>✕</button>
                            </div>
                            <SourcesSection sources={sources} />
                        </div>
                    </div>
                )
            }

            {/* Bottom Sheet for Academic Papers */}
            {
                viewingDetailedAcademic && (
                    <div className={styles.bottomSheetBackdrop} onClick={() => setViewingDetailedAcademic(false)}>
                        <div className={styles.bottomSheetContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.bottomSheetHeader}>
                                <h3>전문 임상 자료 전체보기</h3>
                                <button onClick={() => setViewingDetailedAcademic(false)}>✕</button>
                            </div>
                            <AcademicSection papers={academic} />
                        </div>
                    </div>
                )
            }

            {/* Sticky Search Footer - Always Visible in Unified Stream */}
            <div className={`${styles.stickySearchWrapper} ${isSideChat ? styles.sideChatSearch : ''}`}>
                <SearchBar onSearch={handleFollowUp} placeholder="이어지는 질문하기" dropUpMode={true} />
            </div>
        </div >
    );
};

export default ThreadView;
