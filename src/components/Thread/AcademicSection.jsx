import React from 'react';
import { BookOpen, ExternalLink, GraduationCap } from 'lucide-react';
import styles from './AcademicSection.module.css';

const AcademicSection = ({ papers = [] }) => {
    if (!papers || papers.length === 0) {
        return (
            <div className={styles.container}>
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                    <GraduationCap size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>관련된 학술 자료를 찾을 수 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {papers.map((paper, idx) => (
                <a
                    key={idx}
                    href={paper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.paperCard}
                >
                    <div className={styles.header}>
                        <div className={styles.title}>{paper.title}</div>
                        {paper.year && <span className={styles.yearBadge}>{paper.year}</span>}
                    </div>

                    <div className={styles.metaInfo}>
                        <BookOpen size={14} />
                        <span>{paper.publication_info || "학술 자료"}</span>
                    </div>

                    <div className={styles.snippet}>
                        {paper.snippet}
                    </div>

                    {/* Optional: Add tags or extra info here */}
                    <div className={styles.footer}>
                        <span className={styles.tag}>Scholarly Article</span>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default AcademicSection;
