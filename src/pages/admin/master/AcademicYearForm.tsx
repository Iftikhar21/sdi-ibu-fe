import { useEffect, useState } from 'react';
import { CalendarRange, Info, Loader2, Save } from 'lucide-react';
import SearchableSelect from '../../../components/common/SearchableSelect';
import DateInput from '../../../components/common/DateInput';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { academicYearService } from '../../../services/academicYearServices';

export interface AcademicYearFormValues {
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

interface Props {
    initialData?: AcademicYearFormValues;
    onSubmit: (data: AcademicYearFormValues) => void;
    loading?: boolean;
}

const defaultValues: AcademicYearFormValues = {
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
};

/** Ambil tahun mulai dari teks tahun ajaran, mis. "2026/2027" -> 2026. */
const parseStartYear = (name?: string): number | null => {
    const match = /^(\d{4})\/\d{4}$/.exec((name ?? '').trim());

    return match ? Number(match[1]) : null;
};

/** Tanggal bawaan tahun ajaran: 1 Juli sampai 30 Juni tahun berikutnya. */
const defaultPeriod = (startYear: number) => ({
    start_date: `${startYear}-07-01`,
    end_date: `${startYear + 1}-06-30`,
});

export default function AcademicYearForm({
    initialData = defaultValues,
    onSubmit,
    loading = false,
}: Props) {
    const toast = useToast();

    const [form, setForm] = useState<AcademicYearFormValues>(initialData);
    const [startYear, setStartYear] = useState<number | null>(
        parseStartYear(initialData.name)
    );
    const [usedNames, setUsedNames] = useState<string[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Tahun ajaran yang sudah ada ditandai agar tidak dipilih dua kali
    useEffect(() => {
        const fetchUsed = async () => {
            try {
                const data = await academicYearService.getAll();

                setUsedNames(
                    data
                        .filter((item) => item.name !== initialData.name)
                        .map((item) => item.name)
                );
            } catch (error) {
                console.error('Error fetching academic years:', error);
                toast.error('Gagal memuat daftar tahun ajaran', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchUsed();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Pilihan tahun: 6 tahun ke belakang sampai 6 tahun ke depan
    const currentYear = new Date().getFullYear();
    const yearRange = Array.from({ length: 13 }, (_, index) => currentYear - 6 + index);

    // Tahun yang sedang diedit selalu ikut ditampilkan walau di luar rentang
    if (startYear && !yearRange.includes(startYear)) {
        yearRange.push(startYear);
    }

    const yearOptions = yearRange
        .sort((a, b) => b - a)
        .map((year) => {
            const name = `${year}/${year + 1}`;

            return {
                value: year,
                label: String(year),
                description: usedNames.includes(name) ? `${name} — sudah ada` : name,
                disabled: usedNames.includes(name),
            };
        });

    const handleYearChange = (value: string | number) => {
        const year = Number(value);
        const period = defaultPeriod(year);

        setStartYear(year);
        setForm((previous) => ({
            ...previous,
            name: `${year}/${year + 1}`,
            // Isi tanggal bawaan hanya bila masih kosong agar tidak menimpa isian admin
            start_date: previous.start_date || period.start_date,
            end_date: previous.end_date || period.end_date,
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!startYear || !form.name) {
            toast.warning('Tahun ajaran wajib dipilih');
            return;
        }

        if (usedNames.includes(form.name)) {
            toast.warning('Tahun ajaran tersebut sudah ada');
            return;
        }

        if (!form.start_date) {
            toast.warning('Tanggal mulai wajib diisi');
            return;
        }

        if (!form.end_date) {
            toast.warning('Tanggal selesai wajib diisi');
            return;
        }

        if (form.end_date < form.start_date) {
            toast.warning('Tanggal selesai tidak boleh lebih awal dari tanggal mulai');
            return;
        }

        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-body">
                        Tahun Mulai <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                        options={yearOptions}
                        value={startYear}
                        onChange={handleYearChange}
                        placeholder="Pilih tahun"
                        searchPlaceholder="Cari tahun..."
                        emptyMessage="Tahun tidak ditemukan"
                        loading={loadingOptions}
                        ariaLabel="Tahun mulai"
                    />
                    <p className="mt-2 text-xs text-muted">
                        Tahun ajaran terbentuk otomatis dari tahun mulai.
                    </p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-body">
                        Tahun Ajaran
                    </label>
                    <div
                        className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                            form.name
                                ? 'border-line bg-surface'
                                : 'border-line bg-surface-muted'
                        }`}
                    >
                        <CalendarRange
                            className={`h-5 w-5 flex-shrink-0 ${
                                form.name ? 'text-brand' : 'text-muted'
                            }`}
                        />
                        <span
                            className={`text-lg font-semibold ${
                                form.name ? 'text-body' : 'text-muted'
                            }`}
                        >
                            {form.name || 'Belum dipilih'}
                        </span>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                        Otomatis: tahun mulai / tahun berikutnya. Tidak perlu diketik.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-body">
                        Tanggal Mulai <span className="text-red-500">*</span>
                    </label>
                    <DateInput
                        value={form.start_date}
                        onChange={(value) =>
                            setForm((previous) => ({ ...previous, start_date: value }))
                        }
                        ariaLabel="Tanggal mulai"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-body">
                        Tanggal Selesai <span className="text-red-500">*</span>
                    </label>
                    <DateInput
                        value={form.end_date}
                        onChange={(value) =>
                            setForm((previous) => ({ ...previous, end_date: value }))
                        }
                        min={form.start_date || undefined}
                        ariaLabel="Tanggal selesai"
                    />
                </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                    Tanggal bawaan 1 Juli sampai 30 Juni diisi otomatis mengikuti tahun yang dipilih.
                    Ubah bila periode sekolah Anda berbeda.
                </span>
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
                        {form.is_active ? 'Tahun ajaran aktif' : 'Tidak aktif'}
                    </span>
                </button>

                <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                    <CalendarRange className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                        Hanya boleh ada satu tahun ajaran aktif. Jika ini diaktifkan, tahun ajaran
                        aktif sebelumnya otomatis menjadi tidak aktif.
                    </span>
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
