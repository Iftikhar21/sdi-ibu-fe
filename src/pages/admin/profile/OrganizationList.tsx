import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Edit2, Loader2, Network, PlusCircle, Trash2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import TablePagination from '../../../components/common/TablePagination';
import { useTablePagination } from '../../../components/common/useTablePagination';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { organizationStructureService } from '../../../services/schoolProfileServices';
import type { OrganizationStructure } from '../../../types/schoolProfile';

export default function OrganizationList() {
    const toast = useToast();

    const [items, setItems] = useState<OrganizationStructure[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState<OrganizationStructure | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { pageItems, pagination } = useTablePagination(items);

    const fetchData = async () => {
        try {
            setItems(await organizationStructureService.getAll());
        } catch (error) {
            console.error('Error fetching organization structures:', error);
            toast.error(
                'Gagal memuat struktur organisasi',
                getApiErrorMessage(error, 'silakan coba lagi')
            );
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
            await organizationStructureService.delete(deleting.id);
            toast.success('Data struktur organisasi berhasil dihapus');
            setShowDeleteModal(false);
            setDeleting(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting organization structure:', error);
            toast.error('Gagal menghapus data', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Struktur Organisasi | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Struktur Organisasi">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                            <Network className="h-6 w-6 text-brand" />
                            Struktur Organisasi
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Susunan pengurus dan penanggung jawab sekolah yang tampil di halaman
                            Profil
                        </p>
                    </div>
                    <Link
                        to="/admin/struktur-organisasi/create"
                        className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Data
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
                            <Network className="mx-auto mb-4 h-12 w-12 text-muted" />
                            <h3 className="mb-2 text-lg font-medium text-body">
                                Belum ada data struktur organisasi
                            </h3>
                            <p className="mx-auto mb-6 max-w-md text-muted">
                                Tambahkan nama dan jabatan agar tampil di halaman Profil → Struktur
                                Organisasi.
                            </p>
                            <Link
                                to="/admin/struktur-organisasi/create"
                                className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Data Pertama
                            </Link>
                        </div>
                    ) : (
                        <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-line">
                                <thead className="bg-surface-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Foto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Nama
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Jabatan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Urutan
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
                                            <td className="px-6 py-4">
                                                <div className="h-14 w-12 overflow-hidden rounded-lg bg-surface-muted">
                                                    {item.photo_url ? (
                                                        <img
                                                            src={item.photo_url}
                                                            alt={item.name}
                                                            loading="lazy"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                                                            -
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-body">
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted">
                                                {item.position}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted">
                                                {item.sort_order}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.is_active ? (
                                                    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                                        Ditampilkan
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-medium text-muted">
                                                        Disembunyikan
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <Link
                                                        to={`/admin/struktur-organisasi/${item.id}/edit`}
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
                        Hapus data <span className="font-semibold">{deleting?.name}</span> (
                        {deleting?.position})?
                    </p>
                    <p className="mt-2 text-sm text-muted">
                        Data yang dihapus tidak dapat dikembalikan.
                    </p>
                </div>
            </Modal>
        </>
    );
}
