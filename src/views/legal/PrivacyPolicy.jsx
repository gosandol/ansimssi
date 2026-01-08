import React from 'react';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = ({ onBack }) => {
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

                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 700 }}>개인정보처리방침</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>최종 수정일: 2026년 1월 9일</p>

                <p style={{ marginBottom: '2rem' }}>
                    '한애전자(주)'(이하 "회사")는 개인정보 보호법 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리지침을 수립∙공개합니다.
                </p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>1. 개인정보의 처리 목적</h2>
                    <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                    <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li>회원 가입 및 관리</li>
                        <li>서비스 제공 (AI 맞춤형 정보 제공, 가족 돌봄 기능 등)</li>
                        <li>고충 처리 및 상담</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>2. 처리하는 개인정보의 항목</h2>
                    <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
                    <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li>필수항목: 이메일, 비밀번호, 이름(닉네임), 프로필 사진</li>
                        <li>선택항목: 가족 구성원 정보, 건강 관심사 등</li>
                        <li>서비스 이용 과정에서 생성: IP 주소, 쿠키, 서비스 이용 기록, 기기 정보</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>3. 개인정보의 처리 및 보유 기간</h2>
                    <p>회사는 법령에 따른 개인정보 보유∙이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유∙이용기간 내에서 개인정보를 처리∙보유합니다.</p>
                    <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li>회원 탈퇴 시까지</li>
                        <li>관계 법령 위반에 따른 수사∙조사 등이 진행 중인 경우에는 해당 수사∙조사 종료 시까지</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>4. 개인정보의 제3자 제공</h2>
                    <p>회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>5. 인공지능(AI) 학습 데이터의 활용</h2>
                    <p>회사는 서비스 품질 향상 및 AI 모델 고도화를 위하여 수집된 데이터를 다음과 같이 활용할 수 있습니다.</p>
                    <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li>서비스 이용 과정에서 생성된 대화 데이터 등은 개인을 식별할 수 없는 형태로 비식별화 처리된 후, AI 모델의 성능 개선 및 학습 목적으로 활용될 수 있습니다.</li>
                        <li>이용자는 언제든지 본인의 데이터가 AI 학습에 활용되는 것을 거부할 권리가 있으며, 거부 의사는 개인정보 보호책임자에게 문의하여 행사할 수 있습니다.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>6. 정보주체의 권리∙의무 및 그 행사방법</h2>
                    <p>이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
                    <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li>개인정보 열람 요구</li>
                        <li>오류 등이 있을 경우 정정 요구</li>
                        <li>삭제 요구</li>
                        <li>처리정지 요구</li>
                    </ol>
                </section>

                <section style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.9rem' }}>
                    <p><strong>개인정보 보호책임자 (CPO)</strong></p>
                    <p>성명: 최용경</p>
                    <p>연락처: support@ansimssi.ai</p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
