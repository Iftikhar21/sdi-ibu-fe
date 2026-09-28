import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/theme';

interface ThemeToggleProps {
    /** `button` untuk ikon bulat, `text` untuk menu berbentuk baris. */
    variant?: 'button' | 'text';
    className?: string;
}

export default function ThemeToggle({ variant = 'button', className = '' }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const label = isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap';

    if (variant === 'text') {
        return (
            <button
                type="button"
                onClick={toggleTheme}
                aria-label={label}
                title={label}
                className={`flex w-full items-center gap-3 transition-colors ${className}`}
            >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={label}
            title={label}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${className}`}
        >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
    );
}
