import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    CalendarRange,
    CheckCircle2,
    Copy,
    Edit2,
    Loader2,
    PlusCircle,
    Trash2,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import TablePagination from '../../../components/common/TablePagination';
import { useTablePagination } from '../../../components/common/useTablePagination';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { academicYearService } from '../../../services/academicYearServices';
import type { AcademicYear } from '../../../types/academicYear';

const formatDate = (value: string) => {
    if (!value) return '-';

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID');
};

export default function AcademicYearList() {
    const toast = useToast();

    const [items, setItems] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState<AcademicYear | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copyTarget, setCopyTarget] = useState<AcademicYear | null>(null);
    const [copySourceId, setCopySourceId] = useState<number | null>(null);
    const [isCopying, setIsCopying] = useState(false);
    const { pageItems, pagination } = useTablePagination(items);

    const fetchData = async () => {
        try {
            setItems(await academicYearService.getAll());
        } catch (error) {
            console.error('Error fetching academic years:', error);
            toast.error('Gagal memuat tahun ajaran', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const confirmDelete = async () => {
        if (!deleting) return;

        setIsDeleting(true);
        try {
            await academicYearService.delete(deleting.id);
            toast.success('Tahun ajaran berhasil dihapus');
            fetchData();
            setShowDeleteModal(false);
            setDeleting(null);
        } catch (error) {
            console.error('Error deleting academic year:', error);
            toast.error('Gagal menghapus tahun ajaran', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsDeleting(false);
        }
    };

    const openCopyModal = (academicYear: AcademicYear) => {
        setCopyTarget(academicYear);

        // Default: tahun ajaran lain yang punya kelas paling banyak
        const kandidat = [...items]
            .filter((item) => item.id !== academicYear.id)
            .sort((a, b) => (b.classrooms_count ?? 0) - (a.classrooms_count ?? 0));

        setCopySourceId(kandidat[0]?.id ?? null);
    };

    const confirmCopy = async () => {
        if (!copyTarget || !copySourceId) {
            toast.warning('Tahun ajaran sumber wajib dipilih');
            return;
        }

        setIsCopying(true);
        try {
            const result = await academicYearService.copyClassrooms(copyTarget.id, copySourceId);

            toast.success('Copy struktur kelas selesai', result.message);
            setCopyTarget(null);
            setCopySourceId(null);
            fetchData();
        } catch (error) {
            console.error('Error copying classrooms:', error);
            toast.error(
                'Gagal copy struktur kelas',
                getApiErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsCopying(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Tahun Ajaran | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Tahun Ajaran">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                            <CalendarRange className="h-6 w-6 text-brand" />
                            Master Tahun Ajaran
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Hanya satu tahun ajaran yang dapat berstatus aktif
                        </p>
                    </div>
                    <Link
                        to="/admin/tahun-ajaran/create"
                        className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Tahun Ajaran
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                    {loading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-muted">Memuat data...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                            <CalendarRange className="mx-auto mb-4 h-12 w-12 text-muted" />
                            <h3 className="mb-2 text-lg font-medium text-body">
                                Belum ada tahun ajaran
                            </h3>
                            <p className="mx-auto mb-6 max-w-md text-muted">
                                Tambahkan tahun ajaran terlebih dahulu sebelum membuat kelas.
                            </p>
                            <Link
                                to="/admin/tahun-ajaran/create"
                                className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Tahun Ajaran Pertama
                            </Link>
                        </div>
                    ) : (
                        <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-line">
                                <thead className="bg-surface-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Tahun Ajaran
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Periode
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Jumlah Kelas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {pageItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-muted">
                                            <td className="px-6 py-4 text-sm font-semibold text-body">
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted">
                                                {formatDate(item.start_date)} — {formatDate(item.end_date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted">
                                                {item.classrooms_count ?? 0} kelas
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.is_active ? (
                                                    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-medium text-muted">
                                                        Tidak Aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        onClick={() => openCopyModal(item)}
                                                        title="Copy struktur kelas (kelas + kuota) dari tahun ajaran lain"
                                                        className="inline-flex items-center rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-surface"
                                                    >
                                                        <Copy className="mr-1.5 h-4 w-4" />
                                                        Copy Kelas
                                                    </button>
                                                    <Link
                                                        to={`/admin/tahun-ajaran/${item.id}/edit`}
                                                        className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
                                                    >
                                                        <Edit2 className="mr-1.5 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setDeleting(item);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                                    >
                                                        <Trash2 className="mr-1.5 h-4 w-4" />
                                                        Hapus
                                                    </button>
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
            </Layout>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus"
                type="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={confirmDelete}
                isLoading={isDeleting}
            >
                <div className="py-2">
                    <p className="text-body">
                        Hapus tahun ajaran &ldquo;{deleting?.name}&rdquo;?
                    </p>
                    {(deleting?.classrooms_count ?? 0) > 0 && (
                        <p className="mt-2 text-sm text-red-600">
                            Tahun ajaran ini masih dipakai oleh {deleting?.classrooms_count} kelas,
                            jadi kemungkinan besar tidak bisa dihapus.
                        </p>
                    )}
                </div>
            </Modal>

            {/* Modal copy struktur kelas */}
            <Modal
                isOpen={Boolean(copyTarget)}
                onClose={() => {
                    setCopyTarget(null);
                    setCopySourceId(null);
                }}
                title="Copy Struktur Kelas"
                type="default"
                confirmText="Copy Sekarang"
                cancelText="Batal"
                onConfirm={confirmCopy}
                isLoading={isCopying}
            >
                <div className="space-y-4 py-2">
                    <div className="rounded-lg bg-surface-muted p-4">
                        <p className="text-sm text-muted">Tahun ajaran tujuan</p>
                        <p className="font-medium text-body">{copyTarget?.name}</p>
                        <p className="mt-2 text-sm text-muted">
                            Saat ini punya {copyTarget?.classrooms_count ?? 0} kelas.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            Copy dari tahun ajaran <span className="text-red-500">*</span>
                        </label>
                        <SearchableSelect
                            options={items
                                .filter((item) => item.id !== copyTarget?.id)
                                .map((item) => ({
                                    value: item.id,
                                    label: item.name,
                                    description: `${item.classrooms_count ?? 0} kelas`,
                                }))}
                            value={copySourceId}
                            onChange={(value) => setCopySourceId(Number(value))}
                            placeholder="Pilih tahun ajaran sumber"
                            searchPlaceholder="Cari tahun ajaran..."
                            emptyMessage="Belum ada tahun ajaran lain"
                            ariaLabel="Tahun ajaran sumber"
                        />
                    </div>

                    <div className="rounded-lg border border-line bg-surface-muted p-4 text-sm text-muted">
                        <p className="mb-1 font-medium text-body">Yang disalin</p>
                        <p>
                            Daftar kelas beserta tingkat, nama kelas, kuota, dan status aktifnya.
                        </p>
                        <p className="mt-2">
                            Siswa, pendaftaran, penempatan kelas, riwayat, dan data kelulusan{' '}
                            <span className="font-medium text-body">tidak ikut disalin</span>. Kelas
                            yang sudah ada di tahun ajaran tujuan dilewati, jadi tombol ini aman
                            ditekan berulang.
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
