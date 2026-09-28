import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertCircle,
    Award,
    BookText,
    CalendarRange,
    GraduationCap,
    Layers,
    Loader2,
    RotateCcw,
    UserCheck,
    Users,
} from 'lucide-react';
import SearchableSelect from '../common/SearchableSelect';
import TablePagination from '../common/TablePagination';
import { useTablePagination } from '../common/useTablePagination';
import { dashboardService, type SchoolSummary } from '../../services/dashboardServices';
import { getApiErrorMessage } from '../../utils/apiError';

const registrationStatuses = [
    { key: 'submitted', label: 'Dikirim', style: 'bg-blue-50 text-blue-700 border-blue-200' },
    { key: 'review', label: 'Review', style: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { key: 'approved', label: 'Diterima', style: 'bg-green-50 text-green-700 border-green-200' },
    { key: 'rejected', label: 'Ditolak', style: 'bg-red-50 text-red-700 border-red-200' },
] as const;

/**
 * Rekap data sekolah untuk dashboard admin.
 *
 * Hanya menampilkan agregasi: pendaftaran, siswa, kelas, siswa belum
 * ditempatkan, jumlah siswa per kelas, dan lulusan.
 */
export default function SchoolRecap() {
    const [summary, setSummary] = useState<SchoolSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
    const { pageItems: visibleClasses, pagination: classesPagination } = useTablePagination(summary?.classes.rows ?? []);
    const { pageItems: visibleGraduates, pagination: graduatesPagination } = useTablePagination(summary?.graduates.by_year ?? []);

    const fetchSummary = async (academicYearId?: number) => {
        setLoading(true);
        setError(null);

        try {
            const data = await dashboardService.getSchoolSummary(academicYearId);

            setSummary(data);
            setSelectedYearId(data.academic_year?.id ?? null);
        } catch (err) {
            console.error('Error fetching school summary:', err);
            setError(getApiErrorMessage(err, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    const kelasTerpakai = [...(summary?.classes.rows ?? [])]
        .sort((a, b) => b.filled - a.filled)
        .filter((row) => row.is_active);

    const maxFilled = Math.max(1, ...kelasTerpakai.map((row) => row.filled));

    return (
        <div className="mb-8">
            <div className="mb-4 flex flex-col justify-between gap-4 rounded-xl border border-line bg-surface p-6 shadow-sm md:flex-row md:items-center">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-body">
                        <BookText className="h-5 w-5 text-brand" />
                        Rekap Data Sekolah
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                        Ringkasan pendaftaran, siswa, kelas, dan lulusan. Hanya untuk monitoring —
                        tidak mengubah data.
                    </p>
                </div>

                <div className="w-full md:w-72">
                    <label className="mb-2 block text-sm font-medium text-body">Tahun Ajaran</label>
                    <SearchableSelect
                        options={(summary?.academic_years ?? []).map((year) => ({
                            value: year.id,
                            label: year.name,
                            description: year.is_active ? 'Aktif' : undefined,
                        }))}
                        value={selectedYearId}
                        onChange={(value) => fetchSummary(Number(value))}
                        placeholder="Pilih tahun ajaran"
                        searchPlaceholder="Cari tahun ajaran..."
                        emptyMessage="Belum ada Master Tahun Ajaran"
                        loading={loading}
                        compact
                        ariaLabel="Filter tahun ajaran dashboard"
                    />
                </div>
            </div>

            {loading && !summary ? (
                <div className="rounded-xl border border-line bg-surface py-16 text-center shadow-sm">
                    <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-muted">Memuat rekap data sekolah...</p>
                </div>
            ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                    <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
                    <p className="text-sm font-medium text-red-700">
                        Gagal memuat rekap data sekolah
                    </p>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                    <button
                        onClick={() => fetchSummary(selectedYearId ?? undefined)}
                        className="mt-4 inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Coba lagi
                    </button>
                </div>
            ) : summary ? (
                <div className="space-y-6">
                    {/* Kartu ringkasan utama */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted">Total Pendaftar</p>
                                    <p className="mt-2 text-3xl font-bold text-body">
                                        {summary.registrations.total}
                                    </p>
                                    <p className="mt-1 text-xs text-muted">
                                        Tahun ajaran {summary.academic_year?.name ?? '-'}
                                    </p>
                                </div>
                                <span className="rounded-full bg-brand/20 p-2.5">
                                    <Users className="h-5 w-5 text-brand" />
                                </span>
                            </div>

                            {summary.registrations.without_academic_year > 0 && (
                                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                    <p className="text-xs text-amber-700">
                                        {summary.registrations.without_academic_year} pendaftaran belum
                                        punya tahun ajaran sehingga tidak ikut dihitung.{' '}
                                        <Link to="/admin/penempatan-kelas" className="underline">
                                            Lengkapi
                                        </Link>
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted">Siswa Aktif</p>
                                    <p className="mt-2 text-3xl font-bold text-body">
                                        {summary.students.active}
                                    </p>
                                    <p className="mt-1 text-xs text-muted">
                                        {summary.students.inactive} tidak aktif •{' '}
                                        {summary.students.graduated} lulus
                                    </p>
                                </div>
                                <span className="rounded-full bg-green-50 p-2.5">
                                    <UserCheck className="h-5 w-5 text-green-700" />
                                </span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted">Kelas Aktif</p>
                                    <p className="mt-2 text-3xl font-bold text-body">
                                        {summary.classes.total}
                                    </p>
                                    <p className="mt-1 text-xs text-muted">
                                        Kapasitas {summary.classes.capacity} • terisi{' '}
                                        {summary.classes.filled}
                                    </p>
                                </div>
                                <span className="rounded-full bg-brand/20 p-2.5">
                                    <Layers className="h-5 w-5 text-brand" />
                                </span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted">Total Lulusan</p>
                                    <p className="mt-2 text-3xl font-bold text-body">
                                        {summary.graduates.total}
                                    </p>
                                    <p className="mt-1 text-xs text-muted">
                                        {summary.graduates.this_year} pada{' '}
                                        {summary.academic_year?.name ?? '-'}
                                    </p>
                                </div>
                                <span className="rounded-full bg-brand/20 p-2.5">
                                    <GraduationCap className="h-5 w-5 text-brand" />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Kuota tersedia + siswa belum ditempatkan */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                            <p className="text-sm text-muted">Kuota Tersedia</p>
                            <p className="mt-2 text-2xl font-bold text-body">
                                {summary.classes.available}
                            </p>
                            <p className="mt-1 text-xs text-muted">
                                dari kapasitas {summary.classes.capacity} kursi
                            </p>
                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-line">
                                <div
                                    className="h-full rounded-full bg-brand"
                                    style={{
                                        width: `${
                                            summary.classes.capacity > 0
                                                ? Math.min(
                                                      100,
                                                      (summary.classes.filled /
                                                          summary.classes.capacity) *
                                                          100
                                                  )
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm lg:col-span-2">
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div>
                                    <p className="text-sm text-muted">
                                        Siswa Diterima Belum Ditempatkan
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-body">
                                        {summary.unplaced_students}
                                    </p>
                                    <p className="mt-1 text-xs text-muted">
                                        Sudah menjadi siswa, tetapi belum punya kelas pada tahun
                                        ajaran {summary.academic_year?.name ?? '-'}
                                    </p>
                                </div>
                                <Link
                                    to="/admin/penempatan-kelas"
                                    className="inline-flex flex-shrink-0 items-center justify-center rounded-lg border border-line bg-surface-muted px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface"
                                >
                                    <Layers className="mr-2 h-4 w-4" />
                                    Lihat Siswa
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Rekap pendaftaran */}
                    <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-body">
                            <Users className="h-5 w-5 text-brand" />
                            Rekap Pendaftaran
                        </h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {registrationStatuses.map((status) => (
                                <div
                                    key={status.key}
                                    className={`rounded-xl border p-4 ${status.style}`}
                                >
                                    <p className="text-xs font-medium">{status.label}</p>
                                    <p className="mt-1 text-2xl font-bold">
                                        {summary.registrations[status.key]}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        {/* Rekap kelas */}
                        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                            <div className="flex items-center gap-2 border-b border-line px-6 py-4">
                                <Layers className="h-5 w-5 text-brand" />
                                <h3 className="text-base font-semibold text-body">Rekap Kelas</h3>
                            </div>

                            {summary.classes.rows.length === 0 ? (
                                <p className="px-6 py-10 text-center text-sm text-muted">
                                    Belum ada kelas pada tahun ajaran ini.
                                </p>
                            ) : (
                                <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-line">
                                        <thead className="bg-surface-muted">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Kelas
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Tingkat
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Kuota
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Terisi
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Tersedia
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-line">
                                            {visibleClasses.map((row) => (
                                                <tr key={row.id} className="hover:bg-surface-muted">
                                                    <td className="px-6 py-4 text-sm font-medium text-body">
                                                        {row.display_name}
                                                        {!row.is_active && (
                                                            <span className="ml-2 text-xs text-muted">
                                                                (tidak aktif)
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-muted">
                                                        {row.grade_level}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-body">
                                                        {row.quota}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-body">
                                                        {row.filled}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-muted">
                                                        {row.available}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t border-line bg-surface-muted">
                                            <tr>
                                                <td
                                                    className="px-6 py-3 text-sm font-semibold text-body"
                                                    colSpan={2}
                                                >
                                                    Total kelas aktif
                                                </td>
                                                <td className="px-6 py-3 text-sm font-semibold text-body">
                                                    {summary.classes.capacity}
                                                </td>
                                                <td className="px-6 py-3 text-sm font-semibold text-body">
                                                    {summary.classes.filled}
                                                </td>
                                                <td className="px-6 py-3 text-sm font-semibold text-body">
                                                    {summary.classes.available}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <TablePagination {...classesPagination} />
                                </>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Jumlah siswa per kelas */}
                            <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-body">
                                    <Users className="h-5 w-5 text-brand" />
                                    Jumlah Siswa per Kelas
                                </h3>

                                {kelasTerpakai.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted">
                                        Belum ada siswa yang ditempatkan pada tahun ajaran ini.
                                    </p>
                                ) : (
                                    <ul className="space-y-3">
                                        {kelasTerpakai.map((row) => (
                                            <li key={row.id}>
                                                <div className="mb-1 flex items-center justify-between text-sm">
                                                    <span className="font-medium text-body">
                                                        {row.display_name}
                                                    </span>
                                                    <span className="text-muted">
                                                        {row.filled} / {row.quota}
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                                                    <div
                                                        className={`h-full rounded-full ${
                                                            row.available === 0
                                                                ? 'bg-red-500'
                                                                : 'bg-brand'
                                                        }`}
                                                        style={{
                                                            width: `${Math.min(
                                                                100,
                                                                (row.filled / maxFilled) * 100
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Rekap lulusan */}
                            <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                                <div className="flex items-center gap-2 border-b border-line px-6 py-4">
                                    <Award className="h-5 w-5 text-brand" />
                                    <h3 className="text-base font-semibold text-body">
                                        Rekap Lulusan
                                    </h3>
                                </div>

                                {summary.graduates.by_year.length === 0 ? (
                                    <p className="px-6 py-10 text-center text-sm text-muted">
                                        Belum ada data kelulusan.
                                    </p>
                                ) : (
                                    <>
                                    <table className="min-w-full divide-y divide-line">
                                        <thead className="bg-surface-muted">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                    <CalendarRange className="mr-1 inline h-3.5 w-3.5" />
                                                    Tahun Lulus
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Jumlah
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-line">
                                            {visibleGraduates.map((year) => (
                                                <tr key={year.id} className="hover:bg-surface-muted">
                                                    <td className="px-6 py-3 text-sm text-body">
                                                        {year.name}
                                                    </td>
                                                    <td className="px-6 py-3 text-right text-sm font-medium text-body">
                                                        {year.total}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <TablePagination {...graduatesPagination} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
