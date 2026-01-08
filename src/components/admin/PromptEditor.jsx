import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Ensure correct path
import { Save, RotateCcw, Play, CheckCircle, AlertCircle } from 'lucide-react';

const PromptEditor = () => {
    const [prompt, setPrompt] = useState({ id: '', content: '', description: '', version: 0 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    useEffect(() => {
        fetchPrompt();
    }, []);

    const fetchPrompt = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('prompt_config')
                .select('*')
                .eq('key', 'main_system_prompt')
                .single();

            if (error) throw error;

            if (data) {
                setPrompt(data);
            } else {
                // If not found, maybe insert default? Or just show empty
                setStatus({ type: 'info', message: '저장된 프롬프트가 없습니다. 초기화가 필요합니다.' });
            }
        } catch (error) {
            console.error('Error fetching prompt:', error);
            setStatus({ type: 'error', message: '프롬프트를 불러오는데 실패했습니다: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            const { error } = await supabase
                .from('prompt_config')
                .upsert({
                    key: 'main_system_prompt', // Upsert based on unique key
                    content: prompt.content,
                    description: prompt.description,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            setStatus({ type: 'success', message: '프롬프트가 성공적으로 저장되었습니다! 다음 대화부터 적용됩니다.' });

            // Re-fetch to confirm and update metadata if any
            await fetchPrompt();

        } catch (error) {
            console.error('Error saving prompt:', error);
            setStatus({ type: 'error', message: '저장 실패: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>시스템 프롬프트 편집</h3>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>
                        AI(안심씨)의 성격, 말투, 금기사항을 정의하는 최상위 지침입니다.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={fetchPrompt}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1rem', borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer',
                            color: '#374151', fontSize: '0.9rem'
                        }}
                    >
                        <RotateCcw size={16} /> 초기화
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                            border: 'none', backgroundColor: '#2563eb', cursor: saving ? 'not-allowed' : 'pointer',
                            color: 'white', fontWeight: 500, opacity: saving ? 0.7 : 1, fontSize: '0.9rem'
                        }}
                    >
                        {saving ? '저장 중...' : <><Save size={16} /> 변경사항 저장</>}
                    </button>
                </div>
            </div>

            {/* Status Message */}
            {status && (
                <div style={{
                    marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.5rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    backgroundColor: status.type === 'error' ? '#fef2f2' : status.type === 'success' ? '#f0fdf4' : '#eff6ff',
                    color: status.type === 'error' ? '#991b1b' : status.type === 'success' ? '#166534' : '#1e40af',
                    border: `1px solid ${status.type === 'error' ? '#fee2e2' : status.type === 'success' ? '#bbf7d0' : '#dbeafe'}`
                }}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{status.message}</span>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>로딩 중...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
                    {/* Main Editor */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>메인 프롬프트 내용</label>
                            <textarea
                                value={prompt.content}
                                onChange={(e) => setPrompt({ ...prompt, content: e.target.value })}
                                placeholder="You are Ansimssi..."
                                style={{
                                    width: '100%', height: '500px', padding: '1rem', fontSize: '0.95rem', lineHeight: '1.6',
                                    borderRadius: '0.5rem', border: '1px solid #d1d5db', fontFamily: 'monospace',
                                    resize: 'vertical', backgroundColor: '#f9fafb'
                                }}
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {/* Metadata / Sidebar Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#111827' }}>정보</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>설명 (Description)</label>
                                    <input
                                        type="text"
                                        value={prompt.description || ''}
                                        onChange={(e) => setPrompt({ ...prompt, description: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>키 (Key)</label>
                                    <input
                                        type="text"
                                        value={prompt.key || ''}
                                        disabled
                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem', backgroundColor: '#f3f4f6', color: '#6b7280' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>마지막 수정</label>
                                    <div style={{ fontSize: '0.9rem', color: '#111827' }}>
                                        {prompt.updated_at ? new Date(prompt.updated_at).toLocaleString() : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fcd34d' }}>
                            <h5 style={{ margin: '0 0 0.5rem 0', color: '#92400e', fontSize: '0.95rem' }}>💡 팁</h5>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309', lineHeight: '1.5' }}>
                                프롬프트 변경 시, 'MANDATORY'라고 표시된 섹션은 최대한 유지하는 것이 좋습니다. 의료/안전 관련 안전장치들입니다.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromptEditor;
