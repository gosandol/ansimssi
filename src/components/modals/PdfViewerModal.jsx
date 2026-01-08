import React from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';
import styles from './PdfViewerModal.module.css';

const PdfViewerModal = ({ url, title, onClose }) => {
    // Google Docs Viewer URL
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <FileText size={20} color="#60a5fa" />
                        <span className={styles.titleText}>{title || "PDF 미리보기"}</span>
                    </div>

                    <div className={styles.controls}>
                        <a
                            href={url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.downloadButton}
                            title="원본 다운로드"
                        >
                            <Download size={18} />
                            <span>원본 다운로드</span>
                        </a>

                        <button className={styles.closeButton} onClick={onClose} title="닫기">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Viewer Content */}
                <div className={styles.viewerContainer}>
                    <iframe
                        src={viewerUrl}
                        className={styles.iframe}
                        title="PDF Viewer"
                        allow="autoplay"
                    />
                </div>
            </div>
        </div>
    );
};

export default PdfViewerModal;
