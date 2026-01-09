import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import GlobalHeader from '../components/layout/GlobalHeader';
import styles from './MainLayout.module.css';
import { X } from 'lucide-react';

const MainLayout = ({ children, onNewThread, activeView, session, onLoginClick, onSettingsClick, isThreadMode, onBackClick }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Default collapsed on desktop (Rail mode)

    const toggleSidebar = () => {
        if (window.innerWidth <= 768) {
            setIsMobileMenuOpen(!isMobileMenuOpen);
        } else {
            setIsSidebarCollapsed(!isSidebarCollapsed);
        }
    };

    return (
        <div className={styles.container}>
            {/* Desktop Sidebar (Rail/Expanded) - Moves to sibling of MainColumn */}
            <div className={`${styles.desktopSidebarWrapper} ${isSidebarCollapsed ? styles.collapsed : styles.expanded}`}>
                <Sidebar
                    onNewThread={onNewThread}
                    activeView={activeView}
                    session={session}
                    onLoginClick={onLoginClick}
                    onSettingsClick={onSettingsClick} // Pass down
                    collapsed={isSidebarCollapsed}
                    onToggle={toggleSidebar}
                />
            </div>

            {/* Main Column (Header + Content) */}
            <div className={styles.mainColumn}>
                <div className={styles.headerWrapper}>
                    <GlobalHeader
                        onMenuClick={toggleSidebar}
                        session={session}
                        isThreadMode={isThreadMode}
                        onBackClick={onBackClick}
                        onLoginClick={onLoginClick}
                    />
                </div>

                <div className={styles.bodyWrapper}>
                    <main className={`${styles.mainContent} ${isThreadMode ? styles.noScroll : ''}`}>
                        {children}
                    </main>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMobileMenuOpen && (
                <div className={styles.mobileDrawer} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={styles.drawerSidebarWrapper} onClick={(e) => e.stopPropagation()}>
                        <Sidebar
                            className={styles.drawerSidebar}
                            activeView={activeView}
                            session={session}
                            onLoginClick={onLoginClick}
                            onNewThread={(type) => {
                                if (onNewThread) onNewThread(type);
                                setIsMobileMenuOpen(false);
                            }}
                            collapsed={false} // Always expanded in drawer
                            onToggle={() => setIsMobileMenuOpen(false)}
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default MainLayout;
