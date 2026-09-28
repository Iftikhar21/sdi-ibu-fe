import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, FileText, GraduationCap, Loader2, Printer, User } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import SearchableSelect from '../../../components/common/SearchableSelect';
import ReportCardDocument from '../../../components/academic/ReportCardDocument';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { reportCardService } from '../../../services/academicServices';
import type { ReportCardData } from '../../../types/academic';

const formatDate = (value?: string | null) => {
    if (!value) return '-';

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID');
};

export default function ReportCard() {
    const toast = useToast();

    const [data, setData] = useState<ReportCardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [yearId, setYearId] = useState<number | null>(null);
    const [classroomId, setClassroomId] = useState<number | null>(null);
    const [semester, setSemester] = useState<number>(1);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const load = useCallback(
        async (params: {
            academic_year_id?: number;
            classroom_id?: number;
            semester?: number;
            student_id?: number;
        }) => {
            setLoading(true);
            try {
                const result = await reportCardService.getData(params);

                setData(result);
                setYearId(result.academic_year?.id ?? null);
                setClassroomId(result.classroom?.id ?? null);
                setSemester(result.semester ?? 1);
                setStudentId(result.student?.id ?? null);
            } catch (error) {
                console.error('Error fetching report card:', error);
                toast.error('Gagal memuat rapor', getApiErrorMessage(error, 'silakan coba lagi'));
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
        const result = await reportCardService.getData({
            academic_year_id: value,
            semester,
        });
        const kelasPertama = result.classrooms[0];

        setData(result);
        setYearId(value);
        setClassroomId(kelasPertama?.id ?? null);
        setStudentId(null);

        if (kelasPertama) {
            await load({
                academic_year_id: value,
                classroom_id: kelasPertama.id,
                semester,
            });
        }
    };

    const handleClassroomChange = async (value: number) => {
        setClassroomId(value);
        setStudentId(null);

        if (yearId) {
            await load({ academic_year_id: yearId, classroom_id: value, semester });
        }
    };

    const handleSemesterChange = async (value: number) => {
        setSemester(value);
        setStudentId(null);

        if (yearId && classroomId) {
            await load({
                academic_year_id: yearId,
                classroom_id: classroomId,
                semester: value,
            });
        }
    };

    const handleStudentChange = async (value: number) => {
        setStudentId(value);

        if (yearId && classroomId) {
            await load({
                academic_year_id: yearId,
                classroom_id: classroomId,
                semester,
                student_id: value,
            });
        }
    };

    const students = data?.students ?? [];
    const subjects = data?.subjects ?? [];

    // Cetak memakai dialog print browser; area yang tercetak diatur di index.css
    const handlePrint = () => {
        if (!data?.student) {
            toast.warning('Pilih siswa terlebih dahulu');
            return;
        }

        window.print();
    };

    // Unduh PDF memakai html2pdf, sama seperti surat penerimaan di halaman pendaftaran
    const handleDownloadPdf = async () => {
        if (!data?.student) {
            toast.warning('Pilih siswa terlebih dahulu');
            return;
        }

        const element = document.getElementById('rapor-cetak');

        if (!element) return;

        setIsGeneratingPdf(true);
        try {
            element.setAttribute('data-export-all', 'true');
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            const html2pdf = (await import('html2pdf.js')).default;

            const namaFile = `Rapor_${data.student.full_name.replace(/\s+/g, '_')}_Semester_${data.semester}.pdf`;

            await html2pdf()
                .set({
                    margin: [0.5, 0.5, 0.5, 0.5],
                    filename: namaFile,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                })
                .from(element)
                .save();

            toast.success('Rapor berhasil diunduh sebagai PDF');
        } catch (error) {
            console.error('Error generating report card PDF:', error);
            toast.error('Gagal membuat PDF', 'Silakan gunakan tombol Cetak sebagai alternatif.');
        } finally {
            element.removeAttribute('data-export-all');
            setIsGeneratingPdf(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Rapor Siswa | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Rapor Siswa">
                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm print:hidden">
                    <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                        <FileText className="h-6 w-6 text-brand" />
                        Rapor Siswa
                    </h1>
                    <p className="text-sm text-muted sm:text-base">
                        Ringkasan nilai per mata pelajaran dan rekap absensi per semester. Data
                        diambil dari menu Input Nilai dan Absensi.
                    </p>
                </div>

                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm print:hidden">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">Siswa</label>
                            <SearchableSelect
                                options={students.map((student) => ({
                                    value: student.id,
                                    label: student.full_name,
                                    description:
                                        student.filled > 0
                                            ? `${student.filled} nilai • rata-rata ${student.average}`
                                            : 'Belum ada nilai',
                                }))}
                                value={studentId}
                                onChange={(value) => handleStudentChange(Number(value))}
                                placeholder="Pilih siswa"
                                searchPlaceholder="Cari nama siswa..."
                                emptyMessage="Belum ada siswa di kelas ini"
                                loading={loading}
                                ariaLabel="Siswa"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-line bg-surface py-16 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat rapor...</p>
                    </div>
                ) : !classroomId || !data?.classroom ? (
                    <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                        <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Pilih kelas untuk menampilkan rapor
                        </h3>
                        <p className="mx-auto max-w-lg text-muted">
                            Siswa diambil dari penempatan kelas pada tahun ajaran yang dipilih.
                        </p>
                    </div>
                ) : !data.student ? (
                    <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                        <User className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Pilih siswa untuk melihat rapornya
                        </h3>
                        <p className="mx-auto max-w-lg text-muted">
                            {students.length} siswa terdaftar di kelas{' '}
                            {data.classroom.display_name}.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Identitas siswa */}
                        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                <div>
                                    <p className="text-sm text-muted">Rapor Semester {data.semester}</p>
                                    <h2 className="text-xl font-bold text-body">
                                        {data.student.full_name}
                                    </h2>
                                    <p className="mt-1 text-sm text-muted">
                                        NIS {data.student.nis ?? '-'} • Kelas{' '}
                                        {data.student.classroom} •{' '}
                                        {data.academic_year?.name}
                                    </p>
                                    <p className="mt-1 text-xs text-muted">
                                        Periode {formatDate(data.period.from)} –{' '}
                                        {formatDate(data.period.to)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="rounded-xl border border-line bg-surface-muted px-6 py-4 text-center">
                                        <p className="text-xs uppercase tracking-wide text-muted">
                                            Rata-rata
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-body">
                                            {data.average ?? '-'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <button
                                            type="button"
                                            onClick={handlePrint}
                                            className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                                        >
                                            <Printer className="mr-2 h-4 w-4" />
                                            Cetak
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDownloadPdf}
                                            disabled={isGeneratingPdf}
                                            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isGeneratingPdf ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="mr-2 h-4 w-4" />
                                            )}
                                            {isGeneratingPdf ? 'Menyiapkan...' : 'Unduh PDF'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pratinjau dokumen rapor (dipakai juga untuk cetak & PDF) */}
                        <div>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-base font-semibold text-body">
                                    Pratinjau Rapor
                                </h3>
                                {subjects.length === 0 && (
                                    <p className="text-xs text-amber-700">
                                        Belum ada mata pelajaran aktif untuk tingkat{' '}
                                        {data.classroom.grade_level}.
                                    </p>
                                )}
                            </div>

                            <ReportCardDocument data={data} />
                        </div>
                    </div>
                )}
            </Layout>
        </>
    );
}
