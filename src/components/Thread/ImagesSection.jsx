import React from 'react';
import styles from './ImagesSection.module.css';

const ImagesSection = ({ images }) => {
    if (!images || images.length === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>관련 이미지</h3>
            </div>
            <div className={styles.grid}>
                {images.slice(0, 4).map((img, index) => (
                    <div key={index} className={styles.imageCard}>
                        <img src={img} alt={`Result ${index}`} className={styles.image} />
                    </div>
                ))}
            </div>
            {images.length > 4 && (
                <button className={styles.viewMoreBtn}>
                    더 보기
                </button>
            )}
        </div>
    );
};

export default ImagesSection;
