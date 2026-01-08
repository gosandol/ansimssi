import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ShieldAlert, LayoutDashboard, Users, MessageSquare, Settings, LogOut } from 'lucide-react';
import PromptEditor from '../components/admin/PromptEditor';

const AdminView = ({ onBack }) => {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/'; // Redirect if not logged in
            return;
        }

        // Check is_admin column in profiles
        const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (error || !data || !data.is_admin) {
            alert("관리자 권한이 없습니다.");
            window.location.href = '/';
            return;
        }

        setIsAdmin(true);
        setLoading(false);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
            <div className="spinner"></div>
            <p>보안 점검 중...</p>
        </div>
    );

    if (!isAdmin) return null;

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
            {/* Sidebar */}
            <div style={{ width: '250px', backgroundColor: '#111827', color: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert color="#ef4444" />
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Ansimssi Ops</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="대시보드"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <NavItem
                        icon={<MessageSquare size={20} />}
                        label="AI 프롬프트/모델"
                        active={activeTab === 'ai_ops'}
                        onClick={() => setActiveTab('ai_ops')}
                    />
                    <NavItem
                        icon={<Users size={20} />}
                        label="회원 관리"
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                    />
                    <NavItem
                        icon={<Settings size={20} />}
                        label="시스템 설정"
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </nav>

                <div style={{ borderTop: '1px solid #374151', paddingTop: '1rem' }}>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', width: '100%', textAlign: 'left' }}
                    >
                        <LogOut size={18} />
                        <span>나가기</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                <header style={{ backgroundColor: 'white', padding: '1rem 2rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                        {activeTab === 'dashboard' && '운영 현황 (Dashboard)'}
                        {activeTab === 'ai_ops' && 'AI 작전 사령부 (LLMOps)'}
                        {activeTab === 'users' && '회원 관리 (CRM)'}
                        {activeTab === 'settings' && '시스템 설정'}
                    </h2>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        Admin Mode Active
                    </div>
                </header>

                <main style={{ padding: '2rem' }}>
                    {activeTab === 'dashboard' && <DashboardPlaceholder />}
                    {activeTab === 'ai_ops' && <div style={{ padding: '0rem' }}><PromptEditor /></div>}
                    {activeTab === 'users' && <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>준비 중입니다...</div>}
                    {activeTab === 'settings' && <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>준비 중입니다...</div>}
                </main>
            </div>
        </div>
    );
};

// Sub-components
const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: active ? '#374151' : 'transparent',
            color: active ? 'white' : '#d1d5db',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            fontWeight: active ? 500 : 400
        }}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const DashboardPlaceholder = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard label="오늘 방문자" value="1,234" delta="+12%" />
        <StatCard label="AI 대화 생성수" value="8,540" delta="+5%" />
        <StatCard label="활성 회원" value="450" delta="+2%" />
        <StatCard label="API 오류율" value="0.01%" delta="Stable" good />
    </div>
);

const StatCard = ({ label, value, delta, good }) => (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{label}</div>
        <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>{value}</div>
        <div style={{ fontSize: '0.875rem', color: good ? '#059669' : '#2563eb', marginTop: '0.5rem' }}>{delta}</div>
    </div>
);

export default AdminView;
