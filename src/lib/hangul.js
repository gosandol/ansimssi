
const CHOSUNG = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

/**
 * Checks if a character is a Hangul syllable.
 */
const isHangul = (char) => {
    const code = char.charCodeAt(0);
    return code >= 0xAC00 && code <= 0xD7A3;
};

/**
 * Extracts the Chosung (Initial Consonant) from a Hangul string.
 * Non-Hangul characters are kept as is.
 * Example: "감기" -> "ㄱㄱ", "Apple" -> "Apple"
 */
export const getChosung = (str) => {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (isHangul(char)) {
            const code = char.charCodeAt(0) - 0xAC00;
            const chosungIndex = Math.floor(code / 28 / 21);
            result += CHOSUNG[chosungIndex];
        } else {
            result += char;
        }
    }
    return result;
};

/**
 * Checks if the query matches the target string based on:
 * 1. Standard inclusion (target includes query)
 * 2. Chosung match (target's Chosung includes query)
 * 
 * @param {string} query - The search query (e.g., "ㄱㄱ")
 * @param {string} target - The target keyword (e.g., "감기")
 */
export const isKoreanMatch = (query, target) => {
    if (!query || !target) return false;

    // Normalize (remove spaces for loose matching if desired, keeping simple for now)
    const q = query.replace(/\s+/g, '');
    const t = target.replace(/\s+/g, '');

    // 1. Direct match (e.g., "감" match "감기")
    if (t.includes(q)) return true;

    // 2. Chosung match (e.g., "ㄱㄱ" match "감기")
    // Only attempt if the query contains valid Chosung characters
    // (This is a simplified check. Ideally we verify query is mostly Chosung)
    const targetChosung = getChosung(t);
    if (targetChosung.includes(q)) return true;

    return false;
};
