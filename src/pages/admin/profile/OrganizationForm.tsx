import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import PhotoPicker from '../../../components/common/PhotoPicker';
import NumericInput from '../../../components/common/NumericInput';
import { useToast } from '../../../context/toast';

export interface OrganizationFormValues {
    name: string;
    position: string;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    initialData?: OrganizationFormValues;
    initialPhotoUrl?: string | null;
    onSubmit: (data: OrganizationFormValues, photo: File | null) => void;
    loading?: boolean;
}

const defaultValues: OrganizationFormValues = {
    name: '',
    position: '',
    sort_order: 0,
    is_active: true,
};

export default function OrganizationForm({
    initialData = defaultValues,
    initialPhotoUrl = null,
    onSubmit,
    loading = false,
}: Props) {
    const toast = useToast();

    const [form, setForm] = useState<OrganizationFormValues>(initialData);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoUrl);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!form.name.trim()) {
            toast.warning('Nama wajib diisi');
            return;
        }

        if (!form.position.trim()) {
            toast.warning('Jabatan wajib diisi');
            return;
        }

        onSubmit(
            {
                ...form,
                name: form.name.trim(),
                position: form.position.trim(),
            },
            photo
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
                <PhotoPicker
                    label="Foto (opsional)"
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
                            Nama <span className="text-red-500">*</span>
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

                    <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-body">
                            Jabatan <span className="text-red-500">*</span>
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
                            placeholder="Contoh: Kepala Sekolah / Wali Kelas 1A / Bendahara"
                            className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </section>

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
                    <p className="mt-2 text-xs text-muted">
                        Angka kecil tampil lebih dulu di halaman website.
                    </p>
                </div>

                <div>
                    <label className="mb-3 block text-sm font-medium text-body">
                        Status Tampil
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
                            {form.is_active ? 'Ditampilkan di website' : 'Disembunyikan'}
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
