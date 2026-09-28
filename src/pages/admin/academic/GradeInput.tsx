import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    AlertTriangle,
    ClipboardList,
    Download,
    FileUp,
    Info,
    Loader2,
    Save,
    Users,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import TablePagination from '../../../components/common/TablePagination';
import { useTablePagination } from '../../../components/common/useTablePagination';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { getDownloadErrorMessage } from '../../../utils/fileDownload';
import { gradeService } from '../../../services/academicServices';
import type { GradeData } from '../../../types/academic';

const cellKey = (studentId: number, subjectId: number) => `${studentId}|${subjectId}`;

export default function GradeInput() {
    const toast = useToast();

    const [data, setData] = useState<GradeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [yearId, setYearId] = useState<number | null>(null);
    const [classroomId, setClassroomId] = useState<number | null>(null);
    const [semester, setSemester] = useState<number>(1);
    const [scores, setScores] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importMessage, setImportMessage] = useState('');
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const importInputRef = useRef<HTMLInputElement>(null);

    const applyData = (result: GradeData, keepSelection = false) => {
        setData(result);

        if (!keepSelection) {
            setYearId(result.academic_year?.id ?? null);
            setClassroomId(result.classroom?.id ?? null);
            setSemester(result.semester ?? 1);
        }

        const initial: Record<string, string> = {};

        result.grades.forEach((grade) => {
            initial[cellKey(grade.student_id, grade.subject_id)] = String(grade.score);
        });

        setScores(initial);
    };

    const load = async (academicYearId?: number, classId?: number, selectedSemester?: number) => {
        setLoading(true);
        try {
            applyData(await gradeService.getData(academicYearId, classId, selectedSemester));
        } catch (error) {
            console.error('Error fetching grades:', error);
            toast.error('Gagal memuat data akademik', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Ganti tahun ajaran: kelas direset, lalu pilih kelas pertama yang tersedia
    const handleYearChange = async (value: number) => {
        setYearId(value);
        setClassroomId(null);

        const result = await gradeService.getData(value, undefined, semester);

        applyData(result);
        setYearId(value);
        setClassroomId(result.classrooms[0]?.id ?? null);

        if (result.classrooms[0]) {
            await load(value, result.classrooms[0].id);
        }
    };

    const handleClassroomChange = async (value: number) => {
        setClassroomId(value);

        if (yearId) {
            await load(yearId, value, semester);
        }
    };

    const handleSemesterChange = async (value: number) => {
        setSemester(value);

        if (yearId && classroomId) {
            await load(yearId, classroomId, value);
        }
    };

    const students = useMemo(() => data?.students ?? [], [data]);
    const { pageItems: visibleStudents, pagination } = useTablePagination(students);
    const subjects = useMemo(() => data?.subjects ?? [], [data]);

    const terisi = useMemo(() => {
        let jumlah = 0;

        students.forEach((student) => {
            subjects.forEach((subject) => {
                if ((scores[cellKey(student.id, subject.id)] ?? '').trim() !== '') {
                    jumlah++;
                }
            });
        });

        return jumlah;
    }, [students, subjects, scores]);

    const totalSel = students.length * subjects.length;

    const handleSave = async () => {
        if (!yearId || !classroomId) return;

        // Validasi cepat di sisi UI; backend tetap memvalidasi ulang
        for (const student of students) {
            for (const subject of subjects) {
                const value = (scores[cellKey(student.id, subject.id)] ?? '').trim();

                if (value === '') continue;

                const angka = Number(value);

                if (Number.isNaN(angka) || angka < 0 || angka > 100) {
                    toast.warning(
                        'Nilai tidak valid',
                        `Nilai ${subject.name} untuk ${student.full_name} harus 0 sampai 100.`
                    );
                    return;
                }
            }
        }

        setIsSaving(true);
        try {
            const payload = students.flatMap((student) =>
                subjects.map((subject) => {
                    const value = (scores[cellKey(student.id, subject.id)] ?? '').trim();

                    return {
                        student_id: student.id,
                        subject_id: subject.id,
                        score: value === '' ? null : Number(value),
                    };
                })
            );

            const result = await gradeService.save(yearId, classroomId, semester, payload);

            toast.success('Nilai berhasil disimpan', result.message);
            await load(yearId, classroomId, semester);
        } catch (error) {
            console.error('Error saving grades:', error);

            const errors = (error as { response?: { data?: { errors?: unknown } } })?.response?.data
                ?.errors;
            const daftar = errors as { scores?: string[] } | undefined;

            toast.error(
                'Gagal menyimpan nilai',
                daftar?.scores?.length
                    ? daftar.scores.join(' ')
                    : getApiErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async () => {
        if (!yearId || !classroomId) return;

        setIsExporting(true);
        try {
            await gradeService.exportGrades(yearId, classroomId, semester);
            toast.success('Data nilai berhasil diunduh');
        } catch (error) {
            toast.error(
                'Gagal mengekspor nilai',
                await getDownloadErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsExporting(false);
        }
    };

    const closeImportModal = () => {
        setShowImportModal(false);
        setImportFile(null);
        setImportMessage('');
        setImportErrors([]);
        if (importInputRef.current) importInputRef.current.value = '';
    };

    const handleImport = async () => {
        if (!yearId || !classroomId) return;
        if (!importFile) {
            setImportMessage('Pilih berkas Excel terlebih dahulu.');
            return;
        }

        setIsImporting(true);
        setImportMessage('');
        setImportErrors([]);
        try {
            const result = await gradeService.importGrades(
                importFile,
                yearId,
                classroomId,
                semester
            );
            toast.success('Impor nilai berhasil', result.message);
            closeImportModal();
            await load(yearId, classroomId, semester);
        } catch (error) {
            const body = (
                error as {
                    response?: {
                        data?: {
                            message?: string;
                            errors?: unknown;
                        };
                    };
                }
            )?.response?.data;
            const scoreErrors = (body?.errors as { scores?: unknown } | undefined)?.scores;
            const errors = Array.isArray(scoreErrors)
                ? scoreErrors.filter((message): message is string => typeof message === 'string')
                : [];
            setImportErrors(errors);
            setImportMessage(body?.message ?? getApiErrorMessage(error, 'Gagal mengimpor nilai'));
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Input Nilai | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Input Nilai">
                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                        <ClipboardList className="h-6 w-6 text-brand" />
                        Input Nilai Siswa
                    </h1>
                    <p className="text-sm text-muted sm:text-base">
                        Pilih tahun ajaran dan kelas, lalu isi nilai per mata pelajaran.
                    </p>
                </div>

                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                                loading={loading}
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
                                placeholder="Pilih semester"
                                searchPlaceholder="Cari semester..."
                                ariaLabel="Semester"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-line bg-surface py-16 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat data akademik...</p>
                    </div>
                ) : !classroomId || !data?.classroom ? (
                    <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                        <Users className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Pilih kelas untuk mulai input nilai
                        </h3>
                        <p className="mx-auto max-w-lg text-muted">
                            Siswa diambil dari penempatan kelas pada tahun ajaran yang dipilih.
                        </p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                        <Users className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Belum ada siswa di kelas ini
                        </h3>
                        <p className="mx-auto max-w-lg text-muted">
                            Tempatkan siswa ke kelas ini dulu lewat menu Kesiswaan → Penempatan
                            Kelas.
                        </p>
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                        <Info className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Belum ada mata pelajaran aktif untuk tingkat{' '}
                            {data.classroom.grade_level}
                        </h3>
                        <p className="mx-auto max-w-lg text-muted">
                            Tambahkan mata pelajaran di menu Akademik → Mata Pelajaran.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex flex-col justify-between gap-3 rounded-xl border border-line bg-surface px-6 py-4 shadow-sm md:flex-row md:items-center">
                            <div>
                                <p className="text-sm text-muted">
                                    Kelas{' '}
                                    <span className="font-semibold text-body">
                                        {data.classroom.display_name}
                                    </span>{' '}
                                    • Semester {data.semester} • {students.length} siswa •{' '}
                                    {subjects.length} mata pelajaran
                                </p>
                                <p className="mt-1 text-xs text-muted">
                                    Terisi {terisi} dari {totalSel} sel nilai. Kosongkan sel lalu simpan
                                    untuk menghapus nilai.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isExporting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="mr-2 h-4 w-4" />
                                    )}
                                    Export Excel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowImportModal(true)}
                                    className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                                >
                                    <FileUp className="mr-2 h-4 w-4" />
                                    Import Excel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    {isSaving ? 'Menyimpan...' : 'Simpan Nilai'}
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-line">
                                    <thead className="bg-surface-muted">
                                        <tr>
                                            <th className="sticky left-0 z-10 bg-surface-muted px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Siswa
                                            </th>
                                            {subjects.map((subject) => (
                                                <th
                                                    key={subject.id}
                                                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted"
                                                    title={subject.name}
                                                >
                                                    <span className="block">{subject.code}</span>
                                                    <span className="block text-[10px] font-normal normal-case">
                                                        {subject.name}
                                                    </span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {visibleStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-surface-muted">
                                                <td className="sticky left-0 z-10 bg-surface px-6 py-3">
                                                    <p className="text-sm font-medium text-body">
                                                        {student.full_name}
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        {student.nis ?? 'NIS belum diisi'}
                                                    </p>
                                                </td>
                                                {subjects.map((subject) => (
                                                    <td key={subject.id} className="px-2 py-2">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            step="0.01"
                                                            inputMode="decimal"
                                                            value={
                                                                scores[
                                                                    cellKey(student.id, subject.id)
                                                                ] ?? ''
                                                            }
                                                            onChange={(event) =>
                                                                setScores((previous) => ({
                                                                    ...previous,
                                                                    [cellKey(
                                                                        student.id,
                                                                        subject.id
                                                                    )]: event.target.value,
                                                                }))
                                                            }
                                                            aria-label={`Nilai ${subject.name} ${student.full_name}`}
                                                            className="w-20 rounded-lg border border-line bg-surface px-2 py-1.5 text-center text-sm text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <TablePagination {...pagination} />
                        </div>
                    </>
                )}
            </Layout>

            <Modal
                isOpen={showImportModal}
                onClose={closeImportModal}
                title="Import Nilai Siswa"
                type="default"
                confirmText="Import Sekarang"
                cancelText="Batal"
                onConfirm={handleImport}
                isLoading={isImporting}
                size="lg"
            >
                <div className="space-y-4 py-2">
                    <div className="rounded-lg border border-line bg-surface-muted p-4 text-sm text-muted">
                        <p className="mb-2 font-medium text-body">Cara pakai</p>
                        <ol className="list-decimal space-y-1 pl-4">
                            <li>
                                Pilih tahun ajaran, kelas, dan semester, lalu klik Export Excel.
                            </li>
                            <li>Edit nilai pada file hasil export tanpa mengubah identitas siswa.</li>
                            <li>Nilai harus 0–100. Sel kosong akan menghapus nilai yang lama.</li>
                            <li>
                                Import file pada pilihan tahun ajaran, kelas, dan semester yang sama.
                            </li>
                        </ol>
                    </div>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                        {data?.academic_year?.name} • Kelas {data?.classroom?.display_name} • Semester{' '}
                        {semester}
                    </div>
                    <div>
                        <label
                            htmlFor="grade-import-file"
                            className="mb-2 block text-sm font-medium text-body"
                        >
                            Berkas Excel (.xlsx), maksimal 5MB
                        </label>
                        <input
                            id="grade-import-file"
                            ref={importInputRef}
                            type="file"
                            accept=".xlsx"
                            onChange={(event) => {
                                setImportFile(event.target.files?.[0] ?? null);
                                setImportMessage('');
                                setImportErrors([]);
                            }}
                            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-body file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-strong"
                        />
                    </div>
                    {importMessage && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <p className="flex items-start gap-2 font-medium">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                {importMessage}
                            </p>
                            {importErrors.length > 0 && (
                                <ul className="mt-3 max-h-48 list-disc space-y-1 overflow-y-auto pl-8">
                                    {importErrors.map((message, index) => (
                                        <li key={index}>{message}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
