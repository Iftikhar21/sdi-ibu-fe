import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

export const themeStorageKey = 'theme';

export interface ThemeApi {
    theme: ThemeMode;
    toggleTheme: () => void;
    setTheme: (theme: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeApi | null>(null);

export function applyTheme(theme: ThemeMode) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(themeStorageKey, theme);
}

export function getInitialTheme(): ThemeMode {
    const stored = localStorage.getItem(themeStorageKey);

    if (stored === 'dark' || stored === 'light') {
        return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme(): ThemeApi {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme harus dipakai di dalam <ThemeProvider>');
    }

    return context;
}
