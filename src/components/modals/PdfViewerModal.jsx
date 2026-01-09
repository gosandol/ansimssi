import React from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';
import styles from './PdfViewerModal.module.css';

const PdfViewerModal = ({ url, title, onClose }) => {
    // Determine file type
    const lowerUrl = url ? url.toLowerCase() : "";
    const isOffice = lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx') ||
        lowerUrl.endsWith('.ppt') || lowerUrl.endsWith('.pptx') ||
        lowerUrl.endsWith('.xls') || lowerUrl.endsWith('.xlsx');

    // Viewer URL selection
    let viewerUrl = "";
    if (isOffice) {
        // MS Office Online Viewer
        viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    } else {
        // Google Docs Viewer (PDF, HWP, etc.)
        viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }

    // Dynamic Title & Icon
    let typeLabel = "문서 미리보기";
    if (lowerUrl.endsWith('.pdf')) typeLabel = "PDF 미리보기";
    else if (lowerUrl.endsWith('.hwp') || lowerUrl.endsWith('.hwpx')) typeLabel = "한글(HWP) 미리보기";
    else if (isOffice) typeLabel = "Office 문서 미리보기";

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <FileText size={20} color="#60a5fa" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className={styles.titleText}>{title || typeLabel}</span>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>{typeLabel}</span>
                        </div>
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
                        title="Document Viewer"
                        allow="autoplay"
                    />
                </div>
            </div>
        </div>
    );
};

export default PdfViewerModal;
