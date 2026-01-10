import React, { useState } from 'react';
import { X, Mic, Phone, User, Info, Check, Trash2, Plus } from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';
import styles from './SettingsModal.module.css';

const SettingsModal = ({ onClose, initialTab }) => {
    const [activeTab, setActiveTab] = useState(initialTab || 'contacts');
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
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>설정 및 도움말</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.container}>
                    {/* Sidebar Tabs */}
                    <div className={styles.sidebar}>
                        <button
                            className={`${styles.tab} ${activeTab === 'contacts' ? styles.active : ''}`}
                            onClick={() => setActiveTab('contacts')}
                        >
                            <Phone size={18} />
                            <span>안심 연락처</span>
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'voice' ? styles.active : ''}`}
                            onClick={() => setActiveTab('voice')}
                        >
                            <Mic size={18} />
                            <span>음성 설정</span>
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'account' ? styles.active : ''}`}
                            onClick={() => setActiveTab('account')}
                        >
                            <User size={18} />
                            <span>계정 관리</span>
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'info' ? styles.active : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            <Info size={18} />
                            <span>정보</span>
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className={styles.content}>
                        {activeTab === 'contacts' && (
                            <div className={styles.section}>
                                <h3>안심 스피드 다이얼</h3>
                                <p className={styles.description}>
                                    "딸에게 전화해줘", "예원이에게 문자해줘"와 같이<br />
                                    이름만 불러서 연락할 수 있도록 번호를 등록하세요.
                                </p>

                                <div className={styles.addContactForm}>
                                    <div className={styles.inputGroup}>
                                        <input
                                            placeholder="이름 (예: 딸, 최예원)"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                        />
                                        <input
                                            placeholder="전화번호 (010...)"
                                            value={newNumber}
                                            onChange={e => setNewNumber(e.target.value)}
                                        />
                                    </div>
                                    <button onClick={handleAddContact} disabled={!newName || !newNumber}>
                                        <Plus size={16} /> 추가
                                    </button>
                                </div>

                                <div className={styles.contactList}>
                                    {contacts.length === 0 ? (
                                        <div className={styles.emptyState}>등록된 연락처가 없습니다.</div>
                                    ) : (
                                        contacts.map(contact => (
                                            <div key={contact.id} className={styles.contactItem}>
                                                <div className={styles.contactInfo}>
                                                    <span className={styles.contactName}>{contact.name}</span>
                                                    <span className={styles.contactNumber}>{contact.number}</span>
                                                </div>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => removeContact(contact.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'voice' && (
                            <div className={styles.section}>
                                <h3>음성 인식 설정</h3>
                                <div className={styles.settingItem}>
                                    <div className={styles.settingInfo}>
                                        <span className={styles.settingTitle}>핸즈프리 모드</span>
                                        <span className={styles.settingDesc}>대화가 끝나도 마이크를 끄지 않고 계속 대화합니다.</span>
                                    </div>
                                    <div className={styles.toggle}>
                                        {/* Placeholder Toggle */}
                                        <div className={styles.toggleThumb} style={{ marginLeft: '20px', background: '#4ade80' }}></div>
                                    </div>
                                </div>
                                <div className={styles.settingItem}>
                                    <div className={styles.settingInfo}>
                                        <span className={styles.settingTitle}>음성 답변 듣기</span>
                                        <span className={styles.settingDesc}>안심씨의 답변을 음성으로 읽어줍니다 (TTS).</span>
                                    </div>
                                    <div className={styles.toggle}>
                                        <div className={styles.toggleThumb} style={{ marginLeft: '20px', background: '#4ade80' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'info' && (
                            <div className={styles.section}>
                                <h3>앱 정보</h3>
                                <p><strong>안심씨 (Ansimssi)</strong> v2.1.0</p>
                                <p>© 2026 Ansim Insurance Co. All rights reserved.</p>
                                <div className={styles.links}>
                                    <a href="/terms">서비스 이용약관</a>
                                    <a href="/privacy">개인정보 처리방침</a>
                                </div>
                            </div>
                        )}

                        {activeTab === 'account' && (
                            <div className={styles.section}>
                                <h3>계정 관리</h3>
                                <p>현재 로그인된 계정 정보를 관리합니다.</p>
                                <button className={styles.dangerButton} onClick={() => alert("준비 중입니다.")}>
                                    회원 탈퇴
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
