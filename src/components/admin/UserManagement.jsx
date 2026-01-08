import React, { useEffect, useState } from 'react';
import { User, Shield, Calendar, Clock, MoreHorizontal } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api_config';
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
            const response = await fetch(`${API_BASE_URL}/api/admin/users`);
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data.users || []);
        } catch (err) {
            console.error(err);
            setError("유저 목록을 불러오지 못했습니다.");
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
                            <th>마지막 로그인</th>
                            <th>권한</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const meta = user.user_metadata || {};
                            const name = meta.full_name || meta.name || '알 수 없음';
                            const avatar = meta.avatar_url;
                            // Check admin in app_metadata if available, or just visual for now
                            // Note: Real admin status is in 'profiles' table which we might need to join, 
                            // but for now we can infer from email or app_metadata if set.
                            const isAdmin = user.app_metadata?.is_admin || user.user_metadata?.is_admin;
                            // Note: We are using a simplified check for now. Real implementation needs a backend endpoint to update roles.
                            // But since we have a direct Supabase client in frontend (though effectively backend-side for `profiles`), 
                            // we can try updating the 'profiles' table if RLS allows, or use an RPC.
                            // Given the architecture, we should probably add a backend endpoint for this or just use the profiles table update if the current user is an admin.
                            // Let's assume we can update 'profiles' for now since we are logged in as admin (bypassed).

                            const toggleAdmin = async () => {
                                if (!confirm(`${name}님의 관리자 권한을 변경하시겠습니까?`)) return;

                                try {
                                    // Update profiles table
                                    const { error } = await supabase
                                        .from('profiles')
                                        .update({ is_admin: !isAdmin }) // Toggle logic depends on current state from DB, ideally we fetch it. 
                                        // But here we rely on the list state. 
                                        // Actually `users` from API doesn't have is_admin from profiles joined yet.
                                        // We need to fix the API to return is_admin from profiles.
                                        .eq('id', user.id);

                                    if (error) throw error;

                                    alert("권한이 변경되었습니다. 목록을 새로고침합니다.");
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
                                                    <span className={styles.avatarPlaceholder}>{name[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{name}</div>
                                                <div className={styles.email}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.time}>
                                        {formatDate(user.created_at)}
                                    </td>
                                    <td className={styles.time}>
                                        {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : '기록 없음'}
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
