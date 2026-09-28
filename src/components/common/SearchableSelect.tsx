import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react';

export interface SelectOption {
    value: string | number;
    label: string;
    /** Keterangan tambahan di bawah label (opsional). */
    description?: string;
    disabled?: boolean;
}

interface SearchableSelectProps {
    options: SelectOption[];
    value: string | number | null;
    onChange: (value: string | number) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    loading?: boolean;
    /** Tampilkan tombol silang untuk mengosongkan pilihan (opsional). */
    clearable?: boolean;
    /** Ukuran lebih ringkas, cocok untuk baris filter. */
    compact?: boolean;
    className?: string;
    ariaLabel?: string;
}

/**
 * Dropdown yang bisa dicari dan dinavigasi dengan keyboard.
 *
 * Nilai (`value`) dibiarkan bertipe string | number; pemanggil yang
 * menyesuaikan, misalnya `onChange={(v) => setId(Number(v))}`.
 */
export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Pilih salah satu',
    searchPlaceholder = 'Cari...',
    emptyMessage = 'Tidak ada pilihan yang cocok',
    disabled = false,
    loading = false,
    clearable = false,
    compact = false,
    className = '',
    ariaLabel,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const selectedOption = useMemo(
        () => options.find((option) => option.value === value) ?? null,
        [options, value]
    );

    const availableOptions = options.filter(
        (option) => !option.disabled && option.value !== ''
    );
    const onlyOptionValue = !loading && !disabled && availableOptions.length === 1
        ? availableOptions[0].value
        : null;
    const lastAutoSelection = useRef<{
        optionValue: string | number;
        previousValue: string | number | null;
    } | null>(null);

    // Pilih otomatis jika hanya ada satu pilihan yang dapat dipakai.
    useEffect(() => {
        if (onlyOptionValue === null || onlyOptionValue === value) {
            lastAutoSelection.current = null;
            return;
        }

        if (
            lastAutoSelection.current?.optionValue === onlyOptionValue &&
            lastAutoSelection.current.previousValue === value
        ) return;

        lastAutoSelection.current = { optionValue: onlyOptionValue, previousValue: value };
        onChange(onlyOptionValue);
    }, [onlyOptionValue, value, onChange]);

    // Pencarian tanpa peduli huruf besar/kecil maupun tanda diakritik
    const normalizedSearch = search.trim().toLowerCase();
    const filteredOptions = useMemo(() => {
        if (!normalizedSearch) return options;

        return options.filter((option) =>
            `${option.label} ${option.description ?? ''}`
                .toLowerCase()
                .includes(normalizedSearch)
        );
    }, [options, normalizedSearch]);

    const openDropdown = () => {
        if (disabled) return;

        setSearch('');
        setIsOpen(true);
    };

    const closeDropdown = () => {
        setIsOpen(false);
        setSearch('');
    };

    const selectOption = (option: SelectOption) => {
        if (option.disabled) return;

        onChange(option.value);
        closeDropdown();
    };

    // Tutup saat klik di luar komponen
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Fokuskan kolom pencarian dan sorot pilihan aktif saat dropdown dibuka
    useEffect(() => {
        if (!isOpen) return;

        searchInputRef.current?.focus();

        const selectedIndex = filteredOptions.findIndex(
            (option) => option.value === value && !option.disabled
        );

        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Jaga agar pilihan yang sedang disorot tetap terlihat saat navigasi keyboard
    useEffect(() => {
        if (!isOpen || !listRef.current) return;

        const activeElement = listRef.current.querySelector<HTMLElement>(
            `[data-option-index="${activeIndex}"]`
        );

        activeElement?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex, isOpen]);

    const moveActive = (direction: 1 | -1) => {
        if (filteredOptions.length === 0) return;

        let nextIndex = activeIndex;

        for (let step = 0; step < filteredOptions.length; step++) {
            nextIndex = (nextIndex + direction + filteredOptions.length) % filteredOptions.length;

            if (!filteredOptions[nextIndex]?.disabled) {
                setActiveIndex(nextIndex);
                return;
            }
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (disabled) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!isOpen) {
                    openDropdown();
                } else {
                    moveActive(1);
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                moveActive(-1);
                break;
            case 'Enter':
                event.preventDefault();
                if (isOpen && filteredOptions[activeIndex]) {
                    selectOption(filteredOptions[activeIndex]);
                } else {
                    openDropdown();
                }
                break;
            case 'Escape':
                event.preventDefault();
                closeDropdown();
                break;
            case 'Tab':
                closeDropdown();
                break;
            default:
                break;
        }
    };

    const triggerClasses = compact
        ? 'px-3 py-2 text-sm'
        : 'px-4 py-3 text-sm';

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => (isOpen ? closeDropdown() : openDropdown())}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-label={ariaLabel}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-surface text-left shadow-sm transition-all duration-200 ${
                        triggerClasses
                    } ${clearable && selectedOption ? 'pr-14' : ''} ${
                        disabled
                            ? 'cursor-not-allowed border-line bg-surface-muted text-muted'
                            : 'border-line hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    } ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
                >
                    <span className={`truncate ${selectedOption ? 'text-body' : 'text-muted'}`}>
                        {selectedOption
                            ? selectedOption.label
                            : loading
                              ? 'Memuat...'
                              : placeholder}
                    </span>

                    {loading ? (
                        <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-muted" />
                    ) : (
                        <ChevronDown
                            className={`h-4 w-4 flex-shrink-0 text-muted transition-transform duration-200 ${
                                isOpen ? 'rotate-180' : ''
                            }`}
                        />
                    )}
                </button>

                {clearable && selectedOption && availableOptions.length !== 1 && !disabled && (
                    <button
                        type="button"
                        onClick={() => {
                            onChange('');
                            closeDropdown();
                        }}
                        aria-label="Kosongkan pilihan"
                        title="Kosongkan pilihan"
                        className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted transition-colors hover:bg-surface-muted hover:text-muted"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
                    <div className="border-b border-line p-2">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setActiveIndex(0);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={searchPlaceholder}
                                className="w-full rounded-md border border-line py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    <div ref={listRef} role="listbox" className="max-h-60 overflow-y-auto py-1">
                        {loading ? (
                            <p className="px-4 py-3 text-sm text-muted">Memuat data...</p>
                        ) : filteredOptions.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-muted">{emptyMessage}</p>
                        ) : (
                            filteredOptions.map((option, index) => {
                                const isSelected = option.value === value;
                                const isActive = index === activeIndex;

                                return (
                                    <div
                                        key={option.value}
                                        data-option-index={index}
                                        role="option"
                                        aria-selected={isSelected}
                                        onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                                        onClick={() => selectOption(option)}
                                        className={`flex cursor-pointer items-start justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${
                                            option.disabled
                                                ? 'cursor-not-allowed text-muted'
                                                : isActive
                                                  ? 'bg-blue-50 text-body'
                                                  : 'text-body'
                                        }`}
                                    >
                                        <span className="min-w-0">
                                            <span className="block truncate">{option.label}</span>
                                            {option.description && (
                                                <span className="mt-0.5 block truncate text-xs text-muted">
                                                    {option.description}
                                                </span>
                                            )}
                                        </span>

                                        {isSelected && (
                                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-700" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
