'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa6';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-9 h-9" />;

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-all shadow-sm border border-transparent dark:border-gray-700"
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? (
                <FaSun className="text-lg animate-in fade-in zoom-in duration-300" />
            ) : (
                <FaMoon className="text-lg animate-in fade-in zoom-in duration-300" />
            )}
        </button>
    );
}
