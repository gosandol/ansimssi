import React from 'react';
import styles from './WidgetCard.module.css';

const WidgetCard = ({ title, icon: Icon, children, className, onClick, accentColor }) => {
    return (
        <div
            className={`${styles.card} ${className || ''} ${onClick ? styles.clickable : ''}`}
            onClick={onClick}
            style={accentColor ? { '--widget-accent': accentColor } : {}}
        >
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    {Icon && <Icon size={18} className={styles.icon} />}
                    <h3 className={styles.title}>{title}</h3>
                </div>
            </div>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
};

export default WidgetCard;
