import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import PhotoPicker from '../../../components/common/PhotoPicker';
import SearchableSelect from '../../../components/common/SearchableSelect';
import NumericInput from '../../../components/common/NumericInput';
import { useToast } from '../../../context/toast';

export interface TeacherFormValues {
    name: string;
    email: string;
    gender: 'L' | 'P';
    last_education: string;
    position: string;
    phone: string;
    address: string;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    initialData?: TeacherFormValues;
    initialPhotoUrl?: string | null;
    onSubmit: (data: TeacherFormValues, photo: File | null) => void;
    loading?: boolean;
}

const defaultValues: TeacherFormValues = {
    name: '',
    email: '',
    gender: 'L',
    last_education: '',
    position: '',
    phone: '',
    address: '',
    sort_order: 0,
    is_active: true,
};

export default function TeacherForm({
    initialData = defaultValues,
    initialPhotoUrl = null,
    onSubmit,
    loading = false,
}: Props) {
    const toast = useToast();

    const [form, setForm] = useState<TeacherFormValues>(initialData);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoUrl);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!form.name.trim()) {
            toast.warning('Nama lengkap wajib diisi');
            return;
        }

        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            toast.warning('Format email tidak valid');
            return;
        }

        onSubmit(
            {
                ...form,
                name: form.name.trim(),
                email: form.email.trim(),
                last_education: form.last_education.trim(),
                position: form.position.trim(),
                phone: form.phone.trim(),
                address: form.address.trim(),
            },
            photo
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
                <PhotoPicker
                    label="Foto Pengajar"
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
                            placeholder="Contoh: Ustadzah Fatimah, S.Pd."
                            className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-body">
                            Email Pribadi
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(event) =>
                                setForm((previous) => ({ ...previous, email: event.target.value }))
                            }
                            placeholder="Contoh: ahmad@gmail.com"
                            className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-2 text-xs text-muted">
                            Dipakai sebagai email login bila guru diberi akun.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            Jenis Kelamin <span className="text-red-500">*</span>
                        </label>
                        <SearchableSelect
                            options={[
                                { value: 'L', label: 'Laki-laki' },
                                { value: 'P', label: 'Perempuan' },
                            ]}
                            value={form.gender}
                            onChange={(value) =>
                                setForm((previous) => ({ ...previous, gender: value as 'L' | 'P' }))
                            }
                            placeholder="Pilih jenis kelamin"
                            searchPlaceholder="Cari..."
                            ariaLabel="Jenis kelamin"
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
                                setForm((previous) => ({ ...previous, position: event.target.value }))
                            }
                            placeholder="Contoh: Guru Kelas 1 / Operator"
                            className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            Pendidikan Terakhir
                        </label>
                        <input
                            type="text"
                            value={form.last_education}
                            onChange={(event) =>
                                setForm((previous) => ({
                                    ...previous,
                                    last_education: event.target.value,
                                }))
                            }
                            placeholder="Contoh: S1 Pendidikan Islam"
                            className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            No. Telepon
                        </label>
                        <NumericInput
                            mode="phone"
                            maxLength={20}
                            value={form.phone}
                            onChange={(value) =>
                                setForm((previous) => ({ ...previous, phone: value }))
                            }
                            placeholder="08xxxxxxxxxx"
                            className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            ariaLabel="No. telepon"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-body">Alamat</label>
                        <textarea
                            rows={3}
                            value={form.address}
                            onChange={(event) =>
                                setForm((previous) => ({ ...previous, address: event.target.value }))
                            }
                            placeholder="Alamat tempat tinggal"
                            className="w-full resize-none rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
