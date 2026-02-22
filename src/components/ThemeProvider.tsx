'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
    theme: 'dark',
    toggle: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        const stored = localStorage.getItem('ss-theme') as Theme | null;
        const initial = stored ?? 'dark';
        setTheme(initial);
        document.documentElement.classList.toggle('light', initial === 'light');
    }, []);

    const toggle = () => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('ss-theme', next);
            document.documentElement.classList.toggle('light', next === 'light');
            return next;
        });
    };

    return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
