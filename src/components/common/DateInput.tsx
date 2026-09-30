import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateInputProps {
    /** Tanggal dalam format YYYY-MM-DD sesuai format API. */
    value: string;
    onChange: (value: string) => void;
    /** Batas tanggal dalam format YYYY-MM-DD. */
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

type CalendarView = 'days' | 'months' | 'years';

const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const weekdayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const yearsPerPage = 12;

const parseDateValue = (value?: string) => {
    if (!value) return undefined;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return undefined;

    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, month, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day
    ) return undefined;

    return date;
};

const toDateValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDate = (first?: Date, second?: Date) =>
    Boolean(
        first &&
        second &&
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate()
    );

const isDateAvailable = (date: Date, minDate?: Date, maxDate?: Date) => {
    const time = startOfDay(date).getTime();
    if (minDate && time < startOfDay(minDate).getTime()) return false;
    if (maxDate && time > startOfDay(maxDate).getTime()) return false;
    return true;
};

const isMonthAvailable = (
    year: number,
    month: number,
    minDate?: Date,
    maxDate?: Date,
) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    if (minDate && lastDay < startOfDay(minDate)) return false;
    if (maxDate && firstDay > startOfDay(maxDate)) return false;
    return true;
};

const isYearAvailable = (year: number, minDate?: Date, maxDate?: Date) =>
    isMonthAvailable(year, 0, minDate, maxDate) ||
    isMonthAvailable(year, 11, minDate, maxDate) ||
    Boolean(
        minDate &&
        maxDate &&
        minDate.getFullYear() <= year &&
        maxDate.getFullYear() >= year
    );

const clampToRange = (date: Date, minDate?: Date, maxDate?: Date) => {
    if (minDate && date < minDate) return minDate;
    if (maxDate && date > maxDate) return maxDate;
    return date;
};

/**
 * Date picker global dengan tampilan Tailwind.
 * Bulan dan tahun dipilih melalui panel grid agar tidak memakai dropdown panjang.
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
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedDate = parseDateValue(value);
    const minDate = parseDateValue(min);
    const maxDate = parseDateValue(max);
    const today = startOfDay(new Date());
    const initialDate = clampToRange(selectedDate ?? today, minDate, maxDate);

    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<CalendarView>('days');
    const [visibleMonth, setVisibleMonth] = useState(
        () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
    );

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const openCalendar = () => {
        if (disabled) return;

        const activeDate = clampToRange(selectedDate ?? today, minDate, maxDate);
        setVisibleMonth(new Date(activeDate.getFullYear(), activeDate.getMonth(), 1));
        setView('days');
        setIsOpen((current) => !current);
    };

    const visibleYear = visibleMonth.getFullYear();
    const visibleMonthIndex = visibleMonth.getMonth();
    const yearRangeStart = Math.floor(visibleYear / yearsPerPage) * yearsPerPage;
    const yearOptions = Array.from(
        { length: yearsPerPage },
        (_, index) => yearRangeStart + index,
    );

    const firstDay = new Date(visibleYear, visibleMonthIndex, 1);
    const mondayBasedOffset = (firstDay.getDay() + 6) % 7;
    const calendarStart = new Date(visibleYear, visibleMonthIndex, 1 - mondayBasedOffset);
    const calendarDays = Array.from({ length: 42 }, (_, index) =>
        new Date(
            calendarStart.getFullYear(),
            calendarStart.getMonth(),
            calendarStart.getDate() + index,
        )
    );

    const moveMonth = (amount: number) => {
        setVisibleMonth(new Date(visibleYear, visibleMonthIndex + amount, 1));
    };

    const moveYear = (amount: number) => {
        setVisibleMonth(new Date(visibleYear + amount, visibleMonthIndex, 1));
    };

    const selectDate = (date: Date) => {
        if (!isDateAvailable(date, minDate, maxDate)) return;
        onChange(toDateValue(date));
        setIsOpen(false);
        setView('days');
    };

    const previousMonth = new Date(visibleYear, visibleMonthIndex - 1, 1);
    const nextMonth = new Date(visibleYear, visibleMonthIndex + 1, 1);
    const canMovePreviousMonth = isMonthAvailable(
        previousMonth.getFullYear(),
        previousMonth.getMonth(),
        minDate,
        maxDate,
    );
    const canMoveNextMonth = isMonthAvailable(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        minDate,
        maxDate,
    );

    const formattedValue = selectedDate
        ? new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(selectedDate)
        : placeholder;

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <button
                    id={id}
                    type="button"
                    onClick={openCalendar}
                    disabled={disabled}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    aria-label={ariaLabel}
                    aria-invalid={hasError || undefined}
                    className={`flex w-full items-center gap-3 rounded-lg border bg-surface px-4 py-3 text-left text-sm shadow-sm outline-none transition-colors ${
                        clearable && selectedDate ? 'pr-12' : ''
                    } ${
                        hasError
                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
                            : 'border-line focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                    } ${
                        disabled
                            ? 'cursor-not-allowed bg-surface-muted text-muted opacity-70'
                            : 'cursor-pointer text-body hover:border-gray-400'
                    } ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/30' : ''}`}
                >
                    <CalendarDays className="h-5 w-5 shrink-0 text-muted" />
                    <span className={`truncate ${selectedDate ? 'text-body' : 'text-muted'}`}>
                        {formattedValue}
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
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full p-1 text-muted transition-colors hover:bg-surface-muted hover:text-body"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div
                    role="dialog"
                    aria-label={ariaLabel ?? 'Pilih tanggal'}
                    className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-3 shadow-xl"
                >
                    {view === 'days' && (
                        <>
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={() => moveMonth(-1)}
                                    disabled={!canMovePreviousMonth}
                                    aria-label="Bulan sebelumnya"
                                    className="cursor-pointer rounded-lg p-2 text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setView('months')}
                                        className="cursor-pointer rounded-lg px-2 py-1.5 text-sm font-semibold text-body transition hover:bg-surface-muted"
                                    >
                                        {monthNames[visibleMonthIndex]}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setView('years')}
                                        className="cursor-pointer rounded-lg px-2 py-1.5 text-sm font-semibold text-body transition hover:bg-surface-muted"
                                    >
                                        {visibleYear}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => moveMonth(1)}
                                    disabled={!canMoveNextMonth}
                                    aria-label="Bulan berikutnya"
                                    className="cursor-pointer rounded-lg p-2 text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-1 grid grid-cols-7">
                                {weekdayNames.map((day) => (
                                    <span key={day} className="py-1 text-center text-[11px] font-semibold text-muted">
                                        {day}
                                    </span>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((date) => {
                                    const outsideMonth = date.getMonth() !== visibleMonthIndex;
                                    const selected = isSameDate(date, selectedDate);
                                    const currentDay = isSameDate(date, today);
                                    const available = isDateAvailable(date, minDate, maxDate);

                                    return (
                                        <button
                                            key={toDateValue(date)}
                                            type="button"
                                            onClick={() => selectDate(date)}
                                            disabled={!available}
                                            aria-current={currentDay ? 'date' : undefined}
                                            aria-pressed={selected}
                                            className={`flex h-9 w-full cursor-pointer items-center justify-center rounded-lg text-xs font-medium transition ${
                                                selected
                                                    ? 'bg-brand text-white shadow-sm'
                                                    : currentDay
                                                      ? 'bg-brand/10 text-brand ring-1 ring-brand/40'
                                                      : outsideMonth
                                                        ? 'text-muted/50 hover:bg-surface-muted'
                                                        : 'text-body hover:bg-surface-muted'
                                            } disabled:cursor-not-allowed disabled:opacity-25`}
                                        >
                                            {date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {view === 'months' && (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => moveYear(-1)}
                                    disabled={!isYearAvailable(visibleYear - 1, minDate, maxDate)}
                                    aria-label="Tahun sebelumnya"
                                    className="cursor-pointer rounded-lg p-2 text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView('years')}
                                    className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold text-body transition hover:bg-surface-muted"
                                >
                                    {visibleYear}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveYear(1)}
                                    disabled={!isYearAvailable(visibleYear + 1, minDate, maxDate)}
                                    aria-label="Tahun berikutnya"
                                    className="cursor-pointer rounded-lg p-2 text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {monthNames.map((month, monthIndex) => {
                                    const available = isMonthAvailable(
                                        visibleYear,
                                        monthIndex,
                                        minDate,
                                        maxDate,
                                    );
                                    const selected =
                                        selectedDate?.getFullYear() === visibleYear &&
                                        selectedDate.getMonth() === monthIndex;

                                    return (
                                        <button
                                            key={month}
                                            type="button"
                                            disabled={!available}
                                            onClick={() => {
                                                setVisibleMonth(new Date(visibleYear, monthIndex, 1));
                                                setView('days');
                                            }}
                                            className={`cursor-pointer rounded-lg px-2 py-3 text-sm font-medium transition ${
                                                selected
                                                    ? 'bg-brand text-white'
                                                    : 'text-body hover:bg-surface-muted'
                                            } disabled:cursor-not-allowed disabled:opacity-25`}
                                        >
                                            {month.slice(0, 3)}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {view === 'years' && (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => moveYear(-yearsPerPage)}
                                    disabled={!yearOptions.some((year) =>
                                        isYearAvailable(year - yearsPerPage, minDate, maxDate)
                                    )}
                                    aria-label={`${yearsPerPage} tahun sebelumnya`}
                                    className="cursor-pointer rounded-lg p-2 text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="text-sm font-semibold text-body">
                                    {yearRangeStart}–{yearRangeStart + yearsPerPage - 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => moveYear(yearsPerPage)}
                                    disabled={!yearOptions.some((year) =>
                                        isYearAvailable(year + yearsPerPage, minDate, maxDate)
                                    )}
                                    aria-label={`${yearsPerPage} tahun berikutnya`}
                                    className="cursor-pointer rounded-lg p-2 text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {yearOptions.map((year) => {
                                    const available = isYearAvailable(year, minDate, maxDate);
                                    const selected = selectedDate?.getFullYear() === year;

                                    return (
                                        <button
                                            key={year}
                                            type="button"
                                            disabled={!available}
                                            onClick={() => {
                                                setVisibleMonth(new Date(year, visibleMonthIndex, 1));
                                                setView('months');
                                            }}
                                            className={`cursor-pointer rounded-lg px-2 py-3 text-sm font-medium transition ${
                                                selected
                                                    ? 'bg-brand text-white'
                                                    : year === today.getFullYear()
                                                      ? 'bg-brand/10 text-brand'
                                                      : 'text-body hover:bg-surface-muted'
                                            } disabled:cursor-not-allowed disabled:opacity-25`}
                                        >
                                            {year}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                        <button
                            type="button"
                            onClick={() => selectDate(today)}
                            disabled={!isDateAvailable(today, minDate, maxDate)}
                            className="cursor-pointer rounded-lg px-2 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            Hari ini
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setView('days');
                                setIsOpen(false);
                            }}
                            className="cursor-pointer rounded-lg px-2 py-1.5 text-xs font-semibold text-muted transition hover:bg-surface-muted hover:text-body"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
