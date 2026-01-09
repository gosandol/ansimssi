import React from 'react';
import styles from './SourcesRow.module.css';

const SourcesRow = ({ sources, onClick }) => {
    if (!sources || sources.length === 0) return null;

    // Display only first 4 sources in the row
    const displaySources = sources.slice(0, 4);
    const extraCount = sources.length - 4;

    const getFavicon = (url) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch (e) {
            return "https://www.google.com/s2/favicons?domain=google.com";
        }
    };

    return (
        <div className={styles.rowContainer}>
            <div className={styles.label}>출처</div>
            <div className={styles.sourcesList} onClick={onClick}>
                {displaySources.map((s, idx) => (
                    <div key={idx} className={styles.sourceItem} title={s.title}>
                        <img
                            src={getFavicon(s.url)}
                            alt={s.title}
                            className={styles.favicon}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className={styles.sourceTitle}>{s.title}</span>
                        <span className={styles.sourceIndex}>{idx + 1}</span>
                    </div>
                ))}

                {extraCount > 0 && (
                    <div className={styles.moreBadge}>
                        +{extraCount}
                    </div>
                )}
            </div>
            {/* Click to Expand Trigger */}
            <button className={styles.viewAllBtn} onClick={onClick}>
                전체보기
            </button>
        </div>
    );
};

export default SourcesRow;
