'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface DarkModeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Initialize dark mode from localStorage after mount
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (stored !== null) {
            setIsDarkMode(stored === 'true');
        } else {
            setIsDarkMode(prefersDark);
        }
    }, []);

    // Apply dark mode class to document
    useEffect(() => {
        if (!mounted) return;

        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(isDarkMode));
    }, [isDarkMode, mounted]);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkMode() {
    const context = useContext(DarkModeContext);
    if (context === undefined) {
        throw new Error('useDarkMode must be used within DarkModeProvider');
    }
    return context;
}
