import { useState } from 'react';
import { GraduationCap, Loader2, Plus, Save, Trash2, User } from 'lucide-react';
import PhotoPicker from '../../../components/common/PhotoPicker';
import NumericInput from '../../../components/common/NumericInput';
import { useToast } from '../../../context/toast';

export interface PrincipalFormValues {
    name: string;
    position: string;
    employee_number: string;
    greeting: string;
    education_history: string[];
    started_at: string;
    ended_at: string;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    initialData?: PrincipalFormValues;
    /** Foto yang sudah tersimpan, dipakai sebagai pratinjau awal. */
    initialPhotoUrl?: string | null;
    onSubmit: (data: PrincipalFormValues, photo: File | null) => void;
    loading?: boolean;
}

const defaultValues: PrincipalFormValues = {
    name: '',
    position: 'Kepala Sekolah',
    employee_number: '',
    greeting: '',
    education_history: [''],
    started_at: '',
    ended_at: '',
    sort_order: 0,
    is_active: true,
};

export default function PrincipalForm({
    initialData = defaultValues,
    initialPhotoUrl = null,
    onSubmit,
    loading = false,
}: Props) {
    const toast = useToast();

    const [form, setForm] = useState<PrincipalFormValues>(initialData);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoUrl);

    const updateHistory = (index: number, value: string) => {
        setForm((previous) => {
            const education_history = [...previous.education_history];
            education_history[index] = value;

            return { ...previous, education_history };
        });
    };

    const addHistory = () => {
        setForm((previous) => ({
            ...previous,
            education_history: [...previous.education_history, ''],
        }));
    };

    const removeHistory = (index: number) => {
        setForm((previous) => ({
            ...previous,
            education_history:
                previous.education_history.length > 1
                    ? previous.education_history.filter((_, itemIndex) => itemIndex !== index)
                    : [''],
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!form.name.trim()) {
            toast.warning('Nama lengkap wajib diisi');
            return;
        }

        onSubmit(
            {
                ...form,
                name: form.name.trim(),
                position: form.position.trim() || 'Kepala Sekolah',
                employee_number: form.employee_number.trim(),
                greeting: form.greeting.trim(),
                started_at: form.started_at.trim(),
                ended_at: form.ended_at.trim(),
                education_history: form.education_history
                    .map((item) => item.trim())
                    .filter((item) => item !== ''),
            },
            photo
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Foto */}
            <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-body">
                    <User className="h-5 w-5 text-blue-600" />
                    Foto & Identitas
                </h2>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
                    <PhotoPicker
                        label="Foto Kepala Sekolah"
                        aspect="portrait"
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-body">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(event) =>
                                    setForm((previous) => ({ ...previous, name: event.target.value }))
                                }
                                placeholder="Contoh: Ustadz Ahmad Fauzi, S.Pd."
                                className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Jabatan
                            </label>
                            <input
                                type="text"
                                value={form.position}
                                onChange={(event) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        position: event.target.value,
                                    }))
                                }
                                placeholder="Kepala Sekolah"
                                className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                NIP / NUPTK
                            </label>
                            <NumericInput
                                value={form.employee_number}
                                maxLength={30}
                                onChange={(value) =>
                                    setForm((previous) => ({ ...previous, employee_number: value }))
                                }
                                placeholder="Opsional"
                                className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                ariaLabel="NIP atau NUPTK"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Mulai Menjabat
                            </label>
                            <NumericInput
                                value={form.started_at}
                                maxLength={4}
                                onChange={(value) =>
                                    setForm((previous) => ({ ...previous, started_at: value }))
                                }
                                placeholder="Contoh: 2015"
                                className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                ariaLabel="Tahun mulai menjabat"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Selesai Menjabat
                            </label>
                            <NumericInput
                                value={form.ended_at}
                                maxLength={4}
                                onChange={(value) =>
                                    setForm((previous) => ({ ...previous, ended_at: value }))
                                }
                                placeholder="Kosongkan bila masih menjabat"
                                className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                ariaLabel="Tahun selesai menjabat"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Sambutan */}
            <section>
                <h2 className="mb-4 text-lg font-semibold text-body">Sambutan</h2>
                <textarea
                    rows={6}
                    value={form.greeting}
                    onChange={(event) =>
                        setForm((previous) => ({ ...previous, greeting: event.target.value }))
                    }
                    placeholder="Assalamualaikum warahmatullahi wabarakatuh..."
                    className="w-full resize-none rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
            </section>

            {/* Riwayat pendidikan */}
            <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-body">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        Riwayat Pendidikan
                    </h2>
                    <button
                        type="button"
                        onClick={addHistory}
                        className="inline-flex items-center rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Tambah Riwayat
                    </button>
                </div>

                <div className="space-y-3">
                    {form.education_history.map((history, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                                {index + 1}
                            </span>
                            <input
                                type="text"
                                value={history}
                                onChange={(event) => updateHistory(index, event.target.value)}
                                placeholder="Contoh: S1 PGSD - Universitas Negeri Jakarta (2010)"
                                className="flex-1 rounded-lg border border-line px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => removeHistory(index)}
                                title="Hapus riwayat"
                                aria-label={`Hapus riwayat ${index + 1}`}
                                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <p className="mt-2 text-xs text-muted">
                    Baris kosong otomatis diabaikan saat disimpan.
                </p>
            </section>

            {/* Pengaturan tampil */}
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-body">
                        Urutan Tampil
                    </label>
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
                        className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="mb-3 block text-sm font-medium text-body">
                        Status Kepala Sekolah
                    </label>
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
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-surface transition-transform ${
                                    form.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]'
                                }`}
                            />
                        </span>
                        <span className="text-sm font-medium">
                            {form.is_active
                                ? 'Kepala sekolah saat ini (profil utama)'
                                : 'Arsip periode sebelumnya'}
                        </span>
                    </button>
                </div>
            </section>

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
                    className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
