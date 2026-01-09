import React from 'react';
import { BookOpen, ExternalLink, GraduationCap } from 'lucide-react';
import styles from './AcademicSection.module.css';
import PdfViewerModal from '../modals/PdfViewerModal';

const AcademicSection = ({ papers = [] }) => {
    const [selectedPaper, setSelectedPaper] = React.useState(null);

    const handlePaperClick = (e, paper) => {
        if (!paper.link) return;

        // Robust detection: strip query params/hashes
        const cleanLink = paper.link.split('?')[0].split('#')[0].toLowerCase();

        const supportedExtensions = [
            '.pdf',
            '.doc', '.docx',
            '.ppt', '.pptx',
            '.xls', '.xlsx',
            '.hwp', '.hwpx'
        ];

        // Check format
        const isSupported = supportedExtensions.some(ext => cleanLink.endsWith(ext));

        if (isSupported) {
            e.preventDefault();
            e.stopPropagation(); // Stop parent handlers (like search triggers)
            setSelectedPaper(paper);
        } else {
            // For external links, explicit handling if needed, otherwise default <a> behavior
            e.stopPropagation(); // Stop search triggers even for external links!
        }
    };

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
        <>
            <div className={styles.container}>
                {papers.map((paper, idx) => {
                    const cleanLink = paper.link ? paper.link.split('?')[0].split('#')[0].toLowerCase() : "";

                    const isViewable = [
                        '.pdf', '.hwp', '.hwpx',
                        '.doc', '.docx',
                        '.ppt', '.pptx',
                        '.xls', '.xlsx'
                    ].some(ext => cleanLink.endsWith(ext));

                    // Hide snippets that are too short or redundant
                    const showSnippet = paper.snippet && paper.snippet.length > 20 && paper.snippet !== paper.title;

                    return (
                        <div key={idx} className={styles.paperCardWrapper}>
                            <a
                                href={paper.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.paperCard}
                                onClick={(e) => handlePaperClick(e, paper)}
                            >
                                <div className={styles.header}>
                                    <div className={styles.title}>{paper.title}</div>
                                    {paper.year && <span className={styles.yearBadge}>{paper.year}</span>}
                                </div>

                                <div className={styles.metaInfo}>
                                    <BookOpen size={14} style={{ minWidth: '14px', flexShrink: 0 }} />
                                    <span className={styles.metaText}>
                                        {paper.publication_info || "학술 자료"}
                                    </span>
                                </div>

                                {showSnippet && (
                                    <div className={styles.snippet}>
                                        {paper.snippet}
                                    </div>
                                )}

                                <div className={styles.footer}>
                                    <span className={`${styles.tag} ${isViewable ? styles.viewableTag : styles.linkTag}`}>
                                        {isViewable ? (
                                            <>
                                                <span style={{ marginRight: '4px' }}>📄</span>
                                                {(() => {
                                                    if (cleanLink.endsWith('.pdf')) return "PDF 원문보기";
                                                    if (cleanLink.endsWith('.hwp') || cleanLink.endsWith('.hwpx')) return "한글(HWP) 원문보기";
                                                    return "문서 뷰어 열기";
                                                })()}
                                            </>
                                        ) : (
                                            <>
                                                <ExternalLink size={12} style={{ marginRight: '4px' }} />
                                                외부 사이트 이동
                                            </>
                                        )}
                                    </span>
                                </div>
                            </a>
                        </div>
                    );
                })}
            </div>

            {/* PDF Viewer Modal */}
            {selectedPaper && (
                <PdfViewerModal
                    url={selectedPaper.link}
                    title={selectedPaper.title}
                    onClose={() => setSelectedPaper(null)}
                />
            )}
        </>
    );
};

export default AcademicSection;
