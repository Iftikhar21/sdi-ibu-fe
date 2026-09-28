import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { faqService } from '../../../services/faqServices';
import {
    PlusCircle,
    Edit2,
    Trash2,
    Loader2,
    HelpCircle,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import TablePagination from '../../../components/common/TablePagination';
import { useTablePagination } from '../../../components/common/useTablePagination';
import type { Faq } from '../../../types/faq';
import { Helmet } from 'react-helmet-async';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../context/toast';

export default function FaqList() {
    const toast = useToast();
    const [data, setData] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Faq | null>(null);
    const { pageItems, pagination } = useTablePagination(data);

    const fetchData = async () => {
        try {
            const res = await faqService.getAll();
            setData(res);
        } catch (error) {
            console.error('Error fetching FAQ:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteClick = (item: Faq) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;

        setDeletingId(selectedItem.id);
        try {
            await faqService.delete(selectedItem.id);
            toast.success('FAQ berhasil dihapus');
            fetchData();
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            toast.error('Gagal menghapus FAQ', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setDeletingId(null);
            setSelectedItem(null);
            setShowDeleteModal(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Kelola FAQ | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kelola FAQ">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6 gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Kelola FAQ Beranda
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Pertanyaan yang sering ditanyakan beserta jawabannya, ditampilkan di halaman beranda.
                        </p>
                    </div>
                    <Link
                        to="/admin/faq/create"
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Tambah FAQ
                    </Link>
                </div>

                {/* Content */}
                <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                    {loading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-muted">Memuat data FAQ...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="py-12 text-center px-4">
                            <HelpCircle className="w-12 h-12 text-muted mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-body mb-2">
                                Belum ada FAQ
                            </h3>
                            <p className="text-muted max-w-md mx-auto mb-6">
                                Tambahkan pertanyaan yang sering ditanyakan agar calon orang tua murid
                                lebih mudah mendapatkan informasi.
                            </p>
                            <Link
                                to="/admin/faq/create"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Tambah FAQ Pertama
                            </Link>
                        </div>
                    ) : (
                        <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-line">
                                <thead className="bg-surface-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                            Urutan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                            Pertanyaan & Jawaban
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-line">
                                    {pageItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-muted transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                                                {item.sort_order}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-body mb-1">
                                                    {item.question}
                                                </p>
                                                <p className="text-sm text-muted line-clamp-2">
                                                    {item.answer}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.is_active ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                        Ditampilkan
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-surface-muted text-muted border border-line">
                                                        Disembunyikan
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <Link
                                                        to={`/admin/faq/${item.id}/edit`}
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors duration-200"
                                                    >
                                                        <Edit2 className="w-4 h-4 mr-1.5" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteClick(item)}
                                                        disabled={deletingId === item.id}
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                    >
                                                        {deletingId === item.id ? (
                                                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4 mr-1.5" />
                                                        )}
                                                        {deletingId === item.id ? 'Menghapus...' : 'Hapus'}
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

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus"
                type="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={confirmDelete}
                isLoading={deletingId !== null}
            >
                <div className="py-2">
                    <p className="text-body">
                        Apakah Anda yakin ingin menghapus FAQ berikut?
                    </p>
                    {selectedItem && (
                        <p className="text-sm font-medium text-body mt-2">
                            &ldquo;{selectedItem.question}&rdquo;
                        </p>
                    )}
                    <p className="text-sm text-muted mt-2">
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                </div>
            </Modal>
        </>
    );
}
