import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import PhotoPicker from '../../../components/common/PhotoPicker';
import NumericInput from '../../../components/common/NumericInput';
import { useToast } from '../../../context/toast';
import { getActivityTypeLabel, type ActivityType } from '../../../types/activity';

export interface ActivityFormValues {
    title: string;
    description: string;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    type: ActivityType;
    initialData?: ActivityFormValues;
    initialPhotoUrl?: string | null;
    onSubmit: (data: ActivityFormValues, photo: File | null) => void;
    loading?: boolean;
}

const defaultValues: ActivityFormValues = {
    title: '',
    description: '',
    sort_order: 0,
    is_active: true,
};

export default function ActivityForm({
    type,
    initialData = defaultValues,
    initialPhotoUrl = null,
    onSubmit,
    loading = false,
}: Props) {
    const toast = useToast();

    const [form, setForm] = useState<ActivityFormValues>(initialData);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoUrl);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!form.title.trim()) {
            toast.warning('Judul wajib diisi');
            return;
        }

        if (!form.description.trim()) {
            toast.warning('Deskripsi wajib diisi');
            return;
        }

        onSubmit(
            {
                ...form,
                title: form.title.trim(),
                description: form.description.trim(),
            },
            photo
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PhotoPicker
                label="Foto"
                aspect="video"
                preview={photoPreview}
                onChange={(file) => {
                    setPhoto(file);
                    setPhotoPreview(URL.createObjectURL(file));
                }}
                onClear={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                }}
            />

            <div>
                <label className="mb-2 block text-sm font-medium text-body">
                    Judul {getActivityTypeLabel(type)} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    maxLength={255}
                    value={form.title}
                    onChange={(event) =>
                        setForm((previous) => ({ ...previous, title: event.target.value }))
                    }
                    placeholder={
                        type === 'prestasi'
                            ? 'Contoh: Juara 1 Lomba Tahfidz Tingkat Kota'
                            : 'Contoh: Peringatan Maulid Nabi 1448 H'
                    }
                    className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 text-xs text-muted">Karakter: {form.title.length} / 255</div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-body">
                    Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                    rows={6}
                    value={form.description}
                    onChange={(event) =>
                        setForm((previous) => ({ ...previous, description: event.target.value }))
                    }
                    placeholder={
                        type === 'prestasi'
                            ? 'Tuliskan detail capaian, tingkat lomba, dan nama peserta'
                            : 'Tuliskan keterangan kegiatan, waktu, dan tempatnya'
                    }
                    className="w-full resize-none rounded-lg border border-line bg-surface px-4 py-3 text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-body">Urutan Tampil</label>
                    <NumericInput
                        value={form.sort_order}
                        onChange={(value) =>
                            setForm((previous) => ({
                                ...previous,
                                sort_order: Number(value) || 0,
                            }))
                        }
                        maxLength={4}
                        placeholder="0"
                        ariaLabel="Urutan tampil"
                        className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-2 text-xs text-muted">
                        Angka lebih kecil ditampilkan lebih dahulu.
                    </p>
                </div>

                <div>
                    <label className="mb-3 block text-sm font-medium text-body">Status Tampil</label>
                    <button
                        type="button"
                        onClick={() =>
                            setForm((previous) => ({ ...previous, is_active: !previous.is_active }))
                        }
                        className={`inline-flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                            form.is_active
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-line bg-surface-muted text-muted'
                        }`}
                    >
                        <span
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                form.is_active ? 'bg-green-500' : 'bg-line'
                            }`}
                        >
                            <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                    form.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]'
                                }`}
                            />
                        </span>
                        <span className="text-sm font-medium">
                            {form.is_active ? 'Ditampilkan di website' : 'Disembunyikan'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-line pt-6">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Simpan
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
