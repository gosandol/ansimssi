import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useFamily } from '../../context/FamilyContext';
import { X, ChevronRight, ChevronDown, Globe, Moon, Map, User, Check, Smartphone, Sun, Plus, Trash2, LogOut, ShieldCheck, CreditCard } from 'lucide-react';
import styles from './SettingsModal.module.css';
import MedicalRegistrationModal from './MedicalRegistrationModal';

const SettingsModal = ({ onClose }) => {
    const { theme, setTheme } = useTheme();
    const { familyMembers, currentProfile, addFamilyMember, removeFamilyMember, loginAs, logout } = useFamily();

    const [expandedSection, setExpandedSection] = useState(null);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('');

    // Medical Modal State
    const [editingMemberId, setEditingMemberId] = useState(null);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
        setIsAddingMember(false); // Reset add state on toggle
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        if (newMemberName.trim()) {
            addFamilyMember(newMemberName, newMemberRole || '가족');
            setNewMemberName('');
            setNewMemberRole('');
            setIsAddingMember(false);
        }
    };

    const handleOpenMedicalModal = (memberId) => {
        setEditingMemberId(memberId);
    };

    const handleSaveMedicalInfo = (memberId, data) => {
        updateMedicalInfo(memberId, data);
        alert('진료 정보가 안전하게 등록되었습니다.');
        setEditingMemberId(null);
    };

    const getThemeLabel = (t) => {
        if (t === 'system') return '시스템 설정';
        if (t === 'light') return '라이트 모드';
        if (t === 'dark') return '다크 모드';
        return '';
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'father': return '👨 아빠';
            case 'mother': return '👩 엄마';
            case 'child': return '🧒 자녀';
            case 'senior': return '👵 어르신';
            case 'other': return '👤 기타';
            default: return role || '가족';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={24} />
                </button>
                <h2 className={styles.title}>설정</h2>
                <div style={{ width: 40 }} />
            </div>

            <div className={styles.scrollContent}>

                {/* Section: Account & Family */}
                <div className={styles.sectionHeader}>계정 및 가족</div>
                <div className={styles.section}>
                    {/* Current Profile Info */}
                    <div className={styles.profileCard}>
                        {currentProfile ? (
                            <>
                                <div className={styles.profileAvatar}>
                                    {currentProfile.name[0]}
                                </div>
                                <div className={styles.profileInfo}>
                                    <div className={styles.profileName}>{currentProfile.name}</div>
                                    <div className={styles.profileRole}>{getRoleLabel(currentProfile.role)}</div>
                                    {/* Medical Status Tag */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                                        {currentProfile.medicalInfo?.isVerified ? (
                                            <span style={{ fontSize: '0.75rem', color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                <ShieldCheck size={12} /> 진료 정보 등록됨
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenMedicalModal(currentProfile.id)}
                                                style={{ background: '#333', border: 'none', color: '#fbbf24', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                            >
                                                <CreditCard size={12} /> 진료/카드 정보 등록 필요
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <button className={styles.logoutButton} onClick={logout} title="로그아웃">
                                    <LogOut size={16} />
                                </button>
                            </>
                        ) : (
                            <div className={styles.loginCard} onClick={() => { /* Trigger generic login if needed, or just emphasize family login */ }}>
                                <div className={styles.profileInfo}>
                                    <div className={styles.profileName}>방문자 (게스트)</div>
                                    <div className={styles.profileRole}>로그인하여 맞춤 서비스를 이용하세요</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Family Management Toggle */}
                    <button
                        className={styles.menuItem}
                        onClick={() => toggleSection('family')}
                        style={expandedSection === 'family' ? { borderBottom: 'none' } : {}}
                    >
                        <div className={styles.labelGroup}>
                            <User size={20} className={styles.icon} />
                            <span>가족 구성원 관리</span>
                        </div>
                        {expandedSection === 'family' ? <ChevronDown size={20} className={styles.chevron} /> : <ChevronRight size={20} className={styles.chevron} />}
                    </button>

                    {/* Expanded Family List */}
                    {expandedSection === 'family' && (
                        <div className={styles.expandedContent}>
                            {familyMembers.length > 0 ? (
                                familyMembers.map(member => (
                                    <div key={member.id} className={styles.familyItemRow}>
                                        <div className={styles.familyItemInfo} onClick={() => loginAs(member.name)}>
                                            <span className={styles.familyName}>
                                                {member.name}
                                                {member.medicalInfo?.isVerified && <ShieldCheck size={14} color="#22d3ee" style={{ marginLeft: 4 }} />}
                                            </span>
                                            <span className={styles.familyRole}>{getRoleLabel(member.role)}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {!member.medicalInfo?.isVerified && (
                                                <button onClick={() => handleOpenMedicalModal(member.id)} style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer' }} title="진료 정보 등록">
                                                    <CreditCard size={16} />
                                                </button>
                                            )}
                                            <button className={styles.deleteButton} onClick={() => removeFamilyMember(member.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '0.8rem', color: '#888', fontSize: '0.9rem' }}>
                                    등록된 가족이 없습니다.
                                </div>
                            )}

                            {/* Add Member Form */}
                            {isAddingMember ? (
                                <form onSubmit={handleAddMember} className={styles.addMemberForm}>
                                    <input
                                        type="text"
                                        placeholder="이름 (예: 이숙희)"
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                        className={styles.inputField}
                                        autoFocus
                                    />
                                    <select
                                        value={newMemberRole}
                                        onChange={(e) => setNewMemberRole(e.target.value)}
                                        className={styles.inputField}
                                        style={{ appearance: 'auto', paddingRight: '1rem', cursor: 'pointer' }}
                                    >
                                        <option value="" disabled>역할 선택 (맞춤 추천 제공)</option>
                                        <option value="father">👨 아빠 (가장)</option>
                                        <option value="mother">👩 엄마 (주부)</option>
                                        <option value="child">🧒 자녀 (학생)</option>
                                        <option value="senior">👵 어르신 (부모님)</option>
                                        <option value="other">👤 기타</option>
                                    </select>
                                    <div className={styles.formActions}>
                                        <button type="button" onClick={() => setIsAddingMember(false)} className={styles.cancelBtn}>취소</button>
                                        <button type="submit" className={styles.confirmBtn}>등록</button>
                                    </div>
                                </form>
                            ) : (
                                <button className={styles.addItemBtn} onClick={() => setIsAddingMember(true)}>
                                    <Plus size={16} />
                                    <span>가족 구성원 추가하기</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Section: Personalization */}
                <div className={styles.sectionHeader}>개인화</div>
                <div className={styles.section}>
                    <button className={styles.menuItem}>
                        <div className={styles.labelGroup}>
                            <span>AI 응답 톤</span>
                        </div>
                        <span className={styles.valueText}>기본 (친절함)</span>
                    </button>
                    <button className={styles.menuItem}>
                        <div className={styles.labelGroup}>
                            <span>관심 건강 분야</span>
                        </div>
                        <ChevronRight size={20} className={styles.chevron} />
                    </button>
                </div>

                {/* Section: Appearance */}
                <div className={styles.sectionHeader}>화면 및 테마</div>
                <div className={styles.section}>
                    {/* Theme Toggle Button */}
                    <button
                        className={styles.menuItem}
                        onClick={() => toggleSection('theme')}
                        style={expandedSection === 'theme' ? { borderBottom: 'none' } : {}}
                    >
                        <div className={styles.labelGroup}>
                            <Moon size={20} className={styles.icon} />
                            <span>테마</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={styles.valueText}>{getThemeLabel(theme)}</span>
                            {expandedSection === 'theme' ? <ChevronDown size={20} className={styles.chevron} /> : <ChevronRight size={20} className={styles.chevron} />}
                        </div>
                    </button>

                    {/* Expanded Theme Options */}
                    {expandedSection === 'theme' && (
                        <div className={styles.expandedContent}>
                            <button
                                className={`${styles.subMenuItem} ${theme === 'system' ? styles.activeSubItem : ''}`}
                                onClick={() => setTheme('system')}
                            >
                                <div className={styles.labelGroup}>
                                    <Smartphone size={18} />
                                    <span>시스템 설정</span>
                                </div>
                                {theme === 'system' && <Check size={18} color="#3b82f6" />}
                            </button>
                            <button
                                className={`${styles.subMenuItem} ${theme === 'dark' ? styles.activeSubItem : ''}`}
                                onClick={() => setTheme('dark')}
                            >
                                <div className={styles.labelGroup}>
                                    <Moon size={18} />
                                    <span>다크 모드</span>
                                </div>
                                {theme === 'dark' && <Check size={18} color="#3b82f6" />}
                            </button>
                            <button
                                className={`${styles.subMenuItem} ${theme === 'light' ? styles.activeSubItem : ''}`}
                                onClick={() => setTheme('light')}
                            >
                                <div className={styles.labelGroup}>
                                    <Sun size={18} />
                                    <span>라이트 모드</span>
                                </div>
                                {theme === 'light' && <Check size={18} color="#3b82f6" />}
                            </button>
                        </div>
                    )}

                    <button className={styles.menuItem}>
                        <div className={styles.labelGroup}>
                            <Globe size={20} className={styles.icon} />
                            <span>언어 (Language)</span>
                        </div>
                        <span className={styles.valueText}>한국어</span>
                    </button>
                </div>

                {/* Section: Support */}
                <div className={styles.sectionHeader}>도움말 및 지원</div>
                <div className={styles.section}>
                    <button className={styles.menuItem}>
                        <span>안심씨 사용법 (튜토리얼)</span>
                    </button>
                    <button className={styles.menuItem}>
                        <span>자주 묻는 질문 (FAQ)</span>
                    </button>
                    <button className={styles.menuItem}>
                        <span>의견 보내기</span>
                    </button>
                </div>

                {/* Section: About */}
                <div className={styles.sectionHeader}>정보</div>
                <div className={styles.section}>
                    <button className={styles.menuItem}>
                        <span>서비스 이용 약관</span>
                        <ChevronRight size={20} className={styles.chevron} />
                    </button>
                    <button className={styles.menuItem}>
                        <span>개인정보 처리방침</span>
                        <ChevronRight size={20} className={styles.chevron} />
                    </button>
                </div>

                <div className={styles.versionInfo}>
                    Ansimssi v1.1.0 · Build 20260104
                </div>

                <div style={{ height: '40px' }} />
            </div>
            {/* Render Medical Modal if active */}
            {editingMemberId && (
                <MedicalRegistrationModal
                    member={familyMembers.find(m => m.id === editingMemberId)}
                    onSave={handleSaveMedicalInfo}
                    onClose={() => setEditingMemberId(null)}
                />
            )}
        </div>
    );
};

export default SettingsModal;
