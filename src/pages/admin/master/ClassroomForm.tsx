import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import NumericInput from '../../../components/common/NumericInput';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { academicYearService } from '../../../services/academicYearServices';
import { classroomNames, gradeLevels } from '../../../types/classroom';
import type { AcademicYear } from '../../../types/academicYear';

export interface ClassroomFormValues {
    academic_year_id: number;
    grade_level: number;
    name: string;
    quota: number;
    is_active: boolean;
}

interface Props {
    initialData?: ClassroomFormValues;
    onSubmit: (data: ClassroomFormValues) => void;
    loading?: boolean;
}

const defaultValues: ClassroomFormValues = {
    academic_year_id: 0,
    grade_level: 1,
    name: 'Ikhwan',
    quota: 28,
    is_active: true,
};

export default function ClassroomForm({
    initialData = defaultValues,
    onSubmit,
    loading = false,
}: Props) {
    const toast = useToast();
    const [form, setForm] = useState<ClassroomFormValues>(initialData);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [loadingYears, setLoadingYears] = useState(true);

    // Tahun ajaran diambil dari master (dropdown), bukan diketik manual
    useEffect(() => {
        const fetchAcademicYears = async () => {
            try {
                const data = await academicYearService.getAll();
                setAcademicYears(data);

                // Bila belum ada pilihan, gunakan tahun ajaran aktif
                if (!initialData.academic_year_id) {
                    const active = data.find((item) => item.is_active) ?? data[0];

                    if (active) {
                        setForm((previous) => ({ ...previous, academic_year_id: active.id }));
                    }
                }
            } catch (error) {
                console.error('Error fetching academic years:', error);
                toast.error('Gagal memuat tahun ajaran', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoadingYears(false);
            }
        };

        fetchAcademicYears();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!form.academic_year_id) {
            toast.warning('Tahun ajaran wajib dipilih');
            return;
        }

        if (!gradeLevels.includes(form.grade_level)) {
            toast.warning('Tingkat kelas harus antara 1 sampai 6');
            return;
        }

        if (!classroomNames.includes(form.name as (typeof classroomNames)[number])) {
            toast.warning('Nama kelas harus Ikhwan atau Akhwat');
            return;
        }

        if (!form.quota || form.quota < 1) {
            toast.warning('Kuota harus berupa angka positif');
            return;
        }

        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="mb-2 block text-sm font-medium text-body">
                    Tahun Ajaran <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                    options={academicYears.map((item) => ({
                        value: item.id,
                        label: item.name,
                        description: item.is_active ? 'Tahun ajaran aktif' : undefined,
                    }))}
                    value={form.academic_year_id > 0 ? form.academic_year_id : null}
                    onChange={(value) =>
                        setForm((previous) => ({ ...previous, academic_year_id: Number(value) }))
                    }
                    placeholder="Pilih tahun ajaran"
                    searchPlaceholder="Cari tahun ajaran..."
                    emptyMessage="Belum ada tahun ajaran"
                    loading={loadingYears}
                    ariaLabel="Tahun ajaran"
                />
                <p className="mt-2 text-xs text-muted">
                    Kelas hanya berlaku pada tahun ajaran yang dipilih.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-body">
                        Tingkat <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                        options={gradeLevels.map((level) => ({
                            value: level,
                            label: `Tingkat ${level}`,
                        }))}
                        value={form.grade_level}
                        onChange={(value) =>
                            setForm((previous) => ({ ...previous, grade_level: Number(value) }))
                        }
                        placeholder="Pilih tingkat"
                        searchPlaceholder="Cari tingkat..."
                        ariaLabel="Tingkat kelas"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-body">
                        Nama Kelas <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                        options={classroomNames.map((name) => ({
                            value: name,
                            label: name,
                            description: name === 'Ikhwan' ? 'Kelas putra' : 'Kelas putri',
                        }))}
                        value={form.name}
                        onChange={(value) =>
                            setForm((previous) => ({ ...previous, name: String(value) }))
                        }
                        placeholder="Pilih kelompok kelas"
                        searchPlaceholder="Cari kelompok kelas..."
                        ariaLabel="Nama kelas"
                    />
                    <p className="mt-2 text-xs text-muted">
                        Ikhwan untuk kelas putra, Akhwat untuk kelas putri.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-body">
                        Kuota <span className="text-red-500">*</span>
                    </label>
                    <NumericInput
                        value={form.quota}
                        onChange={(value) =>
                            setForm((previous) => ({ ...previous, quota: Number(value) || 0 }))
                        }
                        maxLength={4}
                        placeholder="28"
                        ariaLabel="Kuota kelas"
                        className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-2 text-xs text-muted">
                        Kapasitas maksimal kelas pada tahun ajaran ini.
                    </p>
                </div>

                <div>
                    <label className="mb-3 block text-sm font-medium text-body">Status Aktif</label>
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
                            {form.is_active ? 'Kelas aktif' : 'Tidak aktif'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Pratinjau nama kelas */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-blue-800">
                    Nama kelas yang tampil
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-800">
                    {form.grade_level} {form.name || '?'}
                </p>
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
