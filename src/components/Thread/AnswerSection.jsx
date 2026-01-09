import React from 'react';
import { Copy, Share, RotateCcw, ThumbsUp, ThumbsDown, ChevronDown, ChevronRight, MoreVertical, MoreHorizontal, Search, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './ThreadComponents.module.css';
import MedicalWarningIcon from '../icons/MedicalWarningIcon';

import AnsimssiLogo from '../AnsimssiLogo'; // Correct path check: Thread/.. -> components. -> AnsimssiLogo

const AnswerSection = ({ query, answer, sources = [], images = [], disclaimer, onSourceClick }) => {
    const [showProcess, setShowProcess] = React.useState(false);

    return (
        <div className={styles.sectionContainer}>
            {/* 1. Top Disclaimer Banner (Gemini Style) */}
            {disclaimer && (
                <div className={styles.disclaimerBanner}>
                    <MedicalWarningIcon size={16} color="var(--text-secondary)" className={styles.disclaimerIcon} />
                    <span>{disclaimer}</span>
                </div>
            )}

            {/* 2. Answer Header with Ansimssi Bubble Icon */}

            <div className={styles.answerHeader}>
                <AnsimssiLogo size={32} className={styles.mainIcon} />
            </div>

            {/* Inline Primary Image Removed for Readability - User Request */}

            {/* Inline Primary Image Removed for Readability - User Request */}
            {/* {sources.length > 0 && images && images.length > 0 && (
                <div className={styles.inlineImageContainer}>
                    <img src={images[0]} alt="Relevant visual" className={styles.inlineImage} />
                </div>
            )} */}

            {/* Answer Content - Parsed for Gemini Structure */}
            {(() => {
                const safeAnswer = (typeof answer === 'string') ? answer : '';

                // 1. Detect Caution Section (Medical/Safety)
                // Keyword match based on Backend Prompt
                const cautionHeaderPattern = /⚠️\s*이럴 때는 반드시 전문가와 상담하세요/i;
                const cautionMatch = safeAnswer.match(cautionHeaderPattern);

                let mainContent = safeAnswer;
                let cautionContent = null;
                let closingContent = null;

                if (cautionMatch) {
                    const splitIndex = cautionMatch.index;
                    // Everything before the warning
                    mainContent = safeAnswer.substring(0, splitIndex);
                    // Remove trailing '---' if prompt inserted it
                    mainContent = mainContent.replace(/---\s*$/, '').trim();

                    // Everything after the warning header
                    const rawCaution = safeAnswer.substring(splitIndex + cautionMatch[0].length);
                    cautionContent = rawCaution.trim();

                    // Optional: Try to split Closing from Caution if possible
                    // However, keeping them together in the warning box is safer for medical context
                    // unless we have a specific delimiter for Closing.
                }

                return (
                    <>
                        {/* Main Body (Intro + Numbered List) */}
                        <div className={`${styles.answerContent} ${styles.markdownBody}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {mainContent}
                            </ReactMarkdown>
                        </div>

                        {/* Custom Medical Caution Box */}
                        {cautionContent && (
                            <div className={styles.medicalCaution}>
                                <div className={styles.cautionHeader}>
                                    <MedicalWarningIcon size={20} color="#F59E0B" />
                                    <span>이럴 때는 반드시 전문가와 상담하세요</span>
                                </div>
                                <div className={styles.cautionBody}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {cautionContent}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </>
                );
            })()}
            {/* Dynamic Disclaimer logic handled in IIFE above */}

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
        </div >
    );
};


export default AnswerSection;
