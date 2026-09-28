import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    AlertCircle,
    BarChart3,
    BookOpen,
    CalendarCheck,
    Layers,
    Loader2,
    RotateCcw,
    UserCheck,
    Users,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import SearchableSelect from '../../../components/common/SearchableSelect';
import TablePagination from '../../../components/common/TablePagination';
import { useTablePagination } from '../../../components/common/useTablePagination';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { academicDashboardService } from '../../../services/academicServices';
import type { AcademicDashboardData } from '../../../types/academic';

export default function AcademicDashboard() {
    const toast = useToast();

    const [data, setData] = useState<AcademicDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [yearId, setYearId] = useState<number | null>(null);
    const [classroomId, setClassroomId] = useState<number | null>(null);
    const [semester, setSemester] = useState<number>(1);

    const load = useCallback(
        async (params: {
            academic_year_id?: number;
            classroom_id?: number;
            semester?: number;
        }) => {
            setLoading(true);
            setError(null);

            try {
                const result = await academicDashboardService.getData(params);

                setData(result);
                setYearId(result.academic_year?.id ?? null);
                setClassroomId(result.classroom?.id ?? null);
                setSemester(result.semester ?? 1);
            } catch (err) {
                console.error('Error fetching academic dashboard:', err);
                setError(getApiErrorMessage(err, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        load({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleYearChange = async (value: number) => {
        await load({ academic_year_id: value, semester });
        toast.success('Filter tahun ajaran diperbarui');
    };

    const handleClassroomChange = async (value: number | 'all') => {
        await load({
            academic_year_id: yearId ?? undefined,
            classroom_id: value === 'all' ? undefined : value,
            semester,
        });
    };

    const handleSemesterChange = async (value: number) => {
        await load({
            academic_year_id: yearId ?? undefined,
            classroom_id: classroomId ?? undefined,
            semester: value,
        });
    };

    const classes = data?.classes;
    const attendance = data?.attendance;
    const grades = data?.grades;
    const { pageItems: visibleClasses, pagination: classesPagination } = useTablePagination(classes?.rows ?? []);
    const { pageItems: visibleAttendance, pagination: attendancePagination } = useTablePagination(attendance?.by_class ?? []);
    const { pageItems: visibleSubjects, pagination: subjectsPagination } = useTablePagination(grades?.by_subject ?? []);
    const { pageItems: visibleGradeClasses, pagination: gradeClassesPagination } = useTablePagination(grades?.by_class ?? []);

    return (
        <>
            <Helmet>
                <title>Dashboard Akademik | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Dashboard Akademik">
                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                        <BarChart3 className="h-6 w-6 text-brand" />
                        Dashboard Akademik
                    </h1>
                    <p className="text-sm text-muted sm:text-base">
                        Ringkasan siswa, kelas, nilai, dan absensi per tahun ajaran. Hanya untuk
                        monitoring — tidak mengubah data akademik.
                    </p>
                </div>

                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Tahun Ajaran
                            </label>
                            <SearchableSelect
                                options={(data?.academic_years ?? []).map((year) => ({
                                    value: year.id,
                                    label: year.name,
                                    description: year.is_active ? 'Aktif' : undefined,
                                }))}
                                value={yearId}
                                onChange={(value) => handleYearChange(Number(value))}
                                placeholder="Pilih tahun ajaran"
                                searchPlaceholder="Cari tahun ajaran..."
                                emptyMessage="Belum ada Master Tahun Ajaran"
                                loading={loading}
                                ariaLabel="Tahun ajaran"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">Kelas</label>
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'Semua Kelas' },
                                    ...(data?.classrooms ?? []).map((classroom) => ({
                                        value: classroom.id,
                                        label: classroom.display_name,
                                        description: `Tingkat ${classroom.grade_level}`,
                                    })),
                                ]}
                                value={classroomId ?? 'all'}
                                onChange={(value) => handleClassroomChange(value as number | 'all')}
                                searchPlaceholder="Cari kelas..."
                                emptyMessage="Belum ada kelas pada tahun ajaran ini"
                                ariaLabel="Kelas"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Semester
                            </label>
                            <SearchableSelect
                                options={Object.entries(data?.semesters ?? {}).map(
                                    ([value, label]) => ({
                                        value: Number(value),
                                        label: `Semester ${value} (${label})`,
                                    })
                                )}
                                value={semester}
                                onChange={(value) => handleSemesterChange(Number(value))}
                                searchPlaceholder="Cari semester..."
                                ariaLabel="Semester"
                            />
                        </div>
                    </div>
                </div>

                {loading && !data ? (
                    <div className="rounded-xl border border-line bg-surface py-16 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat ringkasan akademik...</p>
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
                        <p className="text-sm font-medium text-red-700">
                            Gagal memuat dashboard akademik
                        </p>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                        <button
                            onClick={() =>
                                load({
                                    academic_year_id: yearId ?? undefined,
                                    classroom_id: classroomId ?? undefined,
                                    semester,
                                })
                            }
                            className="mt-4 inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Coba lagi
                        </button>
                    </div>
                ) : !data?.academic_year ? (
                    <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Belum ada tahun ajaran
                        </h3>
                        <p className="mx-auto max-w-lg text-muted">
                            Tambahkan tahun ajaran di Master Data → Tahun Ajaran untuk melihat
                            ringkasan akademik.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Kartu ringkasan utama */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted">Siswa Aktif</p>
                                        <p className="mt-2 text-3xl font-bold text-body">
                                            {data.students.active_in_year}
                                        </p>
                                        <p className="mt-1 text-xs text-muted">
                                            terdaftar di tahun ajaran ini •{' '}
                                            {data.students.active_total} siswa aktif total
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
                                        <p className="text-sm text-muted">Belum Ditempatkan</p>
                                        <p className="mt-2 text-3xl font-bold text-body">
                                            {data.unplaced_students}
                                        </p>
                                        <p className="mt-1 text-xs text-muted">
                                            siswa Diterima yang belum punya kelas
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-amber-50 p-2.5">
                                        <Layers className="h-5 w-5 text-amber-700" />
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted">Rata-rata Nilai</p>
                                        <p className="mt-2 text-3xl font-bold text-body">
                                            {grades?.average ?? '-'}
                                        </p>
                                        <p className="mt-1 text-xs text-muted">
                                            {grades?.filled ?? 0} nilai terisi •{' '}
                                            {grades?.students_without_score ?? 0} siswa belum dinilai
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-brand/20 p-2.5">
                                        <BookOpen className="h-5 w-5 text-brand" />
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted">Persentase Kehadiran</p>
                                        <p className="mt-2 text-3xl font-bold text-body">
                                            {attendance?.rate !== null && attendance?.rate !== undefined
                                                ? `${attendance.rate}%`
                                                : '-'}
                                        </p>
                                        <p className="mt-1 text-xs text-muted">
                                            dari {attendance?.total ?? 0} hari tercatat semester{' '}
                                            {data.semester}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-brand/20 p-2.5">
                                        <CalendarCheck className="h-5 w-5 text-brand" />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Rekap kelas */}
                        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                            <div className="flex items-center gap-2 border-b border-line px-6 py-4">
                                <Layers className="h-5 w-5 text-brand" />
                                <h3 className="text-base font-semibold text-body">Rekap Kelas</h3>
                            </div>

                            {!classes || classes.rows.length === 0 ? (
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
                                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Jumlah Siswa
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Kapasitas
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Terisi
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Sisa Kuota
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-line">
                                            {visibleClasses.map((row) => (
                                                <tr key={row.id} className="hover:bg-surface-muted">
                                                    <td className="px-6 py-4 text-sm font-medium text-body">
                                                        {row.display_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-muted">
                                                        {row.grade_level}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-body">
                                                        {row.students}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-body">
                                                        {row.quota}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium text-body">
                                                        {row.filled}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-muted">
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
                                                    Total
                                                </td>
                                                <td className="px-6 py-3 text-right text-sm font-semibold text-body">
                                                    {classes.students}
                                                </td>
                                                <td className="px-6 py-3 text-right text-sm font-semibold text-body">
                                                    {classes.capacity}
                                                </td>
                                                <td className="px-6 py-3 text-right text-sm font-semibold text-body">
                                                    {classes.filled}
                                                </td>
                                                <td className="px-6 py-3 text-right text-sm font-semibold text-body">
                                                    {classes.available}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <TablePagination {...classesPagination} />
                                </>
                            )}
                        </div>

                        {/* Rekap absensi */}
                        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-body">
                                <CalendarCheck className="h-5 w-5 text-brand" />
                                Rekap Absensi Semester {data.semester}
                            </h3>

                            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                                {(
                                    [
                                        ['Hadir', attendance?.hadir ?? 0],
                                        ['Izin', attendance?.izin ?? 0],
                                        ['Sakit', attendance?.sakit ?? 0],
                                        ['Alpa', attendance?.alpa ?? 0],
                                        ['Hari Tercatat', attendance?.total ?? 0],
                                    ] as const
                                ).map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="rounded-xl border border-line bg-surface-muted p-4"
                                    >
                                        <p className="text-sm text-muted">{label}</p>
                                        <p className="mt-1 text-2xl font-bold text-body">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {(attendance?.by_class.length ?? 0) > 0 && !classroomId && (
                                <div className="mt-6 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-line">
                                        <thead className="bg-surface-muted">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Kelas
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Hadir
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Izin
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Sakit
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Alpa
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Kehadiran
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-line">
                                            {visibleAttendance.map((row) => (
                                                <tr key={row.classroom_id} className="hover:bg-surface-muted">
                                                    <td className="px-6 py-3 text-sm font-medium text-body">
                                                        {row.display_name}
                                                    </td>
                                                    <td className="px-6 py-3 text-right text-sm text-body">
                                                        {row.hadir}
                                                    </td>
                                                    <td className="px-6 py-3 text-right text-sm text-body">
                                                        {row.izin}
                                                    </td>
                                                    <td className="px-6 py-3 text-right text-sm text-body">
                                                        {row.sakit}
                                                    </td>
                                                    <td className="px-6 py-3 text-right text-sm text-body">
                                                        {row.alpa}
                                                    </td>
                                                    <td className="px-6 py-3 text-right text-sm text-muted">
                                                        {row.rate !== null ? `${row.rate}%` : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <TablePagination {...attendancePagination} />
                                </div>
                            )}
                        </div>

                        {/* Rekap nilai */}
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                                <div className="flex items-center gap-2 border-b border-line px-6 py-4">
                                    <BookOpen className="h-5 w-5 text-brand" />
                                    <h3 className="text-base font-semibold text-body">
                                        Rekap Nilai per Mata Pelajaran
                                    </h3>
                                </div>

                                {(grades?.by_subject.length ?? 0) === 0 ? (
                                    <p className="px-6 py-10 text-center text-sm text-muted">
                                        Belum ada nilai pada semester ini.
                                    </p>
                                ) : (
                                    <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-line">
                                            <thead className="bg-surface-muted">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Kode
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Mata Pelajaran
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Nilai
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Rata-rata
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Tertinggi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-line">
                                                {visibleSubjects.map((row) => (
                                                    <tr
                                                        key={row.subject_id}
                                                        className="hover:bg-surface-muted"
                                                    >
                                                        <td className="px-6 py-3 text-sm font-semibold text-body">
                                                            {row.code}
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-body">
                                                            {row.name}
                                                        </td>
                                                        <td className="px-6 py-3 text-right text-sm text-muted">
                                                            {row.filled}
                                                        </td>
                                                        <td className="px-6 py-3 text-right text-sm font-medium text-body">
                                                            {row.average}
                                                        </td>
                                                        <td className="px-6 py-3 text-right text-sm text-muted">
                                                            {row.highest}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <TablePagination {...subjectsPagination} />
                                    </>
                                )}
                            </div>

                            <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                                <div className="flex items-center gap-2 border-b border-line px-6 py-4">
                                    <Users className="h-5 w-5 text-brand" />
                                    <h3 className="text-base font-semibold text-body">
                                        Rekap Nilai per Kelas
                                    </h3>
                                </div>

                                {(grades?.by_class.length ?? 0) === 0 ? (
                                    <p className="px-6 py-10 text-center text-sm text-muted">
                                        Belum ada kelas untuk ditampilkan.
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
                                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Nilai Terisi
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Rata-rata
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-line">
                                                {visibleGradeClasses.map((row) => (
                                                    <tr
                                                        key={row.classroom_id}
                                                        className="hover:bg-surface-muted"
                                                    >
                                                        <td className="px-6 py-3 text-sm font-medium text-body">
                                                            {row.display_name}
                                                        </td>
                                                        <td className="px-6 py-3 text-right text-sm text-muted">
                                                            {row.filled}
                                                        </td>
                                                        <td className="px-6 py-3 text-right text-sm font-medium text-body">
                                                            {row.average ?? '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <TablePagination {...gradeClassesPagination} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        </>
    );
}
