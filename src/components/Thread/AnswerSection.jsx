import React from 'react';
import { Copy, Share, RotateCcw, ThumbsUp, ThumbsDown, ChevronDown, ChevronRight, MoreVertical, MoreHorizontal, Search, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './ThreadComponents.module.css';

const AnswerSection = ({ query, answer, sources = [], images = [], disclaimer, onSourceClick }) => {
    const [showProcess, setShowProcess] = React.useState(false);

    return (
        <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
                {/* Header Left: Thinking Process Toggle */}
                <div className={styles.headerLeft}>
                    {sources.length > 0 ? (
                        <div
                            className={styles.thinkingProcess}
                            onClick={() => setShowProcess(!showProcess)}
                        >
                            {showProcess ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            <span>검토됨 {sources.length}개의 소스</span>
                        </div>
                    ) : (
                        <div className={styles.thinkingProcess}>
                            <Loader2 size={18} className={styles.spinningLoader} />
                            <span>답변 생성 중...</span>
                        </div>
                    )}
                </div>

                {/* Header Right: More Options */}
                <div className={styles.headerRight}>
                    <button className={styles.iconBtn}>
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Timeline Content */}
            {showProcess && sources.length > 0 && (
                <div className={styles.processTimeline}>
                    {/* Step 1: Searching */}
                    <div className={`${styles.processStep} ${styles.active}`}>
                        <div className={styles.stepHeader}>
                            <span>검색 중</span>
                        </div>
                        <div className={styles.searchQueryPill}>
                            <Search size={14} />
                            <span>{query}</span>
                        </div>
                    </div>

                    {/* Step 2: Checking Sources */}
                    <div className={`${styles.processStep} ${styles.active}`}>
                        <div className={styles.stepHeader}>
                            <span>소스 검토 중 · {sources.length}</span>
                        </div>
                        <div className={styles.sourceGrid}>
                            {sources.map((source, idx) => (
                                <a key={idx} href={source.url || source.link} target="_blank" rel="noopener noreferrer" className={styles.sourceChip}>
                                    <img
                                        src={`https://www.google.com/s2/favicons?domain=${(() => {
                                            try { return new URL(source.url || source.link).hostname; } catch { return 'google.com'; }
                                        })()}`}
                                        alt=""
                                    />
                                    <span>{source.title}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Completed */}
                    <div className={styles.processStep}>
                        <div className={styles.stepHeader}>
                            <span>완료됨</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Inline Primary Image Removed for Readability - User Request */}
            {/* {sources.length > 0 && images && images.length > 0 && (
                <div className={styles.inlineImageContainer}>
                    <img src={images[0]} alt="Relevant visual" className={styles.inlineImage} />
                </div>
            )} */}

            {/* Split Answer to render Doctor's Recommendation separately if present */}
            {(() => {
                const recommendationMarker = "**안심씨의 최종 권고:**";
                const parts = answer.split(recommendationMarker);
                const mainBody = parts[0];
                const recommendation = parts.length > 1 ? parts[1] : null;

                return (
                    <>
                        <div className={`${styles.answerContent} ${styles.markdownBody}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{mainBody}</ReactMarkdown>
                        </div>

                        {recommendation && (
                            <div className={styles.doctorCallout}>
                                <div className={styles.calloutHeader}>
                                    <span className={styles.doctorIcon}>🩺</span>
                                    <strong>안심씨의 최종 권고</strong>
                                </div>
                                <div className={styles.calloutContent}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{recommendation}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </>
                );
            })()}

            {/* Dynamic Disclaimer */}
            {disclaimer && (
                <div className={styles.disclaimer}>
                    <p>⚠️ <strong>주의사항:</strong> {disclaimer}</p>
                </div>
            )}



            <div className={styles.answerActions}>
                {/* Left: Share, Copy, Rewrite */}
                <div className={styles.actionLeft}>
                    <button className={styles.iconBtn} aria-label="Share">
                        <Share size={18} />
                    </button>
                    <button className={styles.iconBtn} aria-label="Copy">
                        <Copy size={18} />
                    </button>
                    <button className={styles.iconBtn} aria-label="Rewrite">
                        <RotateCcw size={18} />
                    </button>
                </div>

                {/* Center: Sources (Overlapping) */}
                <div
                    className={styles.actionCenter}
                    onClick={onSourceClick}
                    style={{ cursor: 'pointer' }}
                >
                    <div className={styles.sourceIcons}>
                        {sources.slice(0, 3).map((source, index) => (
                            <div key={index} className={styles.sourceCircle} style={{ zIndex: 3 - index }}>
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${(() => {
                                        try { return new URL(source.url || source.link).hostname; } catch { return 'google.com'; }
                                    })()}`}
                                    alt="source"
                                    onError={(e) => { e.target.style.display = 'none' }}
                                />
                            </div>
                        ))}
                    </div>
                    <span className={styles.sourceCount}>{sources.length > 0 ? sources.length : ''}</span>
                </div>

                {/* Right: Thumbs, More */}
                <div className={styles.actionRight}>
                    <button className={styles.iconBtn} aria-label="Like">
                        <ThumbsUp size={18} />
                    </button>
                    <button className={styles.iconBtn} aria-label="Dislike">
                        <ThumbsDown size={18} />
                    </button>
                    <button className={styles.iconBtn} aria-label="More">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnswerSection;
