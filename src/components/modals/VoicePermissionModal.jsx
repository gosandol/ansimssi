import React, { useState } from 'react';
import { Mic, Check, X } from 'lucide-react';
import styles from './VoicePermissionModal.module.css';

import { useFamily } from '../../context/FamilyContext';

const VoicePermissionModal = ({ onAllow, onClose }) => {
    const [step, setStep] = useState(0); // 0: Permissions, 1: Contacts
    const [isHandsFree, setIsHandsFree] = useState(true);

    // Contact Form State
    const { contacts, addContact, removeContact } = useFamily();
    const [newName, setNewName] = useState('');
    const [newNumber, setNewNumber] = useState('');

    const handleAddContact = () => {
        if (newName && newNumber) {
            addContact(newName, newNumber);
            setNewName('');
            setNewNumber('');
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={24} />
                </button>

                {step === 0 ? (
                    <>
                        <div className={styles.iconWrapper}>
                            <div className={styles.pulseRing}></div>
                            <Mic size={48} className={styles.micIcon} />
                        </div>

                        <h2 className={styles.title}>안심씨와 대화를 시작할까요?</h2>
                        <p className={styles.description}>
                            음성 대화 기능을 사용하려면<br />
                            <strong>마이크 접근 권한</strong>이 필요합니다.
                        </p>

                        <div className={styles.featureList}>
                            <div className={`${styles.featureItem} ${styles.active}`}>
                                <div className={styles.checkCircle}><Check size={14} /></div>
                                <span>실시간 음성 질의응답</span>
                            </div>

                            <div
                                className={`${styles.featureItem} ${isHandsFree ? styles.active : ''}`}
                                onClick={() => setIsHandsFree(!isHandsFree)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={styles.checkCircle}>
                                    {isHandsFree ? <Check size={14} /> : <div style={{ width: 14, height: 14 }} />}
                                </div>
                                <span>핸즈프리 대화 모드</span>
                            </div>
                        </div>

                        <div className={styles.buttonGroup}>
                            <button
                                className={styles.allowButton}
                                onClick={() => setStep(1)}
                            >
                                다음: 안심 연락처 설정
                            </button>
                            <button
                                className={styles.skipButton}
                                style={{ marginTop: '10px', background: 'transparent', color: '#666', border: 'none', fontSize: '13px' }}
                                onClick={() => onAllow(isHandsFree)}
                            >
                                건너뛰고 바로 시작
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.headerRow} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div className={styles.iconWrapper} style={{ width: '50px', height: '50px', padding: '0', margin: '0' }}>
                                <Mic size={24} className={styles.micIcon} />
                            </div>
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <h2 className={styles.title} style={{ fontSize: '1.2rem', margin: '0', textAlign: 'left' }}>안심 연락처 설정</h2>
                                <p className={styles.description} style={{ fontSize: '0.85rem', margin: '0', textAlign: 'left' }}>
                                    "예원이에게 전화해줘" 처럼<br />이름만 부르면 연결해드립니다.
                                </p>
                            </div>
                        </div>

                        <div className={styles.contactForm} style={{ background: '#f5f7fa', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input
                                    placeholder="이름 (예: 딸, 최예원)"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                                <input
                                    placeholder="전화번호 (010...)"
                                    value={newNumber}
                                    onChange={e => setNewNumber(e.target.value)}
                                    style={{ flex: 1.5, padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <button
                                onClick={handleAddContact}
                                style={{ width: '100%', padding: '8px', background: '#333', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600' }}
                            >
                                + 연락처 추가
                            </button>
                        </div>

                        <div className={styles.contactList} style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '20px' }}>
                            {contacts.map(contact => (
                                <div key={contact.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                    <div>
                                        <span style={{ fontWeight: '700', marginRight: '8px' }}>{contact.name}</span>
                                        <span style={{ color: '#666', fontSize: '0.9rem' }}>{contact.number}</span>
                                    </div>
                                    <button onClick={() => removeContact(contact.id)} style={{ background: 'none', border: 'none', color: '#ff3b30' }}>삭제</button>
                                </div>
                            ))}
                            {contacts.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#999', padding: '10px', fontSize: '0.9rem' }}>
                                    등록된 연락처가 없습니다.
                                </div>
                            )}
                        </div>

                        <button
                            className={styles.allowButton}
                            onClick={() => onAllow(isHandsFree)}
                        >
                            설정 완료 및 대화 시작
                        </button>
                    </>
                )}

                <p className={styles.subtext}>
                    {step === 0 ? "버튼을 누르면 브라우저의 권한 요청 팝업이 뜹니다." : "저장된 연락처는 브라우저 내부에만 안전하게 저장됩니다."}
                </p>
            </div>
        </div>
    );
};

export default VoicePermissionModal;
