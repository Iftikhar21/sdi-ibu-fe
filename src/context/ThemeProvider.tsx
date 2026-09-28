import { useCallback, useEffect, useMemo, useState } from 'react';
import { applyTheme, getInitialTheme, ThemeContext, type ThemeMode } from './theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>(() => getInitialTheme());

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const setTheme = useCallback((next: ThemeMode) => setThemeState(next), []);

    const toggleTheme = useCallback(
        () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
        []
    );

    const api = useMemo(
        () => ({ theme, toggleTheme, setTheme }),
        [theme, toggleTheme, setTheme]
    );

    return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>;
}
