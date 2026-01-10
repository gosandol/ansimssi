import React, { useEffect, useState } from 'react';
import { User, Shield, Calendar, Clock, MoreHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import styles from './UserManagement.module.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch directly from profiles table
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error(err);
            setError("유저 목록을 불러오지 못했습니다: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className={styles.loading}>회원 정보를 불러오는 중입니다...</div>;
    }

    if (error) {
        return <div className={styles.loading}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>회원 관리 (CRM)</h2>
                <p>총 {users.length}명의 회원이 등록되어 있습니다.</p>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>사용자</th>
                            <th>가입일</th>
                            <th>가입 경로</th>
                            <th>이메일</th>
                            <th>권한</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const name = user.full_name || '이름 없음';
                            const avatar = user.avatar_url;
                            const email = user.email || '-';
                            const isAdmin = user.is_admin;
                            const provider = user.provider || 'email';

                            const toggleAdmin = async () => {
                                if (!confirm(`${name}님의 관리자 권한을 변경하시겠습니까?`)) return;

                                try {
                                    const { error } = await supabase
                                        .from('profiles')
                                        .update({ is_admin: !isAdmin })
                                        .eq('id', user.id);

                                    if (error) throw error;

                                    alert("권한이 변경되었습니다.");
                                    fetchUsers();
                                } catch (e) {
                                    console.error(e);
                                    alert("권한 변경 실패: " + e.message);
                                }
                            };

                            return (
                                <tr key={user.id}>
                                    <td>
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatar}>
                                                {avatar ? (
                                                    <img src={avatar} alt={name} />
                                                ) : (
                                                    <span className={styles.avatarPlaceholder}>
                                                        {name ? name[0] : '?'}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.time}>
                                        {formatDate(user.created_at)}
                                    </td>
                                    <td className={styles.badge}>
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            backgroundColor: provider === 'google' ? '#e0f2fe' : '#f3f4f6',
                                            color: provider === 'google' ? '#0284c7' : '#4b5563'
                                        }}>
                                            {provider}
                                        </span>
                                    </td>
                                    <td className={styles.email}>
                                        {email}
                                    </td>
                                    <td>
                                        {isAdmin ? (
                                            <span className={`${styles.badge} ${styles.badgeAdmin}`}>Admin</span>
                                        ) : (
                                            <span className={`${styles.badge} ${styles.badgeUser}`}>User</span>
                                        )}
                                    </td>
                                    <td>
                                        <button className={styles.actionButton} title="권한 관리" onClick={toggleAdmin}>
                                            <Shield size={16} color={isAdmin ? "#ef4444" : "#9ca3af"} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
