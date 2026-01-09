import React from 'react';

const ListeningWaveIcon = ({ size = 24, color = "white" }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            width: size,
            height: size,
            position: 'relative'
        }}>
            <style>
                {`
                    @keyframes wave {
                        0%, 100% { height: 30%; opacity: 0.7; }
                        50% { height: 100%; opacity: 1; }
                    }
                    .wave-bar {
                        width: 15%;
                        background-color: ${color};
                        border-radius: 99px;
                        animation: wave 1s ease-in-out infinite;
                    }
                    .wave-bar:nth-child(1) { animation-delay: 0.0s; height: 40%; }
                    .wave-bar:nth-child(2) { animation-delay: 0.2s; height: 80%; }
                    .wave-bar:nth-child(3) { animation-delay: 0.4s; height: 60%; }
                    .wave-bar:nth-child(4) { animation-delay: 0.1s; height: 50%; }
                `}
            </style>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
        </div>
    );
};

export default ListeningWaveIcon;
