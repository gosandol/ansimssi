import React from 'react';
import { Copy, Share, RotateCcw, ThumbsUp, ThumbsDown, ChevronDown, ChevronRight, MoreVertical, MoreHorizontal, Search, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './ThreadComponents.module.css';

const AnswerSection = ({ query, answer, sources = [], images = [], disclaimer, onSourceClick }) => {
    const [showProcess, setShowProcess] = React.useState(false);

    return (
        <div className={styles.sectionContainer}>
            {/* Header Removed per User Request: Clean Start directly with Answer */}

            {/* Inline Primary Image Removed for Readability - User Request */}

            {/* Inline Primary Image Removed for Readability - User Request */}
            {/* {sources.length > 0 && images && images.length > 0 && (
                <div className={styles.inlineImageContainer}>
                    <img src={images[0]} alt="Relevant visual" className={styles.inlineImage} />
                </div>
            )} */}

            {/* Answer Content - Split for Doctor's Recommendation */}
            {(() => {
                // Defensive coding: Ensure answer is a string
                const safeAnswer = (typeof answer === 'string') ? answer : '';

                const recommendationMarker = "**안심씨의 최종 권고:**";
                const parts = safeAnswer.split(recommendationMarker);
                const mainBody = parts[0];
                const recommendation = parts.length > 1 ? parts[1] : null;

                return (
                    <>
                        <div className={`${styles.answerContent} ${styles.markdownBody}`}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                            >
                                {mainBody}
                            </ReactMarkdown>
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




            <div className={styles.answerActions}>
                {/* Gemini Style Action Row: [Like] [Dislike] [Copy] [Share] [Google] [More] */}

                {/* 1. Feedback Group */}
                <button className={styles.iconBtn} aria-label="Good response">
                    <ThumbsUp size={19} />
                </button>
                <button className={styles.iconBtn} aria-label="Bad response">
                    <ThumbsDown size={19} />
                </button>

                {/* 2. Utility Group */}
                <button className={styles.iconBtn} aria-label="Copy">
                    <Copy size={19} />
                </button>
                <button className={styles.iconBtn} aria-label="Share">
                    <Share size={19} />
                </button>

                {/* 3. Search / More */}
                <button className={styles.iconBtn} aria-label="Google Search">
                    <Search size={19} />
                </button>
                <button className={styles.iconBtn} aria-label="More options">
                    <MoreVertical size={19} />
                </button>
            </div>
        </div>
    );
};


export default AnswerSection;
