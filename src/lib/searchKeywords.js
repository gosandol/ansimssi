export const SMART_SUGGESTIONS = [
    // --- Core Services (핵심 서비스) ---
    {
        keyword: "안심씨",
        intents: [
            { query: "안심씨가 뭐예요?", type: "info", label: "안심씨 AI 소개" },
            { query: "안심씨 사용법 알려줘", type: "guide", label: "안심씨 사용 가이드" }
        ]
    },
    {
        keyword: "우리집",
        intents: [
            { query: "우리집 안전 점검 해줘", type: "check", label: "우리집 안전 점검 시작" },
            { query: "월패드 연동 상태 확인", type: "troubleshoot", label: "월패드 연동 상태" }
        ]
    },
    {
        keyword: "비대면진료",
        intents: [
            { query: "비대면 진료 신청 방법", type: "guide", label: "비대면 진료 신청 가이드" },
            { query: "근처 비대면 진료 가능 병원", type: "map", label: "비대면 진료 병원 찾기" }
        ]
    },
    {
        keyword: "새로닥터",
        intents: [
            { query: "새로닥터 앱 설치", type: "app", label: "새로닥터 앱 다운로드" },
            { query: "새로닥터 진료 후기", type: "review", label: "새로닥터 진료 후기 확인" }
        ]
    },
    {
        keyword: "병원",
        intents: [
            { query: "내 주변 병원 찾아줘", type: "map", label: "내 주변 병원 찾기" },
            { query: "야간 진료 병원 검색", type: "map", label: "야간 진료 병원 찾기" }
        ]
    },
    {
        keyword: "약국",
        intents: [
            { query: "당번 약국 찾기", type: "map", label: "휴일/심야 약국 찾기" },
            { query: "편의점 상비약 종류", type: "info", label: "편의점 안전상비의약품" }
        ]
    },
    {
        keyword: "안심프렌즈",
        intents: [
            { query: "안심프렌즈 소개", type: "info", label: "안심프렌즈 서비스 소개" },
            { query: "안심프렌즈 신청 방법", type: "guide", label: "안심프렌즈 이용 신청" }
        ]
    },
    {
        keyword: "건강",
        intents: [
            { query: "오늘의 건강 상식 알려줘", type: "tips", label: "오늘의 건강 팁" },
            { query: "건강검진 대상 조회", type: "check", label: "국가건강검진 대상 확인" }
        ]
    },
    {
        keyword: "안전",
        intents: [
            { query: "우리 동네 치안 정보", type: "map", label: "우리 동네 생활안전지도" },
            { query: "재난 대처 요령", type: "guide", label: "비상시 국민행동요령" }
        ]
    },
    {
        keyword: "치매예방",
        intents: [
            { query: "치매 초기 증상 테스트", type: "check", label: "간단 치매 자가진단" },
            { query: "치매 예방 게임 추천", type: "reco", label: "치매 예방 두뇌 게임" }
        ]
    },

    // --- Health (건강) ---
    {
        keyword: "감기",
        intents: [
            { query: "감기 빨리 낫는 꿀팁 알려줘", type: "tips", label: "감기 빨리 낫는 법 (꿀팁)" },
            { query: "주변 이비인후과 찾아줘", type: "map", label: "근처 감기 진료 병원 찾기" },
            { query: "감기에 좋은 차 추천해줘", type: "reco", label: "감기에 좋은 차 추천" }
        ]
    },
    {
        keyword: "고혈압",
        intents: [
            { query: "고혈압 낮추는 식단 알려줘", type: "tips", label: "고혈압 관리 식단 가이드" },
            { query: "고혈압 정상 수치가 얼마야?", type: "info", label: "혈압 정상 범위 확인" }
        ]
    },
    {
        keyword: "당뇨",
        intents: [
            { query: "당뇨 초기증상 알려줘", type: "info", label: "당뇨 초기증상 체크" },
            { query: "당뇨에 좋은 과일 추천", type: "reco", label: "당뇨 환자 추천 과일" }
        ]
    },

    // --- Life (생활) ---
    {
        keyword: "미세먼지",
        intents: [
            { query: "오늘 미세먼지 농도 어때?", type: "weather", label: "오늘 미세먼지 확인" },
            { query: "미세먼지 마스크 추천해줘", type: "reco", label: "미세먼지 마스크 추천" }
        ]
    },
    {
        keyword: "버스",
        intents: [
            { query: "가장 가까운 버스 정류장 어디야?", type: "map", label: "근처 정류장 찾기" },
            { query: "막차 시간 알려줘", type: "info", label: "버스 막차 시간 확인" }
        ]
    },
    {
        keyword: "분리수거",
        intents: [
            { query: "페트병 분리수거 방법", type: "guide", label: "페트병 올바른 분리배출" },
            { query: "대형 폐기물 스티커 가격", type: "info", label: "대형 폐기물 수수료 확인" }
        ]
    },

    // --- Tech (기술/월패드) ---
    {
        keyword: "월패드",
        intents: [
            { query: "월패드 사용법 영상 보여줘", type: "guide", label: "월패드 사용 가이드 영상" },
            { query: "월패드 화면이 안 나와요", type: "troubleshoot", label: "화면 고장 해결 방법 (AS)" },
            { query: "삼성 월패드 매뉴얼", type: "docs", label: "삼성 월패드 매뉴얼 보기" }
        ]
    },
    {
        keyword: "도어락",
        intents: [
            { query: "도어락 비밀번호 변경 방법", type: "guide", label: "비밀번호 변경 방법" },
            { query: "도어락 배터리 방전 시 대처법", type: "tips", label: "배터리 방전 긴급 대처" }
        ]
    },
    {
        keyword: "보일러",
        intents: [
            { query: "보일러 난방비 절약 팁", type: "tips", label: "난방비 절약 꿀팁" },
            { query: "보일러 에러코드 검색", type: "troubleshoot", label: "에러코드 의미 확인" }
        ]
    },

    // --- Education (교육) ---
    {
        keyword: "수능",
        intents: [
            { query: "수능 D-Day 계산기", type: "tool", label: "수능 디데이 확인" },
            { query: "수능 도시락 메뉴 추천", type: "reco", label: "소화 잘 되는 도시락 추천" }
        ]
    },
    {
        keyword: "공부",
        intents: [
            { query: "집중 잘 되는 백색소음 틀어줘", type: "tool", label: "집중력 향상 백색소음" },
            { query: "포모도로 공부법이 뭐야?", type: "info", label: "포모도로 학습법 소개" }
        ]
    }
];
