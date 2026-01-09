import { Activity, ShieldCheck, Sun, Heart, DollarSign, PenTool, Coffee, Search, Smile, BookOpen, AlertCircle, ShoppingCart } from 'lucide-react';

// Icons mapping for easier usage or dynamic assignment if needed
// For now, we manually assign icons for variety
const ICONS = {
    health: <Activity size={16} />,
    safety: <ShieldCheck size={16} />,
    weather: <Sun size={16} />,
    care: <Heart size={16} />,
    finance: <DollarSign size={16} />,
    hobby: <PenTool size={16} />,
    life: <Coffee size={16} />,
    search: <Search size={16} />,
    kids: <Smile size={16} />,
    study: <BookOpen size={16} />,
    alert: <AlertCircle size={16} />,
    shop: <ShoppingCart size={16} />
};

export const PROFILE_SUGGESTIONS = {
    // 👴 Senior (Grandparents) - Health, Safety, Local Info
    senior: [
        { text: '고혈압에 좋은 음식 알려줘', icon: ICONS.health },
        { text: '관절염 무릎 운동법 영상', icon: ICONS.health },
        { text: '가까운 보건소 위치 알려줘', icon: ICONS.safety },
        { text: '오늘 날씨랑 미세먼지 어때?', icon: ICONS.weather },
        { text: '돋보기 글씨 크게 보는 법', icon: ICONS.life },
        { text: '미스트롯 재방송 시간 언제야?', icon: ICONS.hobby },
        { text: '임플란트 건강보험 적용 나이', icon: ICONS.finance },
        { text: '소화 잘 되는 죽 만드는 법', icon: ICONS.life },
        { text: '보이스피싱 예방하는 방법', icon: ICONS.safety },
        { text: '치매 예방 뇌 운동 퀴즈', icon: ICONS.health }
    ],

    // 👨 Father (Dad) - Finance, Car, Hobby, News
    father: [
        { text: '요즘 뜨는 주식 종목 보여줘', icon: ICONS.finance },
        { text: '주말 낚시하기 좋은 포인트', icon: ICONS.hobby },
        { text: '자동차 엔진오일 교체 주기', icon: ICONS.life },
        { text: '이번 주 로또 당첨 번호', icon: ICONS.finance },
        { text: '골프 스윙 잘하는 법 영상', icon: ICONS.hobby },
        { text: '최신 스마트폰 성능 비교', icon: ICONS.search },
        { text: '가성비 좋은 점심 맛집 추천', icon: ICONS.life },
        { text: '부동산 뉴스 요약해줘', icon: ICONS.finance },
        { text: '숙취 해소에 좋은 음식', icon: ICONS.health },
        { text: '넷플릭스 요즘 볼만한 액션 영화', icon: ICONS.hobby }
    ],

    // 👩 Mother (Mom) - Recipe, Education, Shopping, Life
    mother: [
        { text: '오늘 저녁 메뉴 추천해줘 (간단)', icon: ICONS.life },
        { text: '아이들 간식 만들기 쉬운 레시피', icon: ICONS.life },
        { text: '근처 대형마트 휴무일 언제야?', icon: ICONS.shop },
        { text: '초등학생 필독 도서 리스트', icon: ICONS.study },
        { text: '세탁기 냄새 제거하는 방법', icon: ICONS.life },
        { text: '주말에 아이랑 갈만한 곳', icon: ICONS.kids },
        { text: '요가 스트레칭 영상 틀어줘', icon: ICONS.health },
        { text: '냉장고 파먹기 요리 추천', icon: ICONS.life },
        { text: '분리수거 헷갈리는 품목 검색', icon: ICONS.safety },
        { text: '요즘 유행하는 인테리어 소품', icon: ICONS.shop }
    ],

    // 🧒 Child (Kids) - Fun, Homework, Curiosity
    child: [
        { text: '재미있는 과학 실험 영상 보여줘', icon: ICONS.study },
        { text: '숙제 도와줘: 태양계 행성 순서', icon: ICONS.study },
        { text: '공룡 이름 맞추기 퀴즈 하자', icon: ICONS.kids },
        { text: '종이접기 쉬운 방법 알려줘', icon: ICONS.hobby },
        { text: '주말에 갈만한 놀이공원 추천', icon: ICONS.life },
        { text: '강아지는 왜 꼬리를 흔들어?', icon: ICONS.search },
        { text: '마인크래프트 집 짓는 꿀팁', icon: ICONS.game || ICONS.hobby }, // Fallback if game icon undefined
        { text: '구구단송 노래 틀어줘', icon: ICONS.study },
        { text: '편식 안 하는 법 알려줘', icon: ICONS.health },
        { text: '인기 있는 아이돌 노래 들려줘', icon: ICONS.hobby }
    ],

    // 👤 Default (Visitor/Unknown) - General Safety & Trending
    default: [
        { text: '고혈압 관리 방법 알려줘', icon: ICONS.health },
        { text: '우리집 안전 점검 리스트', icon: ICONS.safety },
        { text: '오늘 미세먼지 농도 어때?', icon: ICONS.weather },
        { text: '가까운 응급실 찾기', icon: ICONS.alert },
        { text: '생활 속 응급처치 방법', icon: ICONS.health },
        { text: '요즘 인기 있는 건강 뉴스', icon: ICONS.search }
    ]
};

/**
 * Returns 3 random suggestions for a given profile role.
 * @param {string} role - 'father', 'mother', 'senior', 'child' (or undefined)
 * @returns {Array} Array of 3 suggestion objects
 */
export const getSuggestionsForProfile = (role) => {
    // Normalize role to lowercase, default to 'default' if not found
    const key = (role && PROFILE_SUGGESTIONS[role.toLowerCase()]) ? role.toLowerCase() : 'default';
    const pool = PROFILE_SUGGESTIONS[key];

    // Safety check
    if (!pool || pool.length === 0) return PROFILE_SUGGESTIONS.default.slice(0, 3);

    // Shuffle and pick 3
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
};
