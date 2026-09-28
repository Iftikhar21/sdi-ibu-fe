import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Award,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    GraduationCap,
    Loader2,
    RotateCcw,
    Search,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { graduationService } from '../../../services/graduationServices';
import type { Graduate, GraduateListResult } from '../../../types/graduation';

const itemsPerPage = 10;

const formatDate = (value?: string | null) => {
    if (!value) return '-';

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID');
};

export default function GraduateList() {
    const toast = useToast();

    const [data, setData] = useState<GraduateListResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [cancelling, setCancelling] = useState<Graduate | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);

            const result = await graduationService.getGraduates({
                academic_year_id: yearFilter,
                search: search.trim() || undefined,
            });

            setData(result);
        } catch (error) {
            console.error('Error fetching graduates:', error);
            toast.error('Gagal memuat daftar lulusan', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [yearFilter, search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [yearFilter, search]);

    const graduates = useMemo(() => data?.graduates ?? [], [data]);
    const totalPages = Math.max(1, Math.ceil(graduates.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = graduates.slice(startIndex, startIndex + itemsPerPage);

    const confirmCancel = async () => {
        if (!cancelling?.student_id) return;

        setIsCancelling(true);
        try {
            const result = await graduationService.cancel(cancelling.student_id);

            toast.success('Kelulusan dibatalkan', result.message);
            setCancelling(null);
            fetchData();
        } catch (error) {
            console.error('Error cancelling graduation:', error);
            toast.error(
                'Gagal membatalkan kelulusan',
                getApiErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Lulusan | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Lulusan">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                            <Award className="h-6 w-6 text-brand" />
                            Daftar Lulusan
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Siswa yang sudah dinyatakan lulus, dikelompokkan per tahun kelulusan
                        </p>
                    </div>
                    <Link
                        to="/admin/kelulusan"
                        className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                    >
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Proses Kelulusan
                    </Link>
                </div>

                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                <Search className="mr-2 inline h-4 w-4" />
                                Cari Lulusan
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari nama atau NIS"
                                className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Tahun Kelulusan
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'Semua Tahun Kelulusan' },
                                    ...(data?.academic_years ?? []).map((year) => ({
                                        value: year.id,
                                        label: year.name,
                                    })),
                                ]}
                                value={yearFilter}
                                onChange={(value) =>
                                    setYearFilter(value === 'all' ? 'all' : Number(value))
                                }
                                searchPlaceholder="Cari tahun kelulusan..."
                                ariaLabel="Filter tahun kelulusan"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                    {loading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-muted">Memuat data...</p>
                        </div>
                    ) : graduates.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                            <Award className="mx-auto mb-4 h-12 w-12 text-muted" />
                            <h3 className="mb-2 text-lg font-medium text-body">Belum ada lulusan</h3>
                            <p className="mx-auto mb-6 max-w-md text-muted">
                                Data lulusan terbentuk dari proses kelulusan siswa kelas 6.
                            </p>
                            <Link
                                to="/admin/kelulusan"
                                className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
                            >
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Proses Kelulusan
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-line">
                                    <thead className="bg-surface-muted">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Nama
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                NIS
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Kelas Terakhir
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Tahun Lulus
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Tanggal Lulus
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {paginated.map((item) => (
                                            <tr key={item.id} className="hover:bg-surface-muted">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-body">
                                                        {item.full_name}
                                                    </p>
                                                    {item.admission_year && (
                                                        <p className="text-xs text-muted">
                                                            Masuk {item.admission_year}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-body">
                                                    {item.nis ?? (
                                                        <span className="text-xs text-muted">
                                                            Belum diisi
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.last_class ? (
                                                        <span className="inline-flex items-center rounded-full bg-brand/20 px-3 py-1 text-xs font-semibold text-brand">
                                                            {item.last_class}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted">
                                                    {item.graduation_year ?? '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted">
                                                    {formatDate(item.graduation_date)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <Link
                                                            to={`/admin/siswa/${item.student_id}`}
                                                            className="inline-flex items-center rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-surface"
                                                        >
                                                            Detail
                                                        </Link>
                                                        <button
                                                            onClick={() => setCancelling(item)}
                                                            title="Batalkan kelulusan"
                                                            className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                                        >
                                                            <RotateCcw className="mr-1.5 h-4 w-4" />
                                                            Batalkan
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="border-t border-line px-6 py-4">
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                    <div className="text-sm text-muted">
                                        Menampilkan{' '}
                                        <span className="font-medium">{startIndex + 1}</span> sampai{' '}
                                        <span className="font-medium">
                                            {Math.min(startIndex + itemsPerPage, graduates.length)}
                                        </span>{' '}
                                        dari <span className="font-medium">{graduates.length}</span>{' '}
                                        lulusan
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="rounded border border-line p-1 text-body disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Halaman pertama"
                                        >
                                            <ChevronsLeft className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage((page) => page - 1)}
                                            disabled={currentPage === 1}
                                            className="rounded border border-line p-1 text-body disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Halaman sebelumnya"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <span className="px-2 text-sm text-muted">
                                            {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage((page) => page + 1)}
                                            disabled={currentPage === totalPages}
                                            className="rounded border border-line p-1 text-body disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Halaman berikutnya"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="rounded border border-line p-1 text-body disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Halaman terakhir"
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Layout>

            <Modal
                isOpen={Boolean(cancelling)}
                onClose={() => setCancelling(null)}
                title="Konfirmasi Batalkan Kelulusan"
                type="danger"
                confirmText="Ya, Batalkan"
                cancelText="Tidak"
                onConfirm={confirmCancel}
                isLoading={isCancelling}
            >
                <div className="py-2">
                    <p className="text-body">
                        Batalkan kelulusan{' '}
                        <span className="font-semibold">{cancelling?.full_name}</span> (
                        {cancelling?.graduation_year})?
                    </p>
                    <p className="mt-2 text-sm text-muted">
                        Status siswa kembali menjadi Aktif dan namanya hilang dari halaman Profil →
                        Lulusan. Data siswa, riwayat kelas, dan pendaftarannya tetap tersimpan.
                    </p>
                </div>
            </Modal>
        </>
    );
}
