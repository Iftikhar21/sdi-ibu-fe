import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, Save, UserCheck, Users } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import SearchableSelect from '../../../components/common/SearchableSelect';
import TablePagination from '../../../components/common/TablePagination';
import { useTablePagination } from '../../../components/common/useTablePagination';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { teacherAssignmentService } from '../../../services/teacherAssignmentServices';
import type { TeacherAssignmentData } from '../../../types/teacherAssignment';

export default function TeacherAssignment() {
    const toast = useToast();

    const [data, setData] = useState<TeacherAssignmentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [yearId, setYearId] = useState<number | null>(null);
    const [classroomId, setClassroomId] = useState<number | null>(null);

    const [homeroomTeacherId, setHomeroomTeacherId] = useState<number | null>(null);
    const [subjectTeachers, setSubjectTeachers] = useState<Record<number, number | null>>({});
    const [isSavingHomeroom, setIsSavingHomeroom] = useState(false);
    const [isSavingTeaching, setIsSavingTeaching] = useState(false);
    const { pageItems: visibleSubjects, pagination } = useTablePagination(data?.subjects ?? []);

    const applyData = useCallback((result: TeacherAssignmentData) => {
        setData(result);
        setYearId(result.academic_year?.id ?? null);
        setClassroomId(result.classroom?.id ?? null);
        setHomeroomTeacherId(result.homeroom?.teacher_id ?? null);

        const guru: Record<number, number | null> = {};

        result.subjects.forEach((subject) => {
            guru[subject.subject_id] = subject.teacher_id;
        });

        setSubjectTeachers(guru);
    }, []);

    const load = useCallback(
        async (params: { academic_year_id?: number; classroom_id?: number }) => {
            setLoading(true);
            try {
                applyData(await teacherAssignmentService.getData(params));
            } catch (error) {
                console.error('Error fetching teacher assignments:', error);
                toast.error(
                    'Gagal memuat penugasan guru',
                    getApiErrorMessage(error, 'silakan coba lagi')
                );
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

    const handleYearChange = async (value: number) => {
        const result = await teacherAssignmentService.getData({ academic_year_id: value });
        const kelasPertama = result.classrooms[0];

        setData(result);
        setYearId(value);
        setClassroomId(kelasPertama?.id ?? null);
        setHomeroomTeacherId(null);
        setSubjectTeachers({});

        if (kelasPertama) {
            await load({ academic_year_id: value, classroom_id: kelasPertama.id });
        }
    };

    const handleClassroomChange = async (value: number) => {
        setClassroomId(value);

        if (yearId) {
            await load({ academic_year_id: yearId, classroom_id: value });
        }
    };

    const handleSaveHomeroom = async () => {
        if (!yearId || !classroomId) return;

        setIsSavingHomeroom(true);
        try {
            const result = await teacherAssignmentService.saveHomeroom(
                yearId,
                classroomId,
                homeroomTeacherId
            );

            toast.success('Wali kelas tersimpan', result.message);
            await load({ academic_year_id: yearId, classroom_id: classroomId });
        } catch (error) {
            console.error('Error saving homeroom teacher:', error);
            toast.error(
                'Gagal menyimpan wali kelas',
                getApiErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsSavingHomeroom(false);
        }
    };

    const handleSaveTeaching = async () => {
        if (!yearId || !classroomId) return;

        setIsSavingTeaching(true);
        try {
            const assignments = (data?.subjects ?? []).map((subject) => ({
                subject_id: subject.subject_id,
                teacher_id: subjectTeachers[subject.subject_id] ?? null,
            }));

            const result = await teacherAssignmentService.saveTeaching(
                yearId,
                classroomId,
                assignments
            );

            toast.success('Guru pengampu tersimpan', result.message);
            await load({ academic_year_id: yearId, classroom_id: classroomId });
        } catch (error) {
            console.error('Error saving teaching assignments:', error);

            const errors = (
                error as { response?: { data?: { errors?: { assignments?: string[] } } } }
            )?.response?.data?.errors;

            toast.error(
                'Gagal menyimpan guru pengampu',
                errors?.assignments?.length
                    ? errors.assignments.join(' ')
                    : getApiErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsSavingTeaching(false);
        }
    };

    const teacherOptions = (data?.teachers ?? []).map((teacher) => ({
        value: teacher.id,
        label: teacher.name,
        description: teacher.position ?? undefined,
    }));

    return (
        <>
            <Helmet>
                <title>Guru &amp; Wali Kelas | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Guru & Wali Kelas">
                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                        <UserCheck className="h-6 w-6 text-brand" />
                        Guru &amp; Wali Kelas
                    </h1>
                    <p className="text-sm text-muted sm:text-base">
                        Tentukan wali kelas dan guru pengampu tiap mata pelajaran. Penugasan
                        disimpan per tahun ajaran, jadi riwayat tahun sebelumnya tidak berubah.
                    </p>
                </div>

                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-line bg-surface py-16 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat penugasan guru...</p>
                    </div>
                ) : !classroomId || !data?.classroom ? (
                    <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                        <Users className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Pilih kelas untuk mengatur penugasan
                        </h3>
                        <p className="mx-auto max-w-lg text-muted">
                            Penugasan guru terikat pada satu kelas dan satu tahun ajaran.
                        </p>
                    </div>
                ) : (data.teachers.length === 0 ? (
                    <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                        <Users className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Belum ada data guru aktif
                        </h3>
                        <p className="mx-auto max-w-lg text-muted">
                            Tambahkan guru di menu Profil → Guru &amp; Tenaga Kependidikan terlebih
                            dahulu.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Wali kelas */}
                        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-body">
                                <UserCheck className="h-5 w-5 text-brand" />
                                Wali Kelas {data.classroom.display_name}
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-body">
                                        Guru
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'none', label: 'Belum ditentukan' },
                                            ...teacherOptions,
                                        ]}
                                        value={homeroomTeacherId ?? 'none'}
                                        onChange={(value) =>
                                            setHomeroomTeacherId(
                                                value === 'none' ? null : Number(value)
                                            )
                                        }
                                        placeholder="Pilih wali kelas"
                                        searchPlaceholder="Cari guru..."
                                        emptyMessage="Belum ada data guru"
                                        ariaLabel="Wali kelas"
                                    />
                                    <p className="mt-2 text-xs text-muted">
                                        Satu kelas hanya boleh punya satu wali kelas per tahun
                                        ajaran, dan satu guru tidak bisa menjadi wali di dua kelas
                                        pada tahun yang sama.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSaveHomeroom}
                                    disabled={isSavingHomeroom}
                                    className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSavingHomeroom ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Simpan Wali Kelas
                                </button>
                            </div>
                        </div>

                        {/* Guru pengampu */}
                        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                            <div className="flex flex-col justify-between gap-3 border-b border-line px-6 py-4 md:flex-row md:items-center">
                                <div>
                                    <h2 className="text-base font-semibold text-body">
                                        Guru Pengampu Mata Pelajaran
                                    </h2>
                                    <p className="mt-1 text-xs text-muted">
                                        Pilih guru untuk tiap mata pelajaran. Pilihan "Belum
                                        ditentukan" akan mengosongkan penugasan.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSaveTeaching}
                                    disabled={isSavingTeaching || data.subjects.length === 0}
                                    className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSavingTeaching ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Simpan Penugasan
                                </button>
                            </div>

                            {data.subjects.length === 0 ? (
                                <p className="px-6 py-10 text-center text-sm text-muted">
                                    Belum ada mata pelajaran aktif untuk tingkat{' '}
                                    {data.classroom.grade_level}.
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
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                    Guru Pengampu
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-line">
                                            {visibleSubjects.map((subject) => (
                                                <tr key={subject.subject_id} className="hover:bg-surface-muted">
                                                    <td className="px-6 py-3 text-sm font-semibold text-body">
                                                        {subject.code}
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-body">
                                                        {subject.name}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="w-full min-w-56 md:w-80">
                                                            <SearchableSelect
                                                                options={[
                                                                    {
                                                                        value: 'none',
                                                                        label: 'Belum ditentukan',
                                                                    },
                                                                    ...teacherOptions,
                                                                ]}
                                                                value={
                                                                    subjectTeachers[
                                                                        subject.subject_id
                                                                    ] ?? 'none'
                                                                }
                                                                onChange={(value) =>
                                                                    setSubjectTeachers(
                                                                        (previous) => ({
                                                                            ...previous,
                                                                            [subject.subject_id]:
                                                                                value === 'none'
                                                                                    ? null
                                                                                    : Number(value),
                                                                        })
                                                                    )
                                                                }
                                                                placeholder="Pilih guru"
                                                                searchPlaceholder="Cari guru..."
                                                                emptyMessage="Belum ada data guru"
                                                                compact
                                                                ariaLabel={`Guru pengampu ${subject.name}`}
                                                            />
                                                        </div>
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
                    </div>
                ))}
            </Layout>
        </>
    );
}
