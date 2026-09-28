type NumericMode = 'digits' | 'phone';

interface NumericInputProps {
    value: string | number;
    onChange: (value: string) => void;
    /**
     * `digits` hanya angka 0-9 (NIP, urutan, tahun).
     * `phone` mengizinkan angka serta + - spasi dan tanda kurung.
     */
    mode?: NumericMode;
    maxLength?: number;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    id?: string;
    name?: string;
    ariaLabel?: string;
}

const allowedPatterns: Record<NumericMode, RegExp> = {
    digits: /[^0-9]/g,
    phone: /[^0-9+\-\s()]/g,
};

const allowedKeys: Record<NumericMode, RegExp> = {
    digits: /[0-9]/,
    phone: /[0-9+\-\s()]/,
};

/**
 * Input angka dengan penjagaan: huruf tidak bisa diketik maupun ditempel.
 */
export default function NumericInput({
    value,
    onChange,
    mode = 'digits',
    maxLength,
    placeholder,
    className = '',
    disabled = false,
    id,
    name,
    ariaLabel,
}: NumericInputProps) {
    const sanitize = (raw: string) => {
        const cleaned = raw.replace(allowedPatterns[mode], '');

        return maxLength ? cleaned.slice(0, maxLength) : cleaned;
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Biarkan pintasan keyboard (copy, paste, select all, undo) tetap bekerja
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        // Tombol seperti Backspace, Tab, panah, dan Delete punya nama panjang
        if (event.key.length === 1 && !allowedKeys[mode].test(event.key)) {
            event.preventDefault();
        }
    };

    return (
        <input
            id={id}
            name={name}
            type="text"
            inputMode={mode === 'phone' ? 'tel' : 'numeric'}
            autoComplete="off"
            value={value}
            disabled={disabled}
            aria-label={ariaLabel}
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            onChange={(event) => onChange(sanitize(event.target.value))}
            className={className}
        />
    );
}
