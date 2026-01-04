import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Home, User } from 'lucide-react';
import styles from './MedicalRegistrationModal.module.css';

const MedicalRegistrationModal = ({ member, onSave, onClose }) => {
    const [step, setStep] = useState(1); // 1: Identity, 2: Address, 3: Card
    const [formData, setFormData] = useState({
        realName: member?.name || '',
        rrnFront: '',
        rrnBack: '',
        address: '',
        cardNum1: '',
        cardNum2: '',
        cardNum3: '',
        cardNum4: '',
        cardExpiry: '',
        cardPwd: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else handleSubmit();
    };

    const handleSubmit = () => {
        // Mock data processing
        const medicalData = {
            medical: {
                realName: formData.realName,
                rrn: `${formData.rrnFront}-${formData.rrnBack}`,
                address: formData.address,
                isVerified: true
            },
            billing: {
                cardName: '국민카드 (예시)',
                cardNumber: `${formData.cardNum1}-****-****-${formData.cardNum4}`,
                billingKey: 'mock_billing_key_' + Date.now()
            }
        };
        onSave(member.id, medicalData);
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>진료 필수 정보 등록</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                </div>

                <div className={styles.progress}>
                    <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>1. 본인확인</div>
                    <div className={styles.line} />
                    <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>2. 주소</div>
                    <div className={styles.line} />
                    <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>3. 결제카드</div>
                </div>

                <div className={styles.content}>
                    {step === 1 && (
                        <div className={styles.formSection}>
                            <div className={styles.iconArea}><ShieldCheck size={48} color="#22d3ee" /></div>
                            <h3>안전한 진료를 위해<br />본인 확인이 필요해요</h3>
                            <p className={styles.desc}>의료법에 따라 정확한 환자 식별이 필요합니다.</p>

                            <label>이름 (실명)</label>
                            <input type="text" name="realName" value={formData.realName} onChange={handleChange} placeholder="홍길동" className={styles.input} />

                            <label>주민등록번호</label>
                            <div className={styles.rrnGroup}>
                                <input type="text" name="rrnFront" maxLength="6" value={formData.rrnFront} onChange={handleChange} placeholder="앞 6자리" className={styles.input} />
                                <span className={styles.dash}>-</span>
                                <input type="password" name="rrnBack" maxLength="7" value={formData.rrnBack} onChange={handleChange} placeholder="뒤 7자리" className={styles.input} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.formSection}>
                            <div className={styles.iconArea}><Home size={48} color="#818cf8" /></div>
                            <h3>처방전 발급과 약 배송을 위해<br />주소가 필요해요</h3>

                            <label>거주지 주소</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="서울시 강남구..." className={styles.input} />
                            <button className={styles.searchBtn}>주소 검색 (데모)</button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.formSection}>
                            <div className={styles.iconArea}><CreditCard size={48} color="#c084fc" /></div>
                            <h3>진료비 자동 결제를 위한<br />카드를 등록해주세요</h3>

                            <label>카드 번호</label>
                            <div className={styles.cardGroup}>
                                <input type="text" name="cardNum1" maxLength="4" value={formData.cardNum1} onChange={handleChange} className={styles.input} />
                                <input type="password" name="cardNum2" maxLength="4" value={formData.cardNum2} onChange={handleChange} className={styles.input} />
                                <input type="password" name="cardNum3" maxLength="4" value={formData.cardNum3} onChange={handleChange} className={styles.input} />
                                <input type="text" name="cardNum4" maxLength="4" value={formData.cardNum4} onChange={handleChange} className={styles.input} />
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    {step > 1 && <button className={styles.prevBtn} onClick={() => setStep(step - 1)}>이전</button>}
                    <button className={styles.nextBtn} onClick={handleNext}>
                        {step === 3 ? '등록 완료' : '다음'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicalRegistrationModal;
