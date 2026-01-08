import React from 'react';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = ({ onBack }) => {
    return (
        <div style={{ height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-secondary)',
                            padding: 0
                        }}
                    >
                        <ArrowLeft size={20} />
                        <span>돌아가기</span>
                    </button>
                </div>

                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 700 }}>이용약관</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>최종 수정일: 2026년 1월 9일</p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>제1조 (목적)</h2>
                    <p>본 약관은 '한애전자(주)'(이하 "회사"라 함)가 제공하는 제반 서비스 '우리집 AI 안심씨'(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>제2조 (용어의 정의)</h2>
                    <ol style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        <li>"서비스"란 단말기(PC, 휴대형단말기 등)에 상관없이 회원이 이용할 수 있는 우리집 AI 안심씨 및 관련 제반 서비스를 의미합니다.</li>
                        <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                        <li>"회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                    </ol>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>제3조 (약관의 명시와 개정)</h2>
                    <p>회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 "약관의 규제에 관한 법률", "정보통신망 이용촉진 및 정보보호 등에 관한 법률" 등 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>제4조 (AI 서비스의 특성 및 한계)</h2>
                    <ol style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        <li>본 서비스는 인공지능(AI) 기술을 기반으로 정보를 제공하며, AI의 특성상 생성된 답변의 완전성, 정확성, 신뢰성, 최신성을 보증하지 않습니다.</li>
                        <li>AI가 생성한 정보에는 부정확하거나 편향된 내용(Hallucination)이 포함될 수 있으며, 이용자는 이를 비판적으로 검토하여 활용해야 합니다.</li>
                        <li>서비스가 제공하는 건강 및 안전 정보는 참고용일 뿐이며, 의사, 변호사 등 전문가의 전문적인 조언이나 진단을 대체할 수 없습니다. 중요한 결정 전에는 반드시 전문가와 상의해야 합니다.</li>
                    </ol>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>제5조 (개인정보보호 의무)</h2>
                    <p>회사는 "정보통신망법" 등 관계 법령이 정하는 바에 따라 이용자의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>제6조 (면책조항)</h2>
                    <ol style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우 서비스 제공에 관한 책임이 면제됩니다.</li>
                        <li>회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 서비스를 통해 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</li>
                        <li>회사는 AI가 생성한 정보의 오류나 그로 인해 발생한 직/간접적인 손해에 대해 법적인 책임을 지지 않습니다.</li>
                    </ol>
                </section>

                <section style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.9rem' }}>
                    <p><strong>주소:</strong> 서울특별시 용산구 효창원로 66길 17, 2층</p>
                    <p><strong>문의:</strong> support@ansimssi.ai</p>
                </section>
            </div>
        </div>
    );
};

export default TermsOfService;
