import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useFamily } from '../../context/FamilyContext';
import { X, User, Plus, LogOut, ChevronUp, ChevronDown, Check, Camera } from 'lucide-react';
import styles from './ProfileMenu.module.css';

const ProfileMenu = ({ session, onClose }) => {
    const { familyMembers, currentProfile, loginAs, logout: familyLogout } = useFamily();
    const [expanded, setExpanded] = useState(true);

    const handleLogout = async () => {
        familyLogout();
        await supabase.auth.signOut();
        window.location.reload(); // Force refresh to clear state
    };

    const handleProfileSelect = (member) => {
        loginAs(member.name);
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.menuContainer} onClick={(e) => e.stopPropagation()}>
                {/* Header Section */}
                <div className={styles.header}>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>

                    <div className={styles.userInfo}>
                        <div className={styles.avatarWrapper}>
                            {session?.user?.user_metadata?.avatar_url ? (
                                <img src={session.user.user_metadata.avatar_url} alt="Profile" className={styles.mainAvatar} />
                            ) : (
                                <div className={styles.fallbackAvatar}>
                                    {session?.user?.email?.[0].toUpperCase()}
                                </div>
                            )}
                            <button className={styles.cameraButton}>
                                <Camera size={14} />
                            </button>
                        </div>
                        <h2 className={styles.greeting}>
                            안녕하세요, {session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0]}님.
                        </h2>
                        <button className={styles.manageButton}>
                            안심씨 계정 관리
                        </button>
                    </div>
                </div>

                {/* Account List Section */}
                <div className={styles.accountsSection}>
                    <div className={styles.accordionHeader} onClick={() => setExpanded(!expanded)}>
                        <span>계정 더보기 {expanded ? '숨기기' : '보이기'}</span>
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>

                    {expanded && (
                        <div className={styles.accountList}>
                            {/* Family Members (Brand Accounts) */}
                            {familyMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className={`${styles.accountItem} ${currentProfile?.id === member.id ? styles.active : ''}`}
                                    onClick={() => handleProfileSelect(member)}
                                >
                                    <div className={styles.itemAvatar}>
                                        {/* Generate a simple avatar based on name */}
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                                            alt={member.name}
                                        />
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{member.name}</span>
                                        <span className={styles.itemEmail}>{member.role || '가족 구성원'}</span>
                                    </div>
                                    {currentProfile?.id === member.id && (
                                        <div className={styles.activeBadge}>현재 계정</div>
                                    )}
                                </div>
                            ))}

                            {/* Add Account Option */}
                            <button className={styles.actionItem} onClick={() => alert("가족 구성원 추가 기능 준비 중")}>
                                <div className={styles.actionIcon}>
                                    <Plus size={20} />
                                </div>
                                <span>다른 계정 추가</span>
                            </button>

                            {/* Sign Out Option */}
                            <button className={styles.actionItem} onClick={handleLogout}>
                                <div className={styles.actionIcon}>
                                    <LogOut size={20} />
                                </div>
                                <span>모든 계정에서 로그아웃</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <span onClick={() => window.location.href = '/privacy'} style={{ cursor: 'pointer' }}>개인정보처리방침</span>
                    <span>•</span>
                    <span onClick={() => window.location.href = '/terms'} style={{ cursor: 'pointer' }}>서비스 약관</span>
                </div>
            </div>
        </div>
    );
};

export default ProfileMenu;
