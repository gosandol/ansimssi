import React from 'react';

const SeroDoctorLogo = ({ width = 120, height = 40, className, color }) => {
    // Adaptive Color Logic:
    // If a specific color is provided, use it.
    // Otherwise, use 'currentColor' to inherit from parent text color (Dark/Light mode safe).
    const primaryColor = color || "currentColor";

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 140 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="Sero Doctor (새로닥터) Logo"
            style={{ display: 'block' }}
        >
            {/* 
               Logotype: "새로닥터" 
               Style: Bold, modern, blocky sans-serif to match the "Sero Doctor" brand identity.
               Color: Adaptive (currentColor) for Dark/White mode visibility.
            */}
            <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill={primaryColor}
                fontFamily="'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"
                fontWeight="900"
                fontSize="28"
                letterSpacing="-1px"
            >
                새로닥터
            </text>
        </svg>
    );
};

export default SeroDoctorLogo;
