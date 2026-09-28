import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { useToast } from '../../../context/toast';
import { gradeLevels } from '../../../types/classroom';

export interface SubjectFormValues {
    code: string;
    name: string;
    grade_level: number | null;
    is_active: boolean;
}

interface Props {
    initialData?: SubjectFormValues;
    onSubmit: (data: SubjectFormValues) => void;
    loading?: boolean;
}

const defaultValues: SubjectFormValues = {
    code: '',
    name: '',
    grade_level: null,
    is_active: true,
};

export default function SubjectForm({
    initialData = defaultValues,
    onSubmit,
    loading = false,
}: Props) {
    const toast = useToast();
    const [form, setForm] = useState<SubjectFormValues>(initialData);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!form.code.trim()) {
            toast.warning('Kode mata pelajaran wajib diisi');
            return;
        }

        if (!form.name.trim()) {
            toast.warning('Nama mata pelajaran wajib diisi');
            return;
        }

        onSubmit({
            ...form,
            code: form.code.trim().toUpperCase(),
            name: form.name.trim(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-body">
                        Kode Mata Pelajaran <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.code}
                        onChange={(event) =>
                            setForm((previous) => ({
                                ...previous,
                                code: event.target.value.toUpperCase(),
                            }))
                        }
                        placeholder="Contoh: MTK"
                        maxLength={30}
                        className="w-full rounded-lg border border-line px-4 py-3 uppercase shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-2 text-xs text-muted">
                        Kode harus unik, tidak boleh sama dengan mata pelajaran lain.
                    </p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-body">
                        Tingkat yang Berlaku
                    </label>
                    <SearchableSelect
                        options={[
                            { value: 'all', label: 'Semua Tingkat', description: 'Berlaku kelas 1–6' },
                            ...gradeLevels.map((grade) => ({
                                value: grade,
                                label: `Tingkat ${grade}`,
                                description: `Hanya kelas ${grade}`,
                            })),
                        ]}
                        value={form.grade_level ?? 'all'}
                        onChange={(value) =>
                            setForm((previous) => ({
                                ...previous,
                                grade_level: value === 'all' ? null : Number(value),
                            }))
                        }
                        searchPlaceholder="Cari tingkat..."
                        ariaLabel="Tingkat yang berlaku"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-body">
                        Nama Mata Pelajaran <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(event) =>
                            setForm((previous) => ({ ...previous, name: event.target.value }))
                        }
                        placeholder="Contoh: Matematika"
                        className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </section>

            <section>
                <label className="mb-3 block text-sm font-medium text-body">Status</label>
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
                            ? 'Aktif — muncul saat input nilai'
                            : 'Tidak aktif — disembunyikan dari input nilai'}
                    </span>
                </button>
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
