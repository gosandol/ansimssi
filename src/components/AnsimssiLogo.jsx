import React from 'react';

const AnsimssiLogo = ({ size = 24, className }) => {
    return (
        <div style={{ position: 'relative', width: size, height: size }} className={className}>
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="ansimssiGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#22d3ee" />
                        <stop offset="0.5" stopColor="#818cf8" />
                        <stop offset="1" stopColor="#c084fc" />
                    </linearGradient>
                </defs>
                <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    stroke="url(#ansimssiGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M9 10h6"
                    stroke="url(#ansimssiGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 7v6"
                    stroke="url(#ansimssiGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};

export default AnsimssiLogo;
