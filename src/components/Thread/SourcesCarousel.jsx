import React from 'react';
import styles from './ThreadComponents.module.css';
import PdfViewerModal from '../modals/PdfViewerModal';

const SourcesCarousel = ({ sources }) => {
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
            <div className={styles.carouselContainer}>
                <div className={styles.carouselHeader}>
                    <span className={styles.carouselTitle}>참조 출처</span>
                    <span className={styles.carouselCount}>{sources.length}</span>
                </div>
                <div className={styles.carouselScroll}>
                    {sources.map((source, index) => {
                        const domain = (() => {
                            try { return new URL(source.url || source.link).hostname.replace('www.', ''); } catch { return 'website'; }
                        })();

                        return (
                            <a
                                key={index}
                                href={source.url || source.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.carouselCard}
                                onClick={(e) => handleSourceClick(e, source)}
                            >
                                <div className={styles.carouselCardHeader}>
                                    <img
                                        src={`https://www.google.com/s2/favicons?domain=${domain}`}
                                        alt="favicon"
                                        className={styles.carouselFavicon}
                                        onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                    <span className={styles.carouselDomain}>{domain}</span>
                                </div>
                                <div className={styles.carouselCardTitle}>
                                    {source.title.length > 35 ? source.title.substring(0, 35) + '...' : source.title}
                                </div>
                                <div className={styles.carouselIndex}>{index + 1}</div>
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

export default SourcesCarousel;
