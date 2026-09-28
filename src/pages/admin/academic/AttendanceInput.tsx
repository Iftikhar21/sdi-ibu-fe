import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CalendarCheck, ClipboardCheck, Info, Loader2, Save, Users } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import SearchableSelect from '../../../components/common/SearchableSelect';
import DateInput from '../../../components/common/DateInput';
import TablePagination from '../../../components/common/TablePagination';
import { useTablePagination } from '../../../components/common/useTablePagination';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { attendanceService } from '../../../services/attendanceServices';
import type {
    AttendanceData,
    AttendanceRecap,
    AttendanceStatus,
} from '../../../types/attendance';

const statusOrder: AttendanceStatus[] = ['hadir', 'izin', 'sakit', 'alpa'];

const statusStyles: Record<AttendanceStatus, { aktif: string; nonaktif: string }> = {
    hadir: {
        aktif: 'border-green-200 bg-green-50 text-green-700',
        nonaktif: 'border-line bg-surface text-muted hover:bg-surface-muted',
    },
    izin: {
        aktif: 'border-blue-200 bg-blue-50 text-blue-700',
        nonaktif: 'border-line bg-surface text-muted hover:bg-surface-muted',
    },
    sakit: {
        aktif: 'border-amber-200 bg-amber-50 text-amber-700',
        nonaktif: 'border-line bg-surface text-muted hover:bg-surface-muted',
    },
    alpa: {
        aktif: 'border-red-200 bg-red-50 text-red-700',
        nonaktif: 'border-line bg-surface text-muted hover:bg-surface-muted',
    },
};

interface FormRow {
    status: AttendanceStatus | null;
    notes: string;
}

export default function AttendanceInput() {
    const toast = useToast();

    const [data, setData] = useState<AttendanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [yearId, setYearId] = useState<number | null>(null);
    const [classroomId, setClassroomId] = useState<number | null>(null);
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [form, setForm] = useState<Record<number, FormRow>>({});
    const [isSaving, setIsSaving] = useState(false);

    const [recap, setRecap] = useState<AttendanceRecap | null>(null);
    const [recapFrom, setRecapFrom] = useState('');
    const [recapTo, setRecapTo] = useState('');
    const [isLoadingRecap, setIsLoadingRecap] = useState(false);

    const applyData = useCallback((result: AttendanceData) => {
        setData(result);
        setYearId(result.academic_year?.id ?? null);
        setClassroomId(result.classroom?.id ?? null);
        setDate(result.date);

        const rows: Record<number, FormRow> = {};

        result.students.forEach((student) => {
            rows[student.id] = {
                status: student.status,
                notes: student.notes ?? '',
            };
        });

        setForm(rows);
    }, []);

    const load = useCallback(
        async (params: { academic_year_id?: number; classroom_id?: number; date?: string }) => {
            setLoading(true);
            try {
                applyData(await attendanceService.getData(params));
            } catch (error) {
                console.error('Error fetching attendance:', error);
                toast.error('Gagal memuat data absensi', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        },
        [applyData, toast]
    );

    useEffect(() => {
        load({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadRecap = useCallback(
        async (academicYearId: number, classId: number, from?: string, to?: string) => {
            setIsLoadingRecap(true);
            try {
                const result = await attendanceService.getRecap({
                    academic_year_id: academicYearId,
                    classroom_id: classId,
                    from: from || undefined,
                    to: to || undefined,
                });

                setRecap(result);
                setRecapFrom(result.from ?? '');
                setRecapTo(result.to ?? '');
            } catch (error) {
                console.error('Error fetching attendance recap:', error);
                toast.error('Gagal memuat rekap', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setIsLoadingRecap(false);
            }
        },
        [toast]
    );

    // Ganti tahun ajaran: pilih kelas pertama, lalu muat absensi & rekapnya
    const handleYearChange = async (value: number) => {
        const result = await attendanceService.getData({ academic_year_id: value });
        const kelasPertama = result.classrooms[0];

        setData(result);
        setYearId(value);
        setClassroomId(kelasPertama?.id ?? null);
        setRecap(null);

        if (kelasPertama) {
            await load({ academic_year_id: value, classroom_id: kelasPertama.id, date });
            await loadRecap(value, kelasPertama.id);
        } else {
            setForm({});
        }
    };

    const handleClassroomChange = async (value: number) => {
        setClassroomId(value);
        setRecap(null);

        if (yearId) {
            await load({ academic_year_id: yearId, classroom_id: value, date });
            await loadRecap(yearId, value);
        }
    };

    const handleDateChange = async (value: string) => {
        setDate(value);

        if (yearId && classroomId) {
            await load({ academic_year_id: yearId, classroom_id: classroomId, date: value });
        }
    };

    const students = useMemo(() => data?.students ?? [], [data]);
    const { pageItems: visibleStudents, pagination: studentsPagination } = useTablePagination(students);
    const { pageItems: visibleRecap, pagination: recapPagination } = useTablePagination(recap?.students ?? []);

    const setStatus = (studentId: number, status: AttendanceStatus) => {
        setForm((previous) => ({
            ...previous,
            [studentId]: { ...(previous[studentId] ?? { notes: '' }), status },
        }));
    };

    const setNotes = (studentId: number, notes: string) => {
        setForm((previous) => ({
            ...previous,
            [studentId]: { ...(previous[studentId] ?? { status: null, notes: '' }), notes },
        }));
    };

    const tandaiSemuaHadir = () => {
        const rows: Record<number, FormRow> = {};

        students.forEach((student) => {
            rows[student.id] = { status: 'hadir', notes: form[student.id]?.notes ?? '' };
        });

        setForm(rows);
    };

    const ringkasan = useMemo(() => {
        const total: Record<AttendanceStatus, number> = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };

        students.forEach((student) => {
            const status = form[student.id]?.status;

            if (status) {
                total[status]++;
            }
        });

        return total;
    }, [students, form]);

    const belumDiisi = students.filter((student) => !form[student.id]?.status).length;

    const handleSave = async () => {
        if (!yearId || !classroomId) return;

        const records = students
            .filter((student) => form[student.id]?.status)
            .map((student) => ({
                student_id: student.id,
                status: form[student.id].status as AttendanceStatus,
                notes: form[student.id].notes.trim() || undefined,
            }));

        if (records.length === 0) {
            toast.warning('Belum ada status kehadiran yang dipilih');
            return;
        }

        setIsSaving(true);
        try {
            const result = await attendanceService.save(yearId, classroomId, date, records);

            toast.success('Absensi berhasil disimpan', result.message);
            await load({ academic_year_id: yearId, classroom_id: classroomId, date });
            await loadRecap(yearId, classroomId, recapFrom, recapTo);
        } catch (error) {
            console.error('Error saving attendance:', error);

            const errors = (
                error as { response?: { data?: { errors?: { records?: string[] } } } }
            )?.response?.data?.errors;

            toast.error(
                'Gagal menyimpan absensi',
                errors?.records?.length
                    ? errors.records.join(' ')
                    : getApiErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Absensi | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Absensi">
                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                        <CalendarCheck className="h-6 w-6 text-brand" />
                        Absensi Siswa
                    </h1>
                    <p className="text-sm text-muted sm:text-base">
                        Pilih tahun ajaran, kelas, dan tanggal — lalu isi status kehadiran.
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
                                ariaLabel="Tahun ajaran"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">Kelas</label>
                            <SearchableSelect
                                options={(data?.classrooms ?? []).map((classroom) => ({
                                    value: classroom.id,
                                    label: classroom.display_name,
                                    description: `${classroom.filled} siswa`,
                                }))}
                                value={classroomId}
                                onChange={(value) => handleClassroomChange(Number(value))}
                                placeholder="Pilih kelas"
                                searchPlaceholder="Cari kelas..."
                                emptyMessage="Belum ada kelas pada tahun ajaran ini"
                                ariaLabel="Kelas"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">Tanggal</label>
                            <DateInput
                                value={date}
                                onChange={handleDateChange}
                                placeholder="Pilih tanggal"
                                ariaLabel="Tanggal absensi"
                                clearable={false}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-line bg-surface py-16 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat data absensi...</p>
                    </div>
                ) : !classroomId || !data?.classroom ? (
                    <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                        <Users className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Pilih kelas untuk mulai absensi
                        </h3>
                        <p className="mx-auto max-w-lg text-muted">
                            Siswa diambil dari penempatan kelas aktif pada tahun ajaran yang dipilih.
                        </p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                        <Users className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Belum ada siswa di kelas ini
                        </h3>
                        <p className="mx-auto max-w-lg text-muted">
                            Tempatkan siswa dulu lewat menu Kesiswaan → Penempatan Kelas.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Ringkasan kehadiran */}
                        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {statusOrder.map((status) => (
                                <div
                                    key={status}
                                    className="rounded-xl border border-line bg-surface p-5 shadow-sm"
                                >
                                    <p className="text-sm text-muted">
                                        {data.statuses[status] ?? status}
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-body">
                                        {ringkasan[status]}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mb-4 flex flex-col justify-between gap-3 rounded-xl border border-line bg-surface px-6 py-4 shadow-sm md:flex-row md:items-center">
                            <div>
                                <p className="text-sm text-muted">
                                    Kelas{' '}
                                    <span className="font-semibold text-body">
                                        {data.classroom.display_name}
                                    </span>{' '}
                                    • {students.length} siswa •{' '}
                                    {new Date(date).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                                <p className="mt-1 text-xs text-muted">
                                    {belumDiisi > 0
                                        ? `${belumDiisi} siswa belum dipilih statusnya (tidak akan disimpan).`
                                        : 'Semua siswa sudah punya status.'}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={tandaiSemuaHadir}
                                    className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                                >
                                    <ClipboardCheck className="mr-2 h-4 w-4" />
                                    Tandai Semua Hadir
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="inline-flex items-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    {isSaving ? 'Menyimpan...' : 'Simpan Absensi'}
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-line">
                                    <thead className="bg-surface-muted">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Siswa
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                NIS
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Kehadiran
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Catatan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {visibleStudents.map((student) => {
                                            const row = form[student.id] ?? {
                                                status: null,
                                                notes: '',
                                            };

                                            return (
                                                <tr key={student.id} className="hover:bg-surface-muted">
                                                    <td className="px-6 py-3 text-sm font-medium text-body">
                                                        {student.full_name}
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-muted">
                                                        {student.nis ?? '-'}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {statusOrder.map((status) => (
                                                                <button
                                                                    key={status}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setStatus(student.id, status)
                                                                    }
                                                                    aria-pressed={
                                                                        row.status === status
                                                                    }
                                                                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                                                                        row.status === status
                                                                            ? statusStyles[status]
                                                                                  .aktif
                                                                            : statusStyles[status]
                                                                                  .nonaktif
                                                                    }`}
                                                                >
                                                                    {data.statuses[status] ?? status}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <input
                                                            type="text"
                                                            value={row.notes}
                                                            onChange={(event) =>
                                                                setNotes(
                                                                    student.id,
                                                                    event.target.value
                                                                )
                                                            }
                                                            placeholder="Opsional"
                                                            maxLength={500}
                                                            className="w-full min-w-40 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <TablePagination {...studentsPagination} />
                        </div>

                        {/* Rekap kehadiran */}
                        <div className="mt-8 overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                            <div className="flex flex-col justify-between gap-4 border-b border-line px-6 py-4 lg:flex-row lg:items-end">
                                <div className="flex items-center gap-2">
                                    <CalendarCheck className="h-5 w-5 text-brand" />
                                    <h2 className="text-base font-semibold text-body">
                                        Rekap Kehadiran
                                    </h2>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                    <div className="w-full sm:w-44">
                                        <label className="mb-1 block text-xs font-medium text-muted">
                                            Dari Tanggal
                                        </label>
                                        <DateInput
                                            value={recapFrom}
                                            onChange={setRecapFrom}
                                            ariaLabel="Rekap dari tanggal"
                                        />
                                    </div>
                                    <div className="w-full sm:w-44">
                                        <label className="mb-1 block text-xs font-medium text-muted">
                                            Sampai Tanggal
                                        </label>
                                        <DateInput
                                            value={recapTo}
                                            onChange={setRecapTo}
                                            ariaLabel="Rekap sampai tanggal"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            yearId &&
                                            classroomId &&
                                            loadRecap(yearId, classroomId, recapFrom, recapTo)
                                        }
                                        disabled={isLoadingRecap}
                                        className="inline-flex items-center justify-center rounded-lg border border-line bg-surface-muted px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isLoadingRecap ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Info className="mr-2 h-4 w-4" />
                                        )}
                                        Tampilkan Rekap
                                    </button>
                                </div>
                            </div>

                            {isLoadingRecap ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-blue-600" />
                                    <p className="text-sm text-muted">Memuat rekap...</p>
                                </div>
                            ) : !recap || recap.students.length === 0 ? (
                                <p className="px-6 py-10 text-center text-sm text-muted">
                                    Belum ada data absensi pada periode ini.
                                </p>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4 border-b border-line px-6 py-4 md:grid-cols-4">
                                        {statusOrder.map((status) => (
                                            <div key={status}>
                                                <p className="text-xs uppercase tracking-wide text-muted">
                                                    {data.statuses[status] ?? status}
                                                </p>
                                                <p className="mt-1 text-xl font-bold text-body">
                                                    {recap.summary[status]}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-line">
                                            <thead className="bg-surface-muted">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Siswa
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Hadir
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Izin
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Sakit
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Alpa
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-line">
                                                {visibleRecap.map((row) => (
                                                    <tr key={row.student_id} className="hover:bg-surface-muted">
                                                        <td className="px-6 py-3 text-sm font-medium text-body">
                                                            {row.full_name}
                                                        </td>
                                                        <td className="px-6 py-3 text-center text-sm text-body">
                                                            {row.hadir}
                                                        </td>
                                                        <td className="px-6 py-3 text-center text-sm text-body">
                                                            {row.izin}
                                                        </td>
                                                        <td className="px-6 py-3 text-center text-sm text-body">
                                                            {row.sakit}
                                                        </td>
                                                        <td className="px-6 py-3 text-center text-sm text-body">
                                                            {row.alpa}
                                                        </td>
                                                        <td className="px-6 py-3 text-center text-sm font-semibold text-body">
                                                            {row.total}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <TablePagination {...recapPagination} />
                                </>
                            )}
                        </div>
                    </>
                )}
            </Layout>
        </>
    );
}
