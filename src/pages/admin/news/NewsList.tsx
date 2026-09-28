import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { News } from '../../../types/news';
import { newsService } from '../../../services/newsServices';
import {
    PlusCircle,
    Edit2,
    Trash2,
    Loader2,
    AlertCircle,
    Eye,
    Image as ImageIcon,
    Calendar,
    Search,
    ChevronLeft,
    ChevronRight,
    Newspaper
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function NewsList() {
    const toast = useToast();
    const [data, setData] = useState<News[]>([]);
    const [filteredData, setFilteredData] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<News | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const fetchData = async () => {
        try {
            const res = await newsService.getAll();
            setData(res);
            setFilteredData(res);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter data berdasarkan search
    useEffect(() => {
        let result = data;

        if (searchTerm) {
            result = result.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.slug.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredData(result);
        setCurrentPage(1);
    }, [searchTerm, data]);

    const handleDeleteClick = (item: News) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;

        setDeletingId(selectedItem.id);
        try {
            await newsService.delete(selectedItem.id);
            toast.success('Berita berhasil dihapus');
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Gagal menghapus berita', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setDeletingId(null);
            setSelectedItem(null);
            setShowDeleteModal(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kelola Berita">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Kelola Berita SDI Ibu
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Kelola berita dan artikel organisasi Anda
                        </p>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="font-medium text-2xl sm:text-3xl text-blue-600">{data.length}</p>
                        <p className="text-xs sm:text-sm text-body">Total Berita</p>
                    </div>
                </div>

                <div className="mx-auto">
                    {/* Search and Filter Bar */}
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Cari berita..."
                                        className="w-full pl-10 pr-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Add Button */}
                            <div>
                                <Link
                                    to="/admin/news/create"
                                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Buat Berita Baru
                                </Link>
                            </div>
                        </div>

                        {/* Stats Summary */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
                            <div className="text-sm text-muted">
                                Menampilkan <span className="font-semibold">{currentItems.length}</span> dari{' '}
                                <span className="font-semibold">{filteredData.length}</span> berita
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                        {loading ? (
                            <div className="py-12 text-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                                <p className="text-muted">Memuat data berita...</p>
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="py-12 text-center">
                                <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-body mb-2">
                                    {searchTerm ? 'Berita tidak ditemukan' : 'Belum ada Berita'}
                                </h3>
                                <p className="text-muted max-w-md mx-auto mb-6">
                                    {searchTerm
                                        ? 'Coba ubah kata kunci pencarian'
                                        : 'Mulai dengan menambahkan berita organisasi Anda.'}
                                </p>
                                {!searchTerm && (
                                    <Link
                                        to="/admin/news/create"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Buat Berita Pertama
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-surface-muted">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                    Berita
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                    Foto
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                    Tanggal Dibuat
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                    Views
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-surface divide-y divide-line">
                                            {currentItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-surface-muted transition-colors duration-150">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-12 w-16">
                                                                {item.thumbnail_url ? (
                                                                    <img
                                                                        className="h-12 w-16 rounded object-cover"
                                                                        src={item.thumbnail_url}
                                                                        alt={item.title}
                                                                    />
                                                                ) : (
                                                                    <div className="h-12 w-16 rounded bg-line flex items-center justify-center">
                                                                        <ImageIcon className="w-6 h-6 text-muted" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-body">
                                                                    {item.title}
                                                                </div>
                                                                <div className="text-xs text-muted mt-1">
                                                                    {item.slug}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <ImageIcon className="w-4 h-4 text-muted mr-2" />
                                                            <span className="text-sm text-body">
                                                                {item.photos?.length || 0} foto
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-muted">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-2 text-muted" />
                                                            {formatDate(item.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <Eye className="w-4 h-4 text-muted mr-2" />
                                                            <span className="text-sm text-body">
                                                                {item.views || 0} views
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <Link
                                                                to={`/admin/news/${item.id}`}
                                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                Lihat
                                                            </Link>
                                                            <Link
                                                                to={`/admin/news/${item.id}/edit`}
                                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                                                            >
                                                                <Edit2 className="w-4 h-4 mr-1" />
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDeleteClick(item)}
                                                                disabled={deletingId === item.id}
                                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                            >
                                                                {deletingId === item.id ? (
                                                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                                )}
                                                                {deletingId === item.id ? '...' : 'Hapus'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-line">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-body">
                                                Halaman <span className="font-medium">{currentPage}</span> dari{' '}
                                                <span className="font-medium">{totalPages}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => paginate(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="inline-flex items-center px-3 py-1.5 border border-line rounded-lg text-sm font-medium text-body bg-surface hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                >
                                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                                    Sebelumnya
                                                </button>

                                                <div className="flex items-center space-x-1">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                        if (
                                                            page === 1 ||
                                                            page === totalPages ||
                                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                                        ) {
                                                            return (
                                                                <button
                                                                    key={page}
                                                                    onClick={() => paginate(page)}
                                                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${currentPage === page
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'text-body hover:bg-surface-muted'
                                                                        }`}
                                                                >
                                                                    {page}
                                                                </button>
                                                            );
                                                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                                                            return <span key={page} className="px-2 text-muted">...</span>;
                                                        }
                                                        return null;
                                                    })}
                                                </div>

                                                <button
                                                    onClick={() => paginate(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="inline-flex items-center px-3 py-1.5 border border-line rounded-lg text-sm font-medium text-body bg-surface hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                >
                                                    Selanjutnya
                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
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
                confirmText="Ya, Hapus Berita"
                cancelText="Batal"
                onConfirm={confirmDelete}
                isLoading={deletingId !== null}
            >
                <div className="py-2">
                    <p className="text-body">
                        Apakah Anda yakin ingin menghapus berita "<strong>{selectedItem?.title}</strong>"?
                    </p>
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">
                            ⚠️ Semua data berita termasuk {selectedItem?.photos?.length || 0} foto dan thumbnail akan dihapus permanen.
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
