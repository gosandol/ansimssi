import React from 'react';
import { AlignLeft } from 'lucide-react'; // Using AlignLeft as a proxy for "Sources" icon if unique one not found
import styles from './ThreadComponents.module.css';

const SourcesSection = ({ sources }) => {
    if (!sources || sources.length === 0) return null;
    return (
        <div className={styles.sectionContainer}>
            <div className={styles.sourcesList}>
                {sources.map((source, index) => {
                    const domain = (() => {
                        try { return new URL(source.url || source.link).hostname.replace('www.', ''); } catch { return 'website'; }
                    })();

                    return (
                        <a key={index} href={source.url || source.link} target="_blank" rel="noopener noreferrer" className={styles.sourceDetailedCard}>
                            <div className={styles.cardHeader}>
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${domain}`}
                                    alt="favicon"
                                    className={styles.cardFavicon}
                                    onError={(e) => { e.target.style.display = 'none' }}
                                />
                                <span className={styles.cardDomain}>{domain}</span>
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
    );
};

export default SourcesSection;
