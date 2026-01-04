import React from 'react';
import { CornerDownRight } from 'lucide-react';
import styles from './ThreadComponents.module.css';

const RelatedQuestions = ({ questions }) => {
    return (
        <div className={styles.sectionContainer}>
            <div className={styles.relatedHeader}>
                {/* Simple Text Header "Related" */}
                <span className={styles.relatedTitleText}>관련된</span>
            </div>

            <div className={styles.questionsList}>
                {questions.map((q, index) => (
                    <div key={index} className={styles.questionItem}>
                        <CornerDownRight size={18} className={styles.arrowIcon} />
                        <span className={styles.questionText}>{q}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatedQuestions;
