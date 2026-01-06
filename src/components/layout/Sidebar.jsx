import React from 'react';
import {
    MessageSquarePlus,
    Box,
    Heart,
    Smile,
    ShieldCheck,
    BookOpen,
    Gamepad2,
    MoreHorizontal,
    History,
    ChevronDown,
    ChevronRight,
    Menu,
    Search,
    ArrowLeft,
    Settings,
    Home // Added Home
} from 'lucide-react';
import { getHistory } from '../../lib/db';
import styles from './Sidebar.module.css';

const Sidebar = ({ className, onNewThread, activeView, session, onLoginClick, onSettingsClick, collapsed, onToggle }) => {
    const [history, setHistory] = React.useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = React.useState(true); // Collapsible state
    const [hoveredItem, setHoveredItem] = React.useState(null); // Track hover for tooltips
    const [isSearchMode, setIsSearchMode] = React.useState(false); // Search View State
    const [localQuery, setLocalQuery] = React.useState(''); // Search Input

    const handleSearchClick = () => {
        setIsSearchMode(true);
        if (collapsed && onToggle) {
            onToggle(); // Auto-expand if collapsed
        }
    };

    const handleBackFromSearch = () => {
        setIsSearchMode(false);
        setLocalQuery('');
    };

    // Filter history based on localQuery
    const filteredHistory = history.filter(h => h.title.toLowerCase().includes(localQuery.toLowerCase()));

    React.useEffect(() => {
        if (session) {
            const fetchHistory = async () => {
                const data = await getHistory(session.user.id);
                setHistory(data);
            };
            fetchHistory();
        } else {
            setHistory([]);
        }
    }, [session]);

    const menuItems = [
        {
            id: 'mainApp',
            label: '채팅',
            icon: <MessageSquarePlus size={20} />,
            action: () => {
                if (onNewThread) onNewThread('mainApp');
            }
        },
        {
            id: 'spaces',
            label: '우리집',
            icon: <Home size={20} />,
            action: () => {
                if (onNewThread) onNewThread('spaces');
            }
        },
        {
            id: 'health',
            label: '건강',
            icon: <Heart size={20} />,
            action: () => {
                if (onNewThread) onNewThread('health');
            }
        },
        {
            id: 'life',
            label: '생활',
            icon: <Smile size={20} />,
            action: () => {
                if (onNewThread) onNewThread('life');
            }
        },
        {
            id: 'safety',
            label: '안전',
            icon: <ShieldCheck size={20} />,
            action: () => {
                if (onNewThread) onNewThread('safety');
            }
        },
        {
            id: 'learning',
            label: '학습',
            icon: <BookOpen size={20} />,
            action: () => {
                if (onNewThread) onNewThread('learning');
            }
        },
        {
            id: 'game',
            label: '게임',
            icon: <Gamepad2 size={20} />,
            action: () => {
                if (onNewThread) onNewThread('game');
            }
        },
        {
            id: 'more',
            label: '더보기',
            icon: <MoreHorizontal size={20} />,
            action: () => {
                if (onNewThread) onNewThread('more');
            }
        }
    ];

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${className || ''}`}>

            {/* Header: Toggle between Menu and Search Input */}
            <div className={styles.sidebarHeader} style={isSearchMode ? { paddingRight: 0 } : {}}>
                {isSearchMode ? (
                    <div className={styles.searchHeaderInner}>
                        <button className={styles.iconButton} onClick={handleBackFromSearch}>
                            <ArrowLeft size={20} color="#9ca3af" />
                        </button>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="채팅 검색"
                            value={localQuery}
                            onChange={(e) => setLocalQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                ) : (
                    <button
                        className={styles.menuButton}
                        onClick={onToggle}
                        data-tooltip={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
                        aria-label={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
                    >
                        <Menu size={24} />
                    </button>
                )}
            </div>

            {/* Content Section: Toggle between Nav List and Search Results */}
            <div className={styles.navSection}>
                {isSearchMode ? (
                    <div className={styles.searchResultsContainer}>
                        <div className={styles.searchSectionHeader}>최근</div>
                        {filteredHistory.length > 0 ? (
                            filteredHistory.map((thread) => (
                                <div key={thread.id} className={styles.historyThreadItem}>
                                    <div className={styles.historyThreadContent}>
                                        {thread.title}
                                    </div>
                                    <span className={styles.historyDate}>
                                        {/* Ideally format date. Using placeholder '어제' or real date if available */}
                                        {new Date(thread.created_at).toLocaleDateString() === new Date().toLocaleDateString() ? '오늘' : '어제'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noResults}>검색 결과가 없습니다.</div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Search Button (Triggers Search Mode) */}
                        {session && (
                            <button
                                className={styles.navItem}
                                onClick={handleSearchClick}
                                title="검색"
                            >
                                <div className={styles.navContent}>
                                    <span className={styles.iconWrapper}><Search size={20} /></span>
                                    <span>검색</span>
                                </div>
                            </button>
                        )}
                        {menuItems.map((item) => (
                            <div
                                key={item.id}
                                className={styles.navItemWrapper}
                                onMouseEnter={() => !session && item.id === 'mainApp' && setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                <button
                                    className={`${styles.navItem} ${item.id === 'mainApp' ? styles.newChatButton : ''} ${activeView === item.id ? styles.active : ''}`}
                                    onClick={item.action}
                                    title={item.label}
                                >
                                    <div className={styles.navContent}>
                                        <span className={styles.iconWrapper}>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                </button>

                                {/* Login Prompt Tooltip for Chat Button (Logged Out) */}
                                {!session && item.id === 'mainApp' && hoveredItem === 'mainApp' && (
                                    <div className={styles.loginTooltip}>
                                        채팅 저장을 시작하려면 로그인하세요. 로그인하면 여기에서 최근 채팅에 검색할 수 있습니다.
                                        <span
                                            className={styles.loginLink}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onLoginClick && onLoginClick();
                                            }}
                                        >
                                            로그인
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* History Section - Standard View */}
                        {session && (
                            <>
                                <div className={styles.divider} style={{ margin: '0.5rem 0', borderTop: '1px solid var(--border-subtle)' }} />
                                <button
                                    className={styles.navItem}
                                    onClick={() => {
                                        if (collapsed) {
                                            setIsHistoryOpen(true);
                                            if (onToggle) onToggle();
                                        } else {
                                            if (isHistoryOpen) {
                                                setIsHistoryOpen(false);
                                                if (onToggle) onToggle();
                                            } else {
                                                setIsHistoryOpen(true);
                                            }
                                        }
                                    }}
                                    title="채팅 기록"
                                >
                                    <div className={styles.navContent}>
                                        <span className={styles.iconWrapper}><History size={20} /></span>
                                        <span>기록</span>
                                    </div>
                                    {!collapsed && (isHistoryOpen ? <ChevronDown size={16} color="#9ca3af" /> : <ChevronRight size={16} color="#9ca3af" />)}
                                </button>

                                {/* Recent History List - Only visible when NOT collapsed and Open */}
                                {!collapsed && isHistoryOpen && (
                                    <div className={styles.historyListContainer}>
                                        {history.map((thread) => (
                                            <div key={thread.id} className={styles.historyThreadItem}>
                                                <div className={styles.historyThreadContent}>
                                                    {thread.title}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            <div className={styles.bottomSection}>
                {/* Settings & Help */}
                <button
                    className={styles.navItem}
                    title="설정 및 도움말"
                    onClick={onSettingsClick}
                >
                    <div className={styles.navContent}>
                        <span className={styles.iconWrapper}><Settings size={20} /></span>
                        <span>설정 및 도움말</span>
                    </div>
                </button>

                {/* Location Info - Only visible when expanded */}
                {!collapsed && (
                    <div className={styles.locationInfo}>
                        <div className={styles.locationAddressRow}>
                            <span className={styles.locationDot}></span>
                            <span className={styles.locationAddress}>대한민국 경기도 광주시 퇴촌면 광동리</span>
                        </div>
                        <div className={styles.locationContextRow}>
                            <span className={styles.locationContext}>내 장소(집) 기반</span>
                            <span className={styles.locationDivider}>•</span>
                            <button className={styles.locationUpdateLink}>위치 업데이트</button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
