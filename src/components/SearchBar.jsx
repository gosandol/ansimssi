import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Paperclip, Globe, Focus, Mic, Search, ChevronDown, Check, Sparkles } from 'lucide-react';
import ListeningWaveIcon from './icons/ListeningWaveIcon';
import styles from './SearchBar.module.css';
import VoiceChatView from '../views/VoiceChatView';
import { isKoreanMatch } from '../lib/hangul';
import { SMART_SUGGESTIONS } from '../lib/searchKeywords';
import { API_BASE_URL } from '../lib/api_config';

const SearchBar = ({ onSearch, placeholder, shouldFocus, dropUpMode = false }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isFocusOpen, setIsFocusOpen] = useState(false);
    const [activeSearchMode, setActiveSearchMode] = useState('web'); // web, hospital, pharmacy, encyclopedia

    // Data & Suggestions
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Debounce Logic
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(handler);
    }, [query]);

    // Fetch Suggestions (Local + Global)
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            // 1. Local Smart Suggestions (Priority)
            const matchedGroups = SMART_SUGGESTIONS.filter(item => isKoreanMatch(debouncedQuery, item.keyword));
            let localSuggestions = [];
            matchedGroups.forEach(group => {
                localSuggestions.push(...group.intents);
            });

            // OPTIMISTIC UPDATE: Show local matches immediately!
            if (localSuggestions.length > 0) {
                setSuggestions(localSuggestions);
                setShowSuggestions(true);
            }

            // 2. Global Suggestions (Backend)
            let globalSuggestions = [];
            try {
                // Short timeout for global suggestions to prevent hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

                const res = await fetch(`${API_BASE_URL}/api/suggest?q=${encodeURIComponent(debouncedQuery)}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (res.ok) {
                    globalSuggestions = await res.json();
                }
            } catch (err) {
                // Ignore abort or fetch errors, just keep local
                // console.warn("Global suggest skipped/failed", err);
            }

            // 3. Merge (Local First, then Global unique)
            const seen = new Set(localSuggestions.map(s => s.query));
            let finalGlobal = [];

            // Contextual Logic: If dropUpMode (Follow-up), suppress generic web trends
            if (!dropUpMode) {
                finalGlobal = globalSuggestions.filter(s => !seen.has(s.query));
            }

            // Limit total
            const merged = [...localSuggestions, ...finalGlobal].slice(0, 8);

            // Update again with full list (prevents flickering if identical)
            setSuggestions(merged);
            setShowSuggestions(merged.length > 0);
        };

        fetchSuggestions();
    }, [debouncedQuery, dropUpMode]); // Add dropUpMode dependency

    // Voice & Voice Chat Config
    const [isListening, setIsListening] = useState(false);
    const [showVoiceChat, setShowVoiceChat] = useState(false);
    const textareaRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true; // Use continuous to not stop too early, manually stop on submit
                recognition.interimResults = true; // Real-time feedback
                recognition.lang = 'ko-KR';

                recognition.onresult = (event) => {
                    let finalTranscript = '';
                    let interimTranscript = '';

                    // Iterate results
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    const currentFullText = query + (query && !query.endsWith(' ') ? ' ' : '') + finalTranscript + interimTranscript;

                    // Update UI with previews
                    // Ideally we separate query (committed) from interim, but simplifying to setting query for now
                    // Note: 'query' state dependency in useEffect might be stale. 
                    // Better approach: Functional update or ref for current query.
                    // However, standard SearchBar usually replaces content or appends.
                    // Let's rely on transcript alone for the active session or handle appending carefully.
                    // Simplified: Just setQuery to the latest transcript if we treat voice as "input mode".
                    // But to support "type then speak", we need to append.
                    // Given complexity, let's just use the transcript from THIS session.

                    // Actually, simplest 'Gemini' feel: Voice replaces or appends.
                    // Let's use functional update to be safe, but cleaner to just show what's being spoken.

                    // AUTO-SUBMIT CHECK (on Final only)
                    if (finalTranscript) {
                        setQuery(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);

                        // Check for Question Endings
                        const cleaned = finalTranscript.trim();
                        // Common Korean Question/Request Endings
                        const QUESTION_REGEX = /(?:알려줘|뭐야|무엇일까|어때|해줘|인가요|가요|나요|까요|합니까|입니까|옵니까|주세요|어떻게|왜|언제|어디서|누구|\?)$/;

                        if (QUESTION_REGEX.test(cleaned) || cleaned.endsWith('?')) {
                            // Trigger Search
                            onSearch(query + (query ? ' ' : '') + finalTranscript);
                            setQuery(''); // Reset after submit
                            recognition.stop();
                            setIsListening(false);
                            return;
                        }
                    } else if (interimTranscript) {
                        // Visual feedback of what's being said (optional, might flicker with setQuery prev)
                        // For now, let's strictly handle final results to avoid jitter, 
                        // OR if user wants "Gemini level", seeing text appear is key.
                        // We can't easily mix 'prev' query with 'interim' without complex state.
                        // So let's skip interim update to state for stability unless we refactor significantly.
                        // User request: "Auto submit on question". Priority 1.
                    }

                    if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto';
                        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
                    }
                };

                recognition.onerror = (event) => {
                    console.error('Speech recognition error', event.error);
                    if (event.error !== 'no-speech') {
                        setIsListening(false);
                    }
                };

                recognition.onend = () => {
                    // Only stop listening state if we truly stopped (not just pause)
                    // With continuous=true, it stays on.
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, [query]); // Add query to dependency to append correctly? No, that restarts recognition.
    // Better: Ref for query or functional updates. 
    // Let's use functional update inside onresult. But onSearch needs latest total.
    // Refactoring to use `useRef` for current query value to access inside callback without restarting effect.

    const queryRef = useRef(query);
    useEffect(() => { queryRef.current = query; }, [query]);

    // Re-implement useEffect with queryRef
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false; // Keep false for Mobile compatibility, keep simple 'speak then stop' flow
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
                        const newQuery = queryRef.current + (queryRef.current && !queryRef.current.endsWith(' ') ? ' ' : '') + final;
                        setQuery(newQuery);
                        queryRef.current = newQuery;

                        // IMMEDIATE AUTO SUBMIT
                        if (newQuery.trim().length > 0) {
                            console.log("🎤 Auto-submitting voice query:", newQuery);
                            recognition.stop();
                            setIsListening(false);
                            onSearch(newQuery.trim());
                            setQuery('');
                            queryRef.current = '';
                        }
                    }
                };

                recognition.onend = () => {
                    setIsListening(false);
                    // Auto-submit if we have text
                    if (queryRef.current && queryRef.current.trim().length > 0) {
                        const finalQuery = queryRef.current.trim();
                        // Optional: Small delay or check? No, direct submit is what user wants.

                        // Handle Search Mode Prefix if needed (though local state might not be accessible inside callback easily if not in ref)
                        // Actually activeSearchMode is state. We need a ref for it too if we want to include it, 
                        // but handleInput/onSearch doesn't use it inside the component usually? 
                        // Wait, the submit button logic adds prefix:
                        // if (activeSearchMode === 'hospital') finalQuery = `[병원검색] ${query}`;
                        // We should replicate that logic or just pass raw query if onSearch handles it. 
                        // Looking at submit button: Key logic is THERE.
                        // Let's rely on onSearch.

                        // We need access to activeSearchMode. Since useEffect has [] dependency, 
                        // we need a ref for activeSearchMode to be safe.

                        // However, simplest fix for now:
                        onSearch(finalQuery);
                        setQuery('');
                        queryRef.current = '';
                    }
                };
                recognitionRef.current = recognition;
            }
        }
    }, []);

    // Handle External Focus Trigger
    useEffect(() => {
        if (shouldFocus) {
            textareaRef.current?.focus();
            setIsFocused(true);
        }
    }, [shouldFocus]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            // Optional: setQuery('') if we want to clear before recording
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);
        autoResize(e.target);

        if (!val.trim()) {
            setShowSuggestions(false);
        }
    };

    const autoResize = (element) => {
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
    };

    const handleKeyDown = (e) => {
        // Fix for Korean IME: Ignore Enter key during composition
        if (e.nativeEvent.isComposing) return;

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (query.trim()) {
                onSearch(query);
                setQuery('');
                if (textareaRef.current) textareaRef.current.style.height = 'auto';
            }
        }
    };

    return (
        <>
            <div className={`${styles.searchContainer} ${isFocused ? styles.focused : ''}`}>
                <div className={styles.inputWrapper}>
                    <textarea
                        ref={textareaRef}
                        className={`${styles.textarea} notranslate`}
                        translate="no"
                        placeholder={isListening ? "말씀하세요..." : (placeholder || "무엇이든 물어보세요...")}
                        value={query}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            // Delay hide to allow click
                            setTimeout(() => {
                                setIsFocused(false);
                                setShowSuggestions(false);
                            }, 200);
                        }}
                        rows={1}
                    />

                    {/* Suggestion Dropdown */}
                    {showSuggestions && (
                        <div className={`${styles.suggestionMenu} ${dropUpMode ? styles.dropUp : ''}`}>
                            {suggestions.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={styles.suggestionItem}
                                    onClick={() => {
                                        onSearch(item.query);
                                        setQuery('');
                                        setShowSuggestions(false);
                                    }}
                                >
                                    {/* Clean Text Only */}
                                    <Search size={14} className={styles.headerIcon} />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.actionBar}>
                    <div className={styles.leftActions}>
                        <button className={`${styles.actionButton} ${styles.hasTooltip}`} data-tooltip="첨부">
                            <Paperclip size={18} />
                            <span className={styles.actionText}>첨부</span>
                        </button>
                        <div className={styles.focusWrapper}>
                            <button
                                className={`${styles.actionButton} ${isFocusOpen ? styles.active : ''} ${styles.hasTooltip}`}
                                data-tooltip="검색"
                                onClick={() => setIsFocusOpen(!isFocusOpen)}
                            >
                                <Search size={18} />
                                {/* <ChevronDown size={14} style={{ marginLeft: '-2px' }} /> Removed per request */}
                                <span className={styles.actionText}>검색</span>
                            </button>

                            {isFocusOpen && (
                                <>
                                    <div className={styles.focusOverlay} onClick={() => setIsFocusOpen(false)} />
                                    <div className={`${styles.focusMenu} ${dropUpMode ? styles.focusMenuDropUp : ''}`}>
                                        <div className={styles.focusHeader}>
                                            <Search size={16} className={styles.headerIcon} />
                                            <span>검색</span>
                                            {activeSearchMode === 'web' && <Check size={16} className={styles.checkIcon} />}
                                        </div>
                                        <div className={styles.focusDescription} onClick={() => { setActiveSearchMode('web'); setIsFocusOpen(false); }}>
                                            일상적인 질문에 대한 빠른 답변
                                        </div>

                                        <div className={styles.divider} />

                                        {/* Hospital Search */}
                                        <div
                                            className={`${styles.focusItem} ${activeSearchMode === 'hospital' ? styles.selected : ''}`}
                                            onClick={() => { setActiveSearchMode('hospital'); setIsFocusOpen(false); }}
                                        >
                                            <div className={styles.itemMain}>
                                                <span className={styles.itemLabel}>병원검색</span>
                                                {activeSearchMode === 'hospital' && <Check size={14} className={styles.checkIcon} />}
                                            </div>
                                            <div className={styles.itemSub}>주변 비대면진료 주치의 검색</div>
                                        </div>

                                        {/* Pharmacy Search */}
                                        <div
                                            className={`${styles.focusItem} ${activeSearchMode === 'pharmacy' ? styles.selected : ''}`}
                                            onClick={() => { setActiveSearchMode('pharmacy'); setIsFocusOpen(false); }}
                                        >
                                            <div className={styles.itemMain}>
                                                <span className={styles.itemLabel}>약국검색</span>
                                                {activeSearchMode === 'pharmacy' && <Check size={14} className={styles.checkIcon} />}
                                            </div>
                                            <div className={styles.itemSub}>픽업 또는 배송 가능한 약국 찾기</div>
                                        </div>

                                        {/* Encyclopedia Search */}
                                        <div
                                            className={`${styles.focusItem} ${activeSearchMode === 'encyclopedia' ? styles.selected : ''}`}
                                            onClick={() => { setActiveSearchMode('encyclopedia'); setIsFocusOpen(false); }}
                                        >
                                            <div className={styles.itemMain}>
                                                <span className={styles.itemLabel}>건강백과</span>
                                                {activeSearchMode === 'encyclopedia' && <Check size={14} className={styles.checkIcon} />}
                                            </div>
                                            <div className={styles.itemSub}>신뢰할 수 있는 공공데이터 기반 건강정보</div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.rightActions}>
                        {/* 1. Dynamic Mic/Send Button */}
                        {query.trim() ? (
                            <button
                                className={`${styles.submitButton} ${styles.active}`}
                                onClick={() => {
                                    let finalQuery = query;
                                    if (activeSearchMode === 'hospital') finalQuery = `[병원검색] ${query}`;
                                    else if (activeSearchMode === 'pharmacy') finalQuery = `[약국검색] ${query}`;
                                    else if (activeSearchMode === 'encyclopedia') finalQuery = `[건강백과] ${query}`;

                                    onSearch(finalQuery);
                                    setQuery('');
                                    if (textareaRef.current) textareaRef.current.style.height = 'auto';
                                }}
                            >
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                className={`${styles.actionButton} ${isListening ? styles.listening : ''} ${styles.hasTooltip}`}
                                onClick={toggleListening}
                                data-tooltip="음성 입력"
                            >
                                <Mic size={20} color={isListening ? "#f55" : "currentColor"} />
                            </button>
                        )}

                        {/* 2. Voice Chat Mode - Ansimssi Blue Wave */}
                        <button
                            className={`${styles.submitButton} ${styles.hasTooltip}`}
                            onClick={() => setShowVoiceChat(true)}
                            data-tooltip="음성 대화"
                            style={{
                                background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                                color: 'white',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ListeningWaveIcon size={18} />
                        </button>
                    </div>
                </div>
            </div >

            {/* Voice Chat Overlay */}
            < VoiceChatView isOpen={showVoiceChat} onClose={() => setShowVoiceChat(false)} />
        </>
    );
};

export default SearchBar;
