import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Award,
    CheckCircle2,
    GraduationCap,
    Loader2,
    Users,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import DateInput from '../../../components/common/DateInput';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { graduationService } from '../../../services/graduationServices';
import type { GraduationCandidatesResult } from '../../../types/graduation';

export default function GraduationList() {
    const toast = useToast();

    const [data, setData] = useState<GraduationCandidatesResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [yearFilter, setYearFilter] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [graduationDate, setGraduationDate] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchData = async (academicYearId?: number) => {
        try {
            setLoading(true);

            const result = await graduationService.getCandidates(academicYearId);

            setData(result);
            setYearFilter(result.academic_year?.id ?? null);
            setSelectedIds([]);
        } catch (error) {
            console.error('Error fetching graduation candidates:', error);
            toast.error('Gagal memuat calon lulusan', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const groups = useMemo(() => data?.groups ?? [], [data]);
    const allIds = useMemo(
        () => groups.flatMap((group) => group.students.map((student) => student.id)),
        [groups]
    );

    const toggleStudent = (studentId: number) => {
        setSelectedIds((current) =>
            current.includes(studentId)
                ? current.filter((id) => id !== studentId)
                : [...current, studentId]
        );
    };

    const toggleGroup = (studentIds: number[]) => {
        setSelectedIds((current) => {
            const semuaTerpilih = studentIds.every((id) => current.includes(id));

            return semuaTerpilih
                ? current.filter((id) => !studentIds.includes(id))
                : [...new Set([...current, ...studentIds])];
        });
    };

    const handleProcess = async () => {
        if (selectedIds.length === 0 || !data?.academic_year) return;

        setIsProcessing(true);
        try {
            const result = await graduationService.graduate(
                selectedIds,
                data.academic_year.id,
                graduationDate
            );

            toast.success('Kelulusan berhasil diproses', result.message);
            setShowConfirm(false);
            setGraduationDate('');
            fetchData(data.academic_year.id);
        } catch (error) {
            console.error('Error processing graduation:', error);

            const errors = (
                error as { response?: { data?: { errors?: unknown } } }
            )?.response?.data?.errors;

            toast.error(
                'Gagal memproses kelulusan',
                Array.isArray(errors) && errors.length > 0
                    ? (errors as string[]).join(' ')
                    : getApiErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Kelulusan | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kelulusan">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                            <GraduationCap className="h-6 w-6 text-brand" />
                            Kelulusan Siswa
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Tetapkan siswa kelas 6 sebagai lulusan. Data siswa tetap tersimpan dan
                            otomatis muncul di halaman Profil → Lulusan.
                        </p>
                    </div>
                    <Link
                        to="/admin/lulusan"
                        className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                    >
                        <Award className="mr-2 h-4 w-4" />
                        Lihat Daftar Lulusan
                    </Link>
                </div>

                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <label className="mb-2 block text-sm font-medium text-body">
                        Tahun Ajaran
                    </label>
                    <SearchableSelect
                        options={(data?.academic_years ?? []).map((year) => ({
                            value: year.id,
                            label: year.name,
                            description: year.is_active ? 'Aktif' : undefined,
                        }))}
                        value={yearFilter}
                        onChange={(value) => fetchData(Number(value))}
                        placeholder="Pilih tahun ajaran"
                        searchPlaceholder="Cari tahun ajaran..."
                        emptyMessage="Belum ada Master Tahun Ajaran"
                        loading={loading}
                        ariaLabel="Tahun ajaran kelulusan"
                    />
                </div>

                <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                    {loading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-muted">Memuat data...</p>
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-muted" />
                            <h3 className="mb-2 text-lg font-medium text-body">
                                Tidak ada siswa kelas 6 yang perlu diproses
                            </h3>
                            <p className="mx-auto max-w-lg text-muted">
                                Siswa muncul di sini bila berstatus aktif, tercatat di tingkat 6 pada
                                tahun ajaran yang dipilih, dan belum pernah dinyatakan lulus.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col justify-between gap-4 border-b border-line px-6 py-4 md:flex-row md:items-center">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center rounded-full bg-brand/20 px-3 py-1 text-sm font-semibold text-brand">
                                        {data?.academic_year?.name}
                                    </span>
                                    <span className="text-sm text-muted">
                                        {data?.total ?? 0} siswa kelas 6 siap diproses
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedIds(
                                                selectedIds.length === allIds.length ? [] : allIds
                                            )
                                        }
                                        className="text-sm font-medium text-brand hover:text-brand-strong"
                                    >
                                        {selectedIds.length === allIds.length
                                            ? 'Kosongkan pilihan'
                                            : 'Pilih semua'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(true)}
                                        disabled={selectedIds.length === 0}
                                        className="inline-flex items-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        Proses Kelulusan
                                        {selectedIds.length > 0 && ` (${selectedIds.length})`}
                                    </button>
                                </div>
                            </div>

                            <div className="divide-y divide-line">
                                {groups.map((group) => {
                                    const groupIds = group.students.map((student) => student.id);
                                    const semuaTerpilih = groupIds.every((id) =>
                                        selectedIds.includes(id)
                                    );

                                    return (
                                        <div key={group.classroom_id ?? group.classroom_label}>
                                            <div className="flex items-center justify-between gap-3 bg-surface-muted px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Users className="h-4 w-4 text-muted" />
                                                    <span className="font-semibold text-body">
                                                        Kelas {group.classroom_label}
                                                    </span>
                                                    <span className="text-sm text-muted">
                                                        {group.students.length} siswa
                                                    </span>
                                                </div>
                                                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted">
                                                    <input
                                                        type="checkbox"
                                                        checked={semuaTerpilih}
                                                        onChange={() => toggleGroup(groupIds)}
                                                        className="h-4 w-4 rounded border-line text-brand focus:ring-blue-500"
                                                    />
                                                    Pilih kelas ini
                                                </label>
                                            </div>

                                            <ul className="divide-y divide-line">
                                                {group.students.map((student) => (
                                                    <li
                                                        key={student.id}
                                                        className="flex items-center justify-between gap-3 px-6 py-3 transition-colors hover:bg-surface-muted"
                                                    >
                                                        <label className="flex flex-1 cursor-pointer items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.includes(
                                                                    student.id
                                                                )}
                                                                onChange={() =>
                                                                    toggleStudent(student.id)
                                                                }
                                                                className="h-4 w-4 rounded border-line text-brand focus:ring-blue-500"
                                                            />
                                                            <span>
                                                                <span className="block text-sm font-medium text-body">
                                                                    {student.full_name}
                                                                </span>
                                                                <span className="block text-xs text-muted">
                                                                    NIS:{' '}
                                                                    {student.nis ?? 'Belum diisi'}
                                                                </span>
                                                            </span>
                                                        </label>
                                                        <Link
                                                            to={`/admin/siswa/${student.id}`}
                                                            className="text-xs font-medium text-brand hover:underline"
                                                        >
                                                            Detail
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </Layout>

            <Modal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                title="Konfirmasi Kelulusan"
                type="warning"
                confirmText="Ya, Tetapkan Lulus"
                cancelText="Batal"
                onConfirm={handleProcess}
                isLoading={isProcessing}
            >
                <div className="space-y-4 py-2">
                    <p className="text-body">
                        Apakah Anda yakin ingin menetapkan{' '}
                        <span className="font-semibold">{selectedIds.length} siswa</span> yang dipilih
                        sebagai lulusan {data?.academic_year?.name}?
                    </p>
                    <p className="text-sm text-muted">
                        Status siswa berubah menjadi Lulus dan datanya langsung tampil di halaman
                        Profil → Lulusan pada website. Data siswa, riwayat kelas, dan pendaftarannya
                        tetap tersimpan.
                    </p>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            Tanggal kelulusan (opsional)
                        </label>
                        <DateInput
                            value={graduationDate}
                            onChange={setGraduationDate}
                            placeholder="Pilih tanggal kelulusan"
                            ariaLabel="Tanggal kelulusan"
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}
