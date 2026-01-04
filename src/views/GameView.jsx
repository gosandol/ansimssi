import React from 'react';

const GameView = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#888',
            flexDirection: 'column'
        }}>
            <h2 style={{ color: 'white' }}>게임 (Game)</h2>
            <p>가족 및 시니어 대상 오락용 게임 콘텐츠가 준비 중입니다.</p>
        </div>
    );
};

export default GameView;
