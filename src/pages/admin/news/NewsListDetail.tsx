import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { News } from '../../../types/news';
import { newsService } from '../../../services/newsServices';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Image as ImageIcon,
    Newspaper,
    Edit2,
    Trash2,
    Loader2,
    AlertCircle,
    Eye
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function NewsDetail() {
    const toast = useToast();
    const { id } = useParams();
    const navigate = useNavigate();
    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const data = await newsService.getById(Number(id));
                setNews(data);
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('Gagal memuat detail berita');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [id]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await newsService.delete(Number(id));
            toast.success('Berita berhasil dihapus');
            navigate('/admin/news');
        } catch (err) {
            console.error('Error deleting news:', err);
            toast.error('Gagal menghapus berita', getApiErrorMessage(err, 'silakan coba lagi'));
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Layout title="Memuat Berita...">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-muted">Memuat detail berita...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !news) {
        return (
            <Layout title="Berita Tidak Ditemukan">
                <div className="flex flex-col items-center justify-center min-h-screen px-4">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-body mb-2">Berita Tidak Ditemukan</h1>
                    <p className="text-muted mb-6 text-center">
                        {error || 'Berita yang Anda cari tidak ditemukan atau telah dihapus.'}
                    </p>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm font-medium text-body bg-surface border border-line rounded-lg hover:bg-surface-muted transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 inline mr-2" />
                            Kembali
                        </button>
                        <Link
                            to="/admin/news"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Lihat Semua Berita
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title={news.title}>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <div className="flex items-center mb-2">
                            <button
                                onClick={() => navigate('/admin/news')}
                                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mr-4 transition-colors duration-200"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Kembali ke Daftar
                            </button>
                        </div>
                        <h1 className="text-2xl font-bold text-body">{news.title}</h1>
                        <div className="flex items-center mt-2 space-x-4">
                            <div className="text-sm text-muted">
                                <Newspaper className="w-4 h-4 inline mr-1" />
                                {news.slug}
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <Link
                            to={`/admin/news/${id}/edit`}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors duration-200"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Berita
                        </Link>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-200"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Content */}
                    <div className="lg:col-span-2">
                        {/* Thumbnail */}
                        {news.thumbnail_url && (
                            <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden mb-6">
                                <div className="p-4 border-b border-line bg-surface-muted">
                                    <h2 className="text-lg font-semibold text-body flex items-center">
                                        <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                                        Thumbnail Berita
                                    </h2>
                                </div>
                                <div className="p-4">
                                    <div className="aspect-video rounded-lg overflow-hidden bg-surface-muted">
                                        <img
                                            src={news.thumbnail_url}
                                            alt={news.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                            <div className="p-4 border-b border-line bg-surface-muted">
                                <h2 className="text-lg font-semibold text-body flex items-center">
                                    <Newspaper className="w-5 h-5 mr-2 text-blue-600" />
                                    Konten Berita
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="prose max-w-none">
                                    {news.content.split('\n').map((paragraph, index) => (
                                        <p key={index} className="text-body mb-4 leading-relaxed">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Photos */}
                        {news.photos && news.photos.length > 0 && (
                            <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden mt-6">
                                <div className="p-4 border-b border-line bg-surface-muted">
                                    <h2 className="text-lg font-semibold text-body flex items-center">
                                        <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                                        Foto Lainnya ({news.photos.length})
                                    </h2>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {news.photos.map((photo) => (
                                            <div key={photo.id} className="relative">
                                                <div className="aspect-square rounded-lg overflow-hidden bg-surface-muted">
                                                    <img
                                                        src={photo.photo_url}
                                                        alt={`Foto ${photo.id}`}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Metadata */}
                    <div className="space-y-6">
                        {/* News Info Card */}
                        <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                            <div className="p-4 border-b border-line bg-surface-muted">
                                <h2 className="text-lg font-semibold text-body flex items-center">
                                    <Newspaper className="w-5 h-5 mr-2 text-blue-600" />
                                    Informasi Berita
                                </h2>
                            </div>
                            <div className="p-4">
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-muted">Slug</dt>
                                        <dd className="mt-1 text-sm text-body bg-surface-muted p-2 rounded">
                                            {news.slug}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted">Total Foto</dt>
                                        <dd className="mt-1 text-sm font-medium text-body">
                                            {news.photos?.length || 0} foto
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Timeline Card */}
                        <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                            <div className="p-4 border-b border-line bg-surface-muted">
                                <h2 className="text-lg font-semibold text-body flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                    Timeline
                                </h2>
                            </div>
                            <div className="p-4">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center text-sm text-muted mb-1">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Dibuat Pada
                                        </div>
                                        <div className="text-sm font-medium text-body">
                                            {formatDate(news.created_at)}
                                        </div>
                                    </div>

                                    {news.updated_at && news.updated_at !== news.created_at && (
                                        <div>
                                            <div className="flex items-center text-sm text-muted mb-1">
                                                <Clock className="w-4 h-4 mr-2" />
                                                Terakhir Diperbarui
                                            </div>
                                            <div className="text-sm font-medium text-body">
                                                {formatDate(news.updated_at)}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-line">
                                        <div className="text-xs text-muted">
                                            ID Berita: <span className="font-mono text-body">{news.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                onConfirm={handleDelete}
                isLoading={deleting}
            >
                <div className="py-2">
                    <p className="text-body">
                        Apakah Anda yakin ingin menghapus berita "<strong>{news.title}</strong>"?
                    </p>
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">
                            ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data berita termasuk {news.photos?.length || 0} foto dan thumbnail akan dihapus permanen.
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
