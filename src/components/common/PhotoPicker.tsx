import { useRef } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { useToast } from '../../context/toast';

interface PhotoPickerProps {
    /** URL foto yang sedang tampil (foto lama maupun pratinjau foto baru). */
    preview: string | null;
    onChange: (file: File) => void;
    onClear: () => void;
    label?: string;
    hint?: string;
    /** Rasio tampilan pratinjau. */
    aspect?: 'square' | 'video' | 'portrait';
    maxSizeMB?: number;
}

const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
};

/**
 * Pemilih foto dengan pratinjau, dipakai di beberapa halaman profil.
 */
export default function PhotoPicker({
    preview,
    onChange,
    onClear,
    label = 'Foto',
    hint,
    aspect = 'square',
    maxSizeMB = 5,
}: PhotoPickerProps) {
    const toast = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
    const maxSize = maxSizeMB * 1024 * 1024;

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.warning('Berkas harus berupa gambar');
            event.target.value = '';
            return;
        }

        if (file.size > maxSize) {
            toast.warning(`Ukuran foto maksimal ${maxSizeMB}MB`);
            event.target.value = '';
            return;
        }

        onChange(file);
    };

    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-body">{label}</label>

            {preview ? (
                <div className="relative max-w-xs">
                    <div className={`${aspectClasses[aspect]} overflow-hidden rounded-lg bg-surface-muted`}>
                        <img src={preview} alt="Pratinjau foto" className="h-full w-full object-cover" />
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            onClear();
                            if (inputRef.current) inputRef.current.value = '';
                        }}
                        title="Hapus foto"
                        aria-label="Hapus foto"
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white transition-colors hover:bg-red-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <label
                    className={`flex ${aspectClasses[aspect]} max-w-xs cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-surface-muted px-4 text-center transition-colors hover:bg-surface-muted`}
                >
                    <ImageIcon className="mb-3 h-10 w-10 text-muted" />
                    <span className="mb-1 text-sm font-medium text-muted">Pilih foto</span>
                    <span className="text-xs text-muted">
                        {hint ?? `jpg, jpeg, png, webp • maks ${maxSizeMB}MB`}
                    </span>
                    <span className="mt-3 inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">
                        <Upload className="mr-1.5 h-3.5 w-3.5" />
                        Pilih Berkas
                    </span>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFile}
                        className="hidden"
                    />
                </label>
            )}
        </div>
    );
}
