import React from 'react';
import { BookOpen, ExternalLink, GraduationCap } from 'lucide-react';
import styles from './AcademicSection.module.css';
import PdfViewerModal from '../modals/PdfViewerModal';

const AcademicSection = ({ papers = [] }) => {
    const [selectedPaper, setSelectedPaper] = React.useState(null);

    const handlePaperClick = (e, paper) => {
        if (!paper.link) return;

        const lowerLink = paper.link.toLowerCase();
        const supportedExtensions = [
            '.pdf',
            '.doc', '.docx',
            '.ppt', '.pptx',
            '.xls', '.xlsx',
            '.hwp', '.hwpx'
        ];

        // Check format
        const isSupported = supportedExtensions.some(ext => lowerLink.endsWith(ext));

        if (isSupported) {
            e.preventDefault();
            e.stopPropagation(); // Stop parent handlers (like search triggers)
            setSelectedPaper(paper);
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
                    const isViewable = (() => {
                        if (!paper.link) return false;
                        const l = paper.link.toLowerCase();
                        return l.endsWith('.pdf') || l.endsWith('.hwp') || l.endsWith('.hwpx') ||
                            l.endsWith('.doc') || l.endsWith('.docx') || l.endsWith('.ppt') || l.endsWith('.pptx');
                    })();

                    return (
                        <a
                            key={idx}
                            href={paper.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.paperCard}
                            onClick={(e) => handlePaperClick(e, paper)}
                        >
                            <div className={styles.header}>
                                <div className={styles.title}>{paper.title}</div>
                                {paper.year && <span className={styles.yearBadge}>{paper.year}년</span>}
                            </div>

                            <div className={styles.metaInfo}>
                                <BookOpen size={14} style={{ minWidth: '14px' }} />
                                {/* Clean up publication info if it contains messy truncated text */}
                                <span>{paper.publication_info ? paper.publication_info.split(' - ')[0] : "학술 출처 미상"}</span>
                            </div>

                            <div className={styles.snippet}>
                                {paper.snippet}
                            </div>

                            <div className={styles.footer}>
                                <span className={`${styles.tag} ${isViewable ? styles.viewableTag : styles.linkTag}`}>
                                    {isViewable ? (
                                        <>
                                            <span style={{ marginRight: '4px' }}>📄</span>
                                            {(() => {
                                                const l = paper.link.toLowerCase();
                                                if (l.endsWith('.pdf')) return "PDF 바로보기";
                                                if (l.endsWith('.hwp') || l.endsWith('.hwpx')) return "한글(HWP) 바로보기";
                                                return "문서 뷰어 열기";
                                            })()}
                                        </>
                                    ) : (
                                        <>
                                            <ExternalLink size={12} style={{ marginRight: '4px' }} />
                                            외부 링크로 이동
                                        </>
                                    )}
                                </span>
                            </div>
                        </a>
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
