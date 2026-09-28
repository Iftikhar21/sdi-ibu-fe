import type { ReportCardData } from '../../types/academic';
import TablePagination from '../common/TablePagination';
import { useTablePagination } from '../common/useTablePagination';

interface Props {
    data: ReportCardData;
}

const formatDate = (value?: string | null) => {
    if (!value) return '-';

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID');
};

/**
 * Dokumen rapor siap cetak.
 *
 * Dipakai untuk preview, tombol Cetak (window.print), dan Unduh PDF
 * (html2pdf). Semua datanya berasal dari endpoint Rapor yang sudah ada,
 * tidak ada perhitungan tambahan di sini.
 */
export default function ReportCardDocument({ data }: Props) {
    const student = data.student;
    const { pagination } = useTablePagination(data.subjects);

    if (!student) return null;

    const semesterLabel = data.semesters?.[String(data.semester)] ?? '';

    return (
        <div
            id="rapor-cetak"
            className="force-light mx-auto w-full max-w-3xl rounded-xl border border-line bg-surface p-8 text-body shadow-sm"
        >
            {/* Kop dokumen */}
            <div className="border-b-4 border-double border-line pb-4 text-center">
                <h1 className="text-lg font-bold uppercase tracking-wide">
                    SDI Ikhlas Bakti Umat
                </h1>
                <p className="text-sm text-muted">Rapor Peserta Didik</p>
                <p className="mt-1 text-sm">
                    Tahun Ajaran {data.academic_year?.name ?? '-'} — Semester {data.semester}{' '}
                    {semesterLabel ? `(${semesterLabel})` : ''}
                </p>
            </div>

            {/* Identitas siswa */}
            <table className="mt-6 w-full text-sm">
                <tbody>
                    <tr>
                        <td className="w-40 py-1 text-muted">Nama Peserta Didik</td>
                        <td className="py-1 font-semibold">: {student.full_name}</td>
                    </tr>
                    <tr>
                        <td className="py-1 text-muted">Nomor Induk Siswa (NIS)</td>
                        <td className="py-1">: {student.nis ?? '-'}</td>
                    </tr>
                    <tr>
                        <td className="py-1 text-muted">Kelas</td>
                        <td className="py-1">: {student.classroom}</td>
                    </tr>
                    <tr>
                        <td className="py-1 text-muted">Periode</td>
                        <td className="py-1">
                            : {formatDate(data.period.from)} — {formatDate(data.period.to)}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Nilai mata pelajaran */}
            <h2 className="mt-8 mb-2 text-sm font-bold uppercase">A. Nilai Mata Pelajaran</h2>
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-surface-muted">
                        <th className="w-10 border border-line px-3 py-2 text-left">No</th>
                        <th className="w-20 border border-line px-3 py-2 text-left">Kode</th>
                        <th className="border border-line px-3 py-2 text-left">Mata Pelajaran</th>
                        <th className="w-20 border border-line px-3 py-2 text-right">Nilai</th>
                    </tr>
                </thead>
                <tbody>
                    {data.subjects.map((subject, index) => (
                        <tr
                            key={subject.subject_id}
                            className={
                                index < (pagination.page - 1) * pagination.pageSize ||
                                index >= pagination.page * pagination.pageSize
                                    ? 'report-preview-hidden'
                                    : undefined
                            }
                        >
                            <td className="border border-line px-3 py-1.5">{index + 1}</td>
                            <td className="border border-line px-3 py-1.5">{subject.code}</td>
                            <td className="border border-line px-3 py-1.5">{subject.name}</td>
                            <td className="border border-line px-3 py-1.5 text-right">
                                {subject.score ?? '-'}
                            </td>
                        </tr>
                    ))}
                    <tr className="bg-surface-muted font-semibold">
                        <td className="border border-line px-3 py-1.5" colSpan={3}>
                            Rata-rata
                        </td>
                        <td className="border border-line px-3 py-1.5 text-right">
                            {data.average ?? '-'}
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="report-pagination print:hidden">
                <TablePagination {...pagination} />
            </div>

            {/* Rekap kehadiran */}
            <h2 className="mt-8 mb-2 text-sm font-bold uppercase">B. Rekap Kehadiran</h2>
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-surface-muted">
                        <th className="border border-line px-3 py-2 text-left">Hadir</th>
                        <th className="border border-line px-3 py-2 text-left">Izin</th>
                        <th className="border border-line px-3 py-2 text-left">Sakit</th>
                        <th className="border border-line px-3 py-2 text-left">Alpa</th>
                        <th className="border border-line px-3 py-2 text-left">
                            Hari Tercatat
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-line px-3 py-1.5">
                            {data.attendance?.hadir ?? 0}
                        </td>
                        <td className="border border-line px-3 py-1.5">
                            {data.attendance?.izin ?? 0}
                        </td>
                        <td className="border border-line px-3 py-1.5">
                            {data.attendance?.sakit ?? 0}
                        </td>
                        <td className="border border-line px-3 py-1.5">
                            {data.attendance?.alpa ?? 0}
                        </td>
                        <td className="border border-line px-3 py-1.5">
                            {data.attendance?.total ?? 0}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Tanda tangan */}
            <div className="mt-10 flex justify-between text-sm">
                <div className="text-center">
                    <p>Mengetahui,</p>
                    <p>Kepala Sekolah</p>
                    <div className="h-16" />
                    <p className="border-t border-line px-6 pt-1">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</p>
                </div>
                <div className="text-center">
                    <p>{formatDate(data.period.to)}</p>
                    <p>Wali Kelas</p>
                    <div className="h-16" />
                    <p className="border-t border-line px-6 pt-1">
                        (
                        {data.homeroom_teacher ??
                            '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0'}
                        )
                    </p>
                </div>
            </div>
        </div>
    );
}
