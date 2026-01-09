import React from 'react';
import { AlignLeft } from 'lucide-react'; // Using AlignLeft as a proxy for "Sources" icon if unique one not found
import styles from './ThreadComponents.module.css';
import PdfViewerModal from '../modals/PdfViewerModal';

const SourcesSection = ({ sources }) => {
    const [selectedDoc, setSelectedDoc] = React.useState(null);

    const handleSourceClick = (e, source) => {
        const link = source.url || source.link;
        if (!link) return;

        const lowerLink = link.toLowerCase();
        const supportedExtensions = [
            '.pdf',
            '.doc', '.docx',
            '.ppt', '.pptx',
            '.xls', '.xlsx',
            '.hwp', '.hwpx'
        ];

        if (supportedExtensions.some(ext => lowerLink.endsWith(ext))) {
            e.preventDefault();
            e.stopPropagation();
            setSelectedDoc({ url: link, title: source.title });
        }
    };

    if (!sources || sources.length === 0) return null;

    return (
        <>
            <div className={styles.sectionContainer}>
                <div className={styles.sourcesList}>
                    {sources.map((source, index) => {
                        const domain = (() => {
                            try { return new URL(source.url || source.link).hostname.replace('www.', ''); } catch { return 'website'; }
                        })();

                        // Trust Badge Logic
                        const getTrustBadge = (hostname) => {
                            if (hostname.includes('.go.kr') || hostname.includes('.gov')) return { type: 'gov', label: '정부/공공', icon: '🏛️' };
                            if (hostname.includes('.ac.kr') || hostname.includes('.edu')) return { type: 'edu', label: '교육기관', icon: '🎓' };
                            if (hostname.includes('.or.kr') || hostname.includes('hospital') || hostname.includes('medical') || hostname.includes('health')) return { type: 'med', label: '기관/단체', icon: '🏥' };
                            if (hostname.includes('news') || hostname.includes('press') || hostname.includes('media')) return { type: 'news', label: '언론사', icon: '📰' };
                            return null;
                        };

                        const badge = getTrustBadge(domain);

                        return (
                            <a
                                key={index}
                                href={source.url || source.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.sourceDetailedCard} ${source.isSolution ? styles.solutionCard : ''}`}
                                style={source.isSolution ? { borderColor: 'var(--accent-primary)', backgroundColor: 'rgba(34, 211, 238, 0.05)' } : {}}
                                onClick={(e) => handleSourceClick(e, source)}
                            >
                                <div className={styles.cardHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                        <img
                                            src={`https://www.google.com/s2/favicons?domain=${domain}`}
                                            alt="favicon"
                                            className={styles.cardFavicon}
                                            onError={(e) => { e.target.style.display = 'none' }}
                                        />
                                        <span className={styles.cardDomain}>{domain}</span>
                                    </div>
                                    {/* Priority Badge for Solutions */}
                                    {source.isSolution && (
                                        <span className={styles.trustBadge} style={{ backgroundColor: 'var(--accent-primary)', color: 'white', borderColor: 'transparent' }}>
                                            🎯 추천 솔루션
                                        </span>
                                    )}
                                    {!source.isSolution && badge && (
                                        <span className={styles.trustBadge} data-type={badge.type}>
                                            {badge.icon} {badge.label}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.cardTitle}>{source.title}</div>
                                <div className={styles.cardSnippet}>
                                    {source.content ? (source.content.length > 80 ? source.content.substring(0, 80) + '...' : source.content) : ''}
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>

            {/* Document Viewer Modal */}
            {selectedDoc && (
                <PdfViewerModal
                    url={selectedDoc.url}
                    title={selectedDoc.title}
                    onClose={() => setSelectedDoc(null)}
                />
            )}
        </>
    );
};

export default SourcesSection;
