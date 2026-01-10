import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Paperclip, Globe, Focus, Mic, Search, ChevronDown, Check, Sparkles, X, Loader2, Image as ImageIcon, FileText, Plus, HardDrive, Code, FileCode } from 'lucide-react';
import ListeningWaveIcon from './icons/ListeningWaveIcon';
import styles from './SearchBar.module.css';
import VoiceChatView from '../views/VoiceChatView';
import { isKoreanMatch } from '../lib/hangul';
import { SMART_SUGGESTIONS } from '../lib/searchKeywords';
import { API_BASE_URL } from '../lib/api_config';
import { supabase } from '../lib/supabaseClient';

const SearchBar = ({ onSearch, placeholder, shouldFocus, dropUpMode = false }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isFocusOpen, setIsFocusOpen] = useState(false);
    const [activeSearchMode, setActiveSearchMode] = useState('web'); // web, hospital, pharmacy, encyclopedia

    // File Attachment State
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false); // New: Attach Menu Toggle
    const fileInputRef = useRef(null);

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

    // Initialize Speech Recognition (Hooks Logic Preserved)
    const queryRef = useRef(query);
    useEffect(() => { queryRef.current = query; }, [query]);

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
            if (query.trim() || selectedFile) {
                handleSearchWithFile();
            }
        }
    };

    // --- File Attachment Logic ---

    const checkBucketExists = async () => {
        // Optimistic check: we assume 'chat-uploads' exists or we have public access.
        // If upload fails, we'll know.
        return true;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Simple validation: limit size to 10MB typical
            if (file.size > 10 * 1024 * 1024) {
                alert("파일 크기는 10MB 이하여야 합니다.");
                return;
            }
            setSelectedFile(file);
            // Focus input after selection
            textareaRef.current?.focus();
            setShowAttachMenu(false); // Close menu on select
        }
    };

    const handleRemoveFile = (e) => {
        e.stopPropagation(); // Prevent click-through
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const uploadFileToSupabase = async (file) => {
        try {
            // Unique path: userId(anon)/timestamp_filename
            // Since we might be anon, we just use random ID or 'anon'
            const uniqueId = Math.random().toString(36).substring(2, 15);
            const ext = file.name.split('.').pop();
            const fileName = `${Date.now()}_${uniqueId}.${ext}`;
            const filePath = `temp/${fileName}`;

            const { data, error } = await supabase.storage
                .from('chat-uploads')
                .upload(filePath, file);

            if (error) throw error;

            // Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from('chat-uploads')
                .getPublicUrl(filePath);

            return publicUrlData.publicUrl;

        } catch (error) {
            console.error("Upload failed:", error);
            // Fallback: If bucket doesn't exist or permissions fail, 
            // helpful alert for the developer/user context.
            if (error.message?.includes('Bucket not found') || error.statusCode === '404') {
                alert("서버에 'chat-uploads' 버킷이 설정되지 않았습니다. 관리자에게 문의하세요.");
            } else {
                alert("파일 업로드 중 오류가 발생했습니다.");
            }
            return null;
        }
    };

    const handleSearchWithFile = async () => {
        let finalQuery = query;

        // Mode Prefixes
        if (activeSearchMode === 'hospital') finalQuery = `[병원검색] ${query}`;
        else if (activeSearchMode === 'pharmacy') finalQuery = `[약국검색] ${query}`;
        else if (activeSearchMode === 'encyclopedia') finalQuery = `[건강백과] ${query}`;

        // If file exists, Upload First
        if (selectedFile) {
            setIsUploading(true);
            const uploadedUrl = await uploadFileToSupabase(selectedFile);
            setIsUploading(false);

            if (uploadedUrl) {
                // Append File Context to query
                // Using Markdown syntax for the image/file usually helps the LLM
                const attachmentStr = `\n\n[첨부파일](${uploadedUrl})`;
                finalQuery += attachmentStr;
            } else {
                // Upload failed, stop (alert already shown)
                return;
            }
        }

        if (!finalQuery.trim()) return;

        onSearch(finalQuery);
        setQuery('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    return (
        <>
            <div className={`${styles.searchContainer} ${isFocused ? styles.focused : ''}`}>
                <div className={styles.inputWrapper}>
                    {/* File Preview Area */}
                    {selectedFile && (
                        <div className={styles.filePreview}>
                            <div className={styles.fileInfo}>
                                {selectedFile.type.startsWith('image/') ? (
                                    <ImageIcon size={16} className={styles.fileIcon} />
                                ) : (
                                    <FileText size={16} className={styles.fileIcon} />
                                )}
                                <span className={styles.fileName}>{selectedFile.name}</span>
                                <span className={styles.fileSize}>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button className={styles.removeFileButton} onClick={handleRemoveFile}>
                                <X size={16} />
                            </button>
                        </div>
                    )}

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

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx,.txt" // Broad support for mobile
                    />

                    {/* Suggestion Dropdown */}
                    {showSuggestions && (
                        <div className={`${styles.suggestionMenu} ${dropUpMode ? styles.dropUp : ''}`}>
                            {suggestions.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={styles.suggestionItem}
                                    onClick={() => {
                                        // Handle basic suggestion without file logic complicate
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
                        {/* 1. New Plus Button Trigger for Attach Menu */}
                        <div className={styles.attachWrapper}>
                            <button
                                className={`${styles.plusButton} ${showAttachMenu ? styles.active : ''} ${styles.hasTooltip}`}
                                data-tooltip="추가 기능"
                                onClick={() => setShowAttachMenu(!showAttachMenu)}
                            >
                                <Plus size={20} />
                            </button>

                            {/* Gemini-Style Attach Menu */}
                            {showAttachMenu && (
                                <>
                                    <div className={styles.focusOverlay} onClick={() => setShowAttachMenu(false)} />
                                    <div className={`${styles.attachMenu} ${dropUpMode ? styles.attachMenuDropUp : ''}`}>

                                        <div className={styles.attachItem} onClick={() => fileInputRef.current?.click()}>
                                            <Paperclip size={18} className={styles.attachIcon} />
                                            <span>파일 업로드</span>
                                        </div>

                                        <div className={styles.attachItem} onClick={() => {
                                            if (fileInputRef.current) {
                                                fileInputRef.current.accept = "image/*";
                                                fileInputRef.current.click();
                                            }
                                        }}>
                                            <ImageIcon size={18} className={styles.attachIcon} />
                                            <span>사진</span>
                                        </div>

                                        <div className={styles.attachItem} onClick={() => alert("Google Drive 연동 준비 중입니다.")}>
                                            <HardDrive size={18} className={styles.attachIcon} />
                                            <span>Drive에서 파일 추가</span>
                                        </div>

                                        <div className={styles.attachItem} onClick={() => alert("코드 가져오기 준비 중입니다.")}>
                                            <FileCode size={18} className={styles.attachIcon} />
                                            <span>코드 가져오기</span>
                                        </div>

                                    </div>
                                </>
                            )}
                        </div>

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
                        {(query.trim() || selectedFile) ? (
                            <button
                                className={`${styles.submitButton} ${styles.active}`}
                                onClick={handleSearchWithFile}
                                disabled={isUploading}
                            >
                                {isUploading ? <Loader2 size={18} className={styles.spin} /> : <ArrowRight size={18} />}
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
