import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Options: 'system', 'light', 'dark'
    // Default to 'system'
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'system';
    });

    useEffect(() => {
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    useEffect(() => {
        const root = document.documentElement;

        // Clean up previous classes
        root.classList.remove('light-theme');
        root.classList.remove('dark-theme');

        if (theme === 'light') {
            root.classList.add('light-theme');
            return;
        }

        if (theme === 'dark') {
            // Default is dark, so we just ensure light-theme is gone
            return;
        }

        // If 'system'
        if (theme === 'system') {
            const mql = window.matchMedia('(prefers-color-scheme: dark)');

            const applySystemTheme = (e) => {
                const isDark = e ? e.matches : mql.matches;
                if (isDark) {
                    root.classList.remove('light-theme');
                } else {
                    root.classList.add('light-theme');
                }
            };

            // Apply initially
            applySystemTheme();

            // Event Listener
            const handleChange = (e) => applySystemTheme(e);

            if (mql.addEventListener) {
                mql.addEventListener('change', handleChange);
            } else if (mql.addListener) {
                // Fallback for older browsers
                mql.addListener(handleChange);
            }

            return () => {
                if (mql.removeEventListener) {
                    mql.removeEventListener('change', handleChange);
                } else if (mql.removeListener) {
                    mql.removeListener(handleChange);
                }
            };
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
