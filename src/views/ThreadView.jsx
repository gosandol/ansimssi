import React, { useState, useEffect, useRef } from 'react';

import ImagesSection from '../components/Thread/ImagesSection';
import SourcesSection from '../components/Thread/SourcesSection';
import AcademicSection from '../components/Thread/AcademicSection'; // New
import SourcesCarousel from '../components/Thread/SourcesCarousel';
import AnswerSection from '../components/Thread/AnswerSection';
import RelatedQuestions from '../components/Thread/RelatedQuestions';
import SearchBar from '../components/SearchBar';
import { createThread, addMessage } from '../lib/db';
import styles from './ThreadView.module.css';

const ThreadView = ({ initialQuery, onSearch, activeSection = 'answer', setActiveSection, isSideChat = false }) => {
    // Mock Data Generation based on query
    const [loading, setLoading] = useState(true);
    const [threadId, setThreadId] = useState(null);

    const [sources, setSources] = useState([]);
    const [images, setImages] = useState([]);
    const [academic, setAcademic] = useState([]); // New
    const [answer, setAnswer] = useState('');
    const [disclaimer, setDisclaimer] = useState('');
    const [related, setRelated] = useState([]);

    // Removed local activeSection state since it's now passed from props

    const fetchedRef = React.useRef(false);

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
                const response = await fetch('/api/search', {
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



    // 4. Source Toggle Handler
    const [showSources, setShowSources] = useState(false);

    return (
        <div className={`${styles.container} ${isSideChat ? styles.sideChatContainer : ''}`}>
            {/* Scrollable Content Area */}
            <div className={styles.contentArea}>
                {!isSideChat && <h1 className={styles.queryTitle}>{initialQuery}</h1>}
                {isSideChat && <div className={styles.sideChatQueryBubble}>{initialQuery}</div>}

                {loading ? (
                    <div className={styles.loadingState}>
                        <span>생성 중...</span>
                    </div>
                ) : (
                    <>
                        {/* Answer Tab */}
                        {activeSection === 'answer' && (
                            <>
                                <div id="answer-section" className={styles.scrollSection}>
                                    <AnswerSection
                                        query={initialQuery}
                                        answer={answer}
                                        disclaimer={disclaimer}
                                        sources={sources}
                                        images={images}
                                        onSourceClick={() => setActiveSection('sources')}
                                    />
                                </div>
                                {/* <div className={styles.divider} /> */}
                                {/* {related.length > 0 && <RelatedQuestions questions={related} />} */}
                            </>
                        )}

                        {/* Sources Tab */}
                        {activeSection === 'sources' && (
                            <div className={styles.tabContent}>
                                <SourcesSection sources={sources} />
                            </div>
                        )}

                        {/* Academic Tab */}
                        {activeSection === 'academic' && (
                            <div className={styles.tabContent}>
                                <AcademicSection papers={academic} />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Sheet for Sources */}
            {showSources && sources.length > 0 && (
                <div className={styles.bottomSheetBackdrop} onClick={() => setShowSources(false)}>
                    <div className={styles.bottomSheetContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.bottomSheetHeader}>
                            <h3>참조 출처 ({sources.length})</h3>
                            <button onClick={() => setShowSources(false)}>✕</button>
                        </div>
                        <SourcesSection sources={sources} />
                    </div>
                </div>
            )}

            {/* Sticky Search Footer - Only in Answer Tab */}
            {activeSection === 'answer' && (
                <div className={`${styles.stickySearchWrapper} ${isSideChat ? styles.sideChatSearch : ''}`}>
                    <SearchBar onSearch={onSearch} placeholder="후속 질문하기" dropUpMode={true} />
                </div>
            )}
        </div>
    );
};

export default ThreadView;
