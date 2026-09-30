import { useEffect, useRef, useState } from 'react';
import { DayPicker, type Matcher } from 'react-day-picker';
import { id as indonesianLocale } from 'react-day-picker/locale/id';
import { format, parseISO } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';

interface DateInputProps {
    /** Tanggal dalam format YYYY-MM-DD (sesuai yang dipakai API). */
    value: string;
    onChange: (value: string) => void;
    /** Batas tanggal, format YYYY-MM-DD. */
    min?: string;
    max?: string;
    disabled?: boolean;
    className?: string;
    ariaLabel?: string;
    id?: string;
    placeholder?: string;
    /** Tampilkan tombol untuk mengosongkan tanggal. */
    clearable?: boolean;
    /** Tandai kolom sedang error. */
    hasError?: boolean;
}

const toDate = (value?: string) => (value ? parseISO(value) : undefined);

/**
 * Pemilih tanggal dengan kalender (react-day-picker).
 *
 * Nilai tetap dikirim sebagai string YYYY-MM-DD agar sama dengan format
 * tanggal yang dipakai API.
 */
export default function DateInput({
    value,
    onChange,
    min,
    max,
    disabled = false,
    className = '',
    ariaLabel,
    id,
    placeholder = 'Pilih tanggal',
    clearable = false,
    hasError = false,
}: DateInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedDate = toDate(value);
    const minDate = toDate(min);
    const maxDate = toDate(max);
    const currentYear = new Date().getFullYear();
    const selectedYear = selectedDate?.getFullYear();
    const calendarStart = minDate ?? new Date(
        Math.min(currentYear - 100, selectedYear ?? currentYear - 100),
        0,
        1,
    );
    const calendarEnd = maxDate ?? new Date(
        Math.max(currentYear + 20, selectedYear ?? currentYear + 20),
        11,
        31,
    );

    const disabledDays: Matcher[] = [
        ...(minDate ? [{ before: minDate }] : []),
        ...(maxDate ? [{ after: maxDate }] : []),
    ];

    // Tutup kalender saat klik di luar atau menekan Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleSelect = (date?: Date) => {
        if (!date) return;

        onChange(format(date, 'yyyy-MM-dd'));
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                id={id}
                onClick={() => !disabled && setIsOpen((open) => !open)}
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-label={ariaLabel}
                className={`flex w-full items-center gap-3 rounded-lg border bg-surface px-4 py-3 text-left text-sm shadow-sm transition-colors ${
                    hasError ? 'border-red-300' : 'border-line'
                } ${
                    disabled
                        ? 'cursor-not-allowed bg-surface-muted text-muted'
                        : 'cursor-pointer text-body hover:border-gray-400'
                } ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''} ${
                    clearable && selectedDate ? 'pr-12' : ''
                }`}
            >
                <CalendarDays className="h-5 w-5 flex-shrink-0 text-muted" />

                <span className={`flex-1 truncate ${selectedDate ? '' : 'text-muted'}`}>
                    {selectedDate
                        ? format(selectedDate, 'd MMMM yyyy', { locale: indonesianLocale })
                        : placeholder}
                </span>
            </button>

            {clearable && selectedDate && !disabled && (
                <button
                    type="button"
                    onClick={() => {
                        onChange('');
                        setIsOpen(false);
                    }}
                    aria-label="Kosongkan tanggal"
                    title="Kosongkan tanggal"
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-muted transition-colors hover:bg-surface-muted hover:text-body"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            {isOpen && (
                <div className="absolute left-0 z-50 mt-2 rounded-xl border border-line bg-surface p-3 shadow-xl">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelect}
                        locale={indonesianLocale}
                        weekStartsOn={1}
                        captionLayout="dropdown"
                        startMonth={calendarStart}
                        endMonth={calendarEnd}
                        reverseYears
                        navLayout="around"
                        showOutsideDays
                        disabled={disabledDays}
                    />

                    <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                        <button
                            type="button"
                            onClick={() => handleSelect(new Date())}
                            className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10"
                        >
                            Hari ini
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-muted"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
