import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { History } from '../../../types/history';
import {
    PlusCircle,
    Edit2,
    Trash2,
    Loader2,
    AlertCircle,
    AlertTriangle,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { historyService } from '../../../services/historyServices';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function SejarahList() {
    const toast = useToast();
    const [data, setData] = useState<History[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<History | null>(null);
    const fetchData = async () => {
        try {
            const res = await historyService.getAll();
            setData(res);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (item: History) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;

        setDeletingId(selectedItem.id);
        try {
            await historyService.delete(selectedItem.id);
            toast.success('Sejarah berhasil dihapus');
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Gagal menghapus sejarah', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setDeletingId(null);
            setSelectedItem(null);
            setShowDeleteModal(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const canAddNew = data.length === 0;

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kelola Sejarah">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Kelola Sejarah SDI Ibu
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            {canAddNew
                                ? 'Tambahkan sejarah organisasi Anda'
                                : 'Kelola konten sejarah organisasi Anda'}
                        </p>
                    </div>
                </div>

                <div className="mx-auto">
                    {/* Action Bar */}
                    <div className="flex justify-between items-center">
                        <div>
                            {canAddNew ? (
                                <Link
                                    to="/admin/sejarah/create"
                                    className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Tambah Sejarah Baru
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    {data.length > 0 && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 text-blue-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Catatan Penting</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Hanya dapat memiliki 1 sejarah aktif. Untuk menambahkan sejarah baru,
                                        hapus terlebih dahulu sejarah yang ada.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden mt-6">
                        {loading ? (
                            <div className="py-12 text-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                                <p className="text-muted">Memuat data sejarah...</p>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="py-12 text-center">
                                <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-body mb-2">
                                    Belum ada sejarah
                                </h3>
                                <p className="text-muted max-w-md mx-auto mb-6">
                                    Mulai dengan menambahkan sejarah organisasi Anda.
                                </p>
                                <Link
                                    to="/admin/sejarah/create"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Tambah Sejarah Pertama
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-line">
                                {data.map((item, index) => (
                                    <div key={item.id} className="p-6 hover:bg-surface-muted transition-colors duration-150">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="text-muted mb-4">
                                                    {item.content.split('\n').map((line, i) => (
                                                        <span key={i}>
                                                            {line}
                                                            <br />
                                                        </span>
                                                    ))}
                                                </p>
                                                <div className="flex items-center text-sm text-muted">
                                                    <span className="bg-surface-muted text-body text-xs px-2 py-1 rounded">
                                                        {item.content.length} karakter
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                <Link
                                                    to={`/admin/sejarah/${item.id}/edit`}
                                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                                                >
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClick(item)}
                                                    disabled={deletingId === item.id}
                                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                >
                                                    {deletingId === item.id ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                    )}
                                                    {deletingId === item.id ? 'Menghapus...' : 'Hapus'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

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
                        Apakah Anda yakin ingin menghapus sejarah ini?
                    </p>
                    <p className="text-sm text-muted mt-2">
                        Tindakan ini tidak dapat dibatalkan. Setelah dihapus, Anda dapat menambahkan sejarah baru.
                    </p>
                </div>
            </Modal>
        </>
    );
}
