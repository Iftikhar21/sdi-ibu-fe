import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CalendarClock, Edit2, Loader2, PlusCircle, Trash2, Users } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import TablePagination from '../../../components/common/TablePagination';
import { useTablePagination } from '../../../components/common/useTablePagination';
import { useToast } from '../../../context/toast';
import { useAuth } from '../../../auth/AuthContext';
import { getApiErrorMessage } from '../../../utils/apiError';
import { scheduleService } from '../../../services/scheduleServices';
import type { ScheduleData, ScheduleEntry } from '../../../types/schedule';

interface FormState {
    day: string;
    start_time: string;
    end_time: string;
    subject_id: number | null;
    teacher_id: number | null;
}

const defaultForm: FormState = {
    day: 'senin',
    start_time: '07:00',
    end_time: '08:30',
    subject_id: null,
    teacher_id: null,
};

export default function ScheduleList() {
    const toast = useToast();
    const { user } = useAuth();

    // Guru hanya melihat jadwal; penambahan/perubahan tetap oleh admin
    const bolehMengelola = user?.role?.role_name === 'admin';

    const [data, setData] = useState<ScheduleData | null>(null);
    const [loading, setLoading] = useState(true);
    const [yearId, setYearId] = useState<number | null>(null);
    const [classroomId, setClassroomId] = useState<number | null>(null);
    const [dayFilter, setDayFilter] = useState<string>('all');

    const [showFormModal, setShowFormModal] = useState(false);
    const [editing, setEditing] = useState<ScheduleEntry | null>(null);
    const [form, setForm] = useState<FormState>(defaultForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleting, setDeleting] = useState<ScheduleEntry | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const load = useCallback(
        async (params: { academic_year_id?: number; classroom_id?: number; day?: string }) => {
            setLoading(true);
            try {
                const result = await scheduleService.getData(params);

                setData(result);
                setYearId(result.academic_year?.id ?? null);
                setClassroomId(result.classroom?.id ?? null);
            } catch (error) {
                console.error('Error fetching schedules:', error);
                toast.error('Gagal memuat jadwal', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        },
        [toast]
    );

    useEffect(() => {
        load({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleYearChange = async (value: number) => {
        const result = await scheduleService.getData({ academic_year_id: value });
        const kelasPertama = result.classrooms[0];

        setData(result);
        setYearId(value);
        setClassroomId(kelasPertama?.id ?? null);
        setDayFilter('all');

        if (kelasPertama) {
            await load({ academic_year_id: value, classroom_id: kelasPertama.id, day: 'all' });
        }
    };

    const handleClassroomChange = async (value: number) => {
        setClassroomId(value);

        if (yearId) {
            await load({ academic_year_id: yearId, classroom_id: value, day: dayFilter });
        }
    };

    const handleDayChange = async (value: string) => {
        setDayFilter(value);

        if (yearId && classroomId) {
            await load({ academic_year_id: yearId, classroom_id: classroomId, day: value });
        }
    };

    const dayOptions = useMemo(
        () =>
            Object.entries(data?.days ?? {}).map(([value, label]) => ({
                value,
                label,
            })),
        [data]
    );

    const openCreate = () => {
        setEditing(null);
        setForm({
            ...defaultForm,
            day: dayFilter !== 'all' ? dayFilter : 'senin',
            subject_id: data?.subjects[0]?.id ?? null,
            teacher_id: data?.teachers[0]?.id ?? null,
        });
        setShowFormModal(true);
    };

    const openEdit = (entry: ScheduleEntry) => {
        setEditing(entry);
        setForm({
            day: entry.day,
            start_time: entry.start_time.substring(0, 5),
            end_time: entry.end_time.substring(0, 5),
            subject_id: entry.subject_id,
            teacher_id: entry.teacher_id,
        });
        setShowFormModal(true);
    };

    const handleSubmit = async () => {
        if (!yearId || !classroomId) {
            toast.warning('Pilih tahun ajaran dan kelas terlebih dahulu');
            return;
        }

        if (!form.subject_id || !form.teacher_id) {
            toast.warning('Mata pelajaran dan guru wajib dipilih');
            return;
        }

        if (!form.start_time || !form.end_time) {
            toast.warning('Jam mulai dan jam selesai wajib diisi');
            return;
        }

        if (form.end_time <= form.start_time) {
            toast.warning('Jam selesai harus lebih akhir dari jam mulai');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                academic_year_id: yearId,
                classroom_id: classroomId,
                subject_id: form.subject_id,
                teacher_id: form.teacher_id,
                day: form.day,
                start_time: form.start_time,
                end_time: form.end_time,
            };

            if (editing) {
                await scheduleService.update(editing.id, payload);
                toast.success('Jadwal berhasil diperbarui');
            } else {
                await scheduleService.create(payload);
                toast.success('Jadwal berhasil ditambahkan');
            }

            setShowFormModal(false);
            setEditing(null);
            await load({ academic_year_id: yearId, classroom_id: classroomId, day: dayFilter });
        } catch (error) {
            console.error('Error saving schedule:', error);
            toast.error('Gagal menyimpan jadwal', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleting || !yearId || !classroomId) return;

        setIsDeleting(true);
        try {
            await scheduleService.delete(deleting.id);
            toast.success('Jadwal berhasil dihapus');
            setDeleting(null);
            await load({ academic_year_id: yearId, classroom_id: classroomId, day: dayFilter });
        } catch (error) {
            console.error('Error deleting schedule:', error);
            toast.error('Gagal menghapus jadwal', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsDeleting(false);
        }
    };

    const schedules = data?.schedules ?? [];
    const { pageItems, pagination } = useTablePagination(schedules);

    return (
        <>
            <Helmet>
                <title>Jadwal Pelajaran | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Jadwal Pelajaran">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                            <CalendarClock className="h-6 w-6 text-brand" />
                            Jadwal Pelajaran
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Susun jadwal per kelas: hari, jam, mata pelajaran, dan guru pengampu
                        </p>
                    </div>
                    {bolehMengelola && (
                        <button
                            type="button"
                            onClick={openCreate}
                            disabled={!yearId || !classroomId || (data?.subjects.length ?? 0) === 0}
                            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Jadwal
                        </button>
                    )}
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
                                    description: `Tingkat ${classroom.grade_level}`,
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
                            <label className="mb-2 block text-sm font-medium text-body">Hari</label>
                            <SearchableSelect
                                options={[{ value: 'all', label: 'Semua Hari' }, ...dayOptions]}
                                value={dayFilter}
                                onChange={(value) => handleDayChange(String(value))}
                                searchPlaceholder="Cari hari..."
                                ariaLabel="Filter hari"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-line bg-surface py-16 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat jadwal...</p>
                    </div>
                ) : !classroomId || !data?.classroom ? (
                    <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                        <Users className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Pilih kelas untuk melihat jadwalnya
                        </h3>
                        <p className="mx-auto max-w-lg text-muted">
                            Jadwal disusun per kelas pada tahun ajaran yang dipilih.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                        <div className="flex flex-col justify-between gap-3 border-b border-line px-6 py-4 md:flex-row md:items-center">
                            <p className="text-sm text-muted">
                                Kelas{' '}
                                <span className="font-semibold text-body">
                                    {data.classroom.display_name}
                                </span>{' '}
                                • {schedules.length} jadwal
                            </p>
                            <p className="text-xs text-muted">
                                Wali Kelas:{' '}
                                <span className="font-medium text-body">
                                    {data.homeroom_teacher ?? 'Belum ditentukan'}
                                </span>
                                {data.homeroom_teacher === null && (
                                    <>
                                        {' '}
                                        — atur di menu Akademik → Guru &amp; Wali Kelas
                                    </>
                                )}
                            </p>
                            {(data.subjects.length === 0 || data.teachers.length === 0) && (
                                <p className="text-xs text-amber-700">
                                    {data.subjects.length === 0
                                        ? 'Belum ada mata pelajaran aktif untuk tingkat ini.'
                                        : 'Belum ada data guru aktif.'}{' '}
                                    Lengkapi dulu di menu Akademik → Mata Pelajaran / Profil → Guru.
                                </p>
                            )}
                        </div>

                        {schedules.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <CalendarClock className="mx-auto mb-4 h-12 w-12 text-muted" />
                                <h3 className="mb-2 text-lg font-medium text-body">
                                    Belum ada jadwal untuk kelas ini
                                </h3>
                                <p className="mx-auto max-w-md text-muted">
                                    Klik Tambah Jadwal untuk menyusun jam pelajaran.
                                </p>
                            </div>
                        ) : (
                            <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-line">
                                    <thead className="bg-surface-muted">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Hari
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Jam
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Mata Pelajaran
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Guru
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Kelas
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                {bolehMengelola ? 'Aksi' : 'Keterangan'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {pageItems.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-surface-muted">
                                                <td className="px-6 py-4 text-sm font-medium text-body">
                                                    {entry.day_label}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-body">
                                                    {entry.start_time} – {entry.end_time}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-body">
                                                        {entry.subject}
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        {entry.subject_code}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted">
                                                    {entry.teacher}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-full bg-brand/20 px-3 py-1 text-xs font-semibold text-brand">
                                                        {entry.classroom}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {!bolehMengelola ? (
                                                        <span className="text-xs text-muted">
                                                            Hanya lihat
                                                        </span>
                                                    ) : (
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            onClick={() => openEdit(entry)}
                                                            className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
                                                        >
                                                            <Edit2 className="mr-1.5 h-4 w-4" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleting(entry)}
                                                            className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                                        >
                                                            <Trash2 className="mr-1.5 h-4 w-4" />
                                                            Hapus
                                                        </button>
                                                    </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <TablePagination {...pagination} />
                            </>
                        )}
                    </div>
                )}
            </Layout>

            {/* Modal tambah/edit jadwal */}
            <Modal
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false);
                    setEditing(null);
                }}
                title={editing ? 'Edit Jadwal' : 'Tambah Jadwal'}
                type="default"
                confirmText={editing ? 'Simpan Perubahan' : 'Tambah'}
                cancelText="Batal"
                onConfirm={handleSubmit}
                isLoading={isSubmitting}
                size="lg"
            >
                <div className="space-y-4 py-2">
                    <div className="rounded-lg bg-surface-muted p-4">
                        <p className="text-sm text-muted">Kelas</p>
                        <p className="font-medium text-body">
                            {data?.classroom?.display_name} • {data?.academic_year?.name}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-body">
                                Hari <span className="text-red-500">*</span>
                            </label>
                            <SearchableSelect
                                options={dayOptions}
                                value={form.day}
                                onChange={(value) =>
                                    setForm((previous) => ({ ...previous, day: String(value) }))
                                }
                                searchPlaceholder="Cari hari..."
                                ariaLabel="Hari"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Jam Mulai <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={form.start_time}
                                onChange={(event) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        start_time: event.target.value,
                                    }))
                                }
                                className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Jam Selesai <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={form.end_time}
                                onChange={(event) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        end_time: event.target.value,
                                    }))
                                }
                                className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Mata Pelajaran <span className="text-red-500">*</span>
                            </label>
                            <SearchableSelect
                                options={(data?.subjects ?? []).map((subject) => ({
                                    value: subject.id,
                                    label: subject.name,
                                    description: subject.code,
                                }))}
                                value={form.subject_id}
                                onChange={(value) =>
                                    setForm((previous) => {
                                        const subjectId = Number(value);
                                        // Isi otomatis guru pengampu dari penugasan (bila ada)
                                        const pengampu = data?.subject_teachers?.[subjectId];
                                        const adaDiDaftar = (data?.teachers ?? []).some(
                                            (teacher) => teacher.id === pengampu
                                        );

                                        return {
                                            ...previous,
                                            subject_id: subjectId,
                                            teacher_id: adaDiDaftar
                                                ? (pengampu as number)
                                                : previous.teacher_id,
                                        };
                                    })
                                }
                                placeholder="Pilih mata pelajaran"
                                searchPlaceholder="Cari mata pelajaran..."
                                emptyMessage="Belum ada mata pelajaran"
                                ariaLabel="Mata pelajaran"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Guru <span className="text-red-500">*</span>
                            </label>
                            <SearchableSelect
                                options={(data?.teachers ?? []).map((teacher) => ({
                                    value: teacher.id,
                                    label: teacher.name,
                                    description: teacher.position ?? undefined,
                                }))}
                                value={form.teacher_id}
                                onChange={(value) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        teacher_id: Number(value),
                                    }))
                                }
                                placeholder="Pilih guru"
                                searchPlaceholder="Cari guru..."
                                emptyMessage="Belum ada data guru"
                                ariaLabel="Guru pengampu"
                            />
                        </div>
                    </div>

                    <p className="text-xs text-muted">
                        Sistem menolak jadwal yang bentrok: guru yang sama tidak bisa mengajar dua
                        kelas pada jam bertumpuk, dan satu kelas tidak bisa punya dua mapel di jam
                        yang sama.
                    </p>
                </div>
            </Modal>

            {/* Modal hapus */}
            <Modal
                isOpen={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                title="Konfirmasi Hapus"
                type="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={confirmDelete}
                isLoading={isDeleting}
            >
                <div className="py-2">
                    <p className="text-body">
                        Hapus jadwal{' '}
                        <span className="font-semibold">{deleting?.subject}</span> pada{' '}
                        {deleting?.day_label} jam {deleting?.start_time}–{deleting?.end_time}?
                    </p>
                </div>
            </Modal>
        </>
    );
}
