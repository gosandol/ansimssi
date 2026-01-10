import React, { useState, useEffect } from 'react';
import { Plus, Bluetooth, Cloud, Server, Trash2, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const IoTManager = () => {
    // Real Data State
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('iot_devices')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching devices:", error);
            alert("데이터를 불러오지 못했습니다.");
        } else {
            setDevices(data || []);
        }
        setLoading(false);
    };

    const [showForm, setShowForm] = useState(false);
    const [newDevice, setNewDevice] = useState({ name: '', description: '', type: 'BLE', service_id: '' });

    const handleAdd = async () => {
        if (!newDevice.name || !newDevice.service_id) {
            alert("기기 이름과 ID는 필수입니다.");
            return;
        }

        const { data, error } = await supabase
            .from('iot_devices')
            .insert([{
                name: newDevice.name,
                description: newDevice.description,
                type: newDevice.type,
                service_id: newDevice.service_id
            }])
            .select();

        if (error) {
            console.error("Error adding device:", error);
            alert("기기 등록 실패: " + error.message);
        } else {
            setDevices([data[0], ...devices]); // Optimistic update or use returned data
            setShowForm(false);
            setNewDevice({ name: '', description: '', type: 'BLE', service_id: '' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("정말 이 기기 프로파일을 삭제하시겠습니까?")) return;

        const { error } = await supabase
            .from('iot_devices')
            .delete()
            .eq('id', id);

        if (error) {
            alert("삭제 실패: " + error.message);
        } else {
            setDevices(devices.filter(d => d.id !== id));
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>IoT 기기 레지스트리</h2>
                    <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>안심씨 앱이 지원할 하드웨어 및 API 서비스를 정의합니다.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.25rem',
                        borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 500
                    }}
                >
                    <Plus size={18} />
                    <span>새 기기 추가</span>
                </button>
            </div>

            {/* List */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>기기명</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>연결 방식</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>서비스 ID / UUID</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>등록일</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map(device => (
                            <tr key={device.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        backgroundColor: device.type === 'BLE' ? '#dbeafe' : '#d1fae5',
                                        color: device.type === 'BLE' ? '#2563eb' : '#059669',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {device.type === 'BLE' ? <Bluetooth size={16} /> : <Cloud size={16} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{device.name}</div>
                                        {device.description && <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{device.description}</div>}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                                        backgroundColor: device.type === 'BLE' ? '#eff6ff' : '#ecfdf5',
                                        color: device.type === 'BLE' ? '#1d4ed8' : '#047857'
                                    }}>
                                        {device.type}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#6b7280' }}>
                                    {device.service_id}
                                </td>
                                <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                                    {new Date(device.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>
                                            <Edit size={14} color="#4b5563" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(device.id)}
                                            style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={14} color="#ef4444" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {
                showForm && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50
                    }}>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem' }}>새 기기 프로파일 등록</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>기기 이름</label>
                                    <input
                                        type="text"
                                        value={newDevice.name}
                                        onChange={e => setNewDevice({ ...newDevice, name: e.target.value })}
                                        placeholder="예: 혈압계 Model-A"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>설명 (Description)</label>
                                    <input
                                        type="text"
                                        value={newDevice.description}
                                        onChange={e => setNewDevice({ ...newDevice, description: e.target.value })}
                                        placeholder="예: 구형 모델, 파서 v2 필요"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>연결 타입</label>
                                    <select
                                        value={newDevice.type}
                                        onChange={e => setNewDevice({ ...newDevice, type: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    >
                                        <option value="BLE">Bluetooth (BLE)</option>
                                        <option value="API">Cloud API</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                                        {newDevice.type === 'BLE' ? 'Service UUID' : 'API Endpoint Key'}
                                    </label>
                                    <input
                                        type="text"
                                        value={newDevice.service_id}
                                        onChange={e => setNewDevice({ ...newDevice, service_id: e.target.value })}
                                        placeholder={newDevice.type === 'BLE' ? "00001810-0000-1000-8000-..." : "api_key_..."}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontFamily: 'monospace' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                                <button
                                    onClick={() => setShowForm(false)}
                                    style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', background: 'white', cursor: 'pointer' }}
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleAdd}
                                    style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '0.5rem', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 500 }}
                                >
                                    등록하기
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default IoTManager;
