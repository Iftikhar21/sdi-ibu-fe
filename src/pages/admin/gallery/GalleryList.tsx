import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { galleryService } from '../../../services/galleryServices';
import {
    PlusCircle,
    Edit2,
    Trash2,
    Loader2,
    Images,
    HelpCircle,
    ImageOff,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { galleryCategoryService } from '../../../services/galleryCategoryServices';
import type { Gallery, GalleryCategory } from '../../../types/gallery';

export default function GalleryList() {
    const toast = useToast();
    const [data, setData] = useState<Gallery[]>([]);
    const [categories, setCategories] = useState<GalleryCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Gallery | null>(null);

    const fetchData = async () => {
        try {
            const [albums, categoryList] = await Promise.all([
                galleryService.getAll(),
                galleryCategoryService.getAll(),
            ]);

            setData(albums);
            setCategories(categoryList);
        } catch (error) {
            console.error('Error fetching gallery:', error);
            toast.error('Gagal memuat data galeri', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredData = useMemo(
        () =>
            categoryFilter === 'all'
                ? data
                : data.filter((item) => item.gallery_category_id === categoryFilter),
        [data, categoryFilter]
    );

    const handleDeleteClick = (item: Gallery) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;

        setDeletingId(selectedItem.id);
        try {
            await galleryService.delete(selectedItem.id);
            toast.success('Album galeri berhasil dihapus');
            fetchData();
        } catch (error) {
            console.error('Error deleting gallery:', error);
            toast.error('Gagal menghapus galeri', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setDeletingId(null);
            setSelectedItem(null);
            setShowDeleteModal(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Kelola Galeri | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kelola Galeri">
                {/* Header */}
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Kelola Galeri Beranda
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Album foto kegiatan yang tampil di halaman beranda
                        </p>
                    </div>
                    <Link
                        to="/admin/gallery/create"
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Galeri
                    </Link>
                </div>

                {/* Filter kategori */}
                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setCategoryFilter('all')}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                            categoryFilter === 'all'
                                ? 'border-brand bg-brand text-white'
                                : 'border-line bg-surface text-muted hover:bg-surface-muted'
                        }`}
                    >
                        Semua ({data.length})
                    </button>
                    {categories.map((category) => {
                        const total = data.filter(
                            (item) => item.gallery_category_id === category.id
                        ).length;

                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setCategoryFilter(category.id)}
                                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                                    categoryFilter === category.id
                                        ? 'border-brand bg-brand text-white'
                                        : 'border-line bg-surface text-muted hover:bg-surface-muted'
                                }`}
                            >
                                {category.name} ({total})
                            </button>
                        );
                    })}
                </div>

                {/* Konten */}
                {loading ? (
                    <div className="rounded-xl border border-line bg-surface py-12 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat data galeri...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="rounded-xl border border-line bg-surface px-4 py-12 text-center shadow-sm">
                        <HelpCircle className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">Belum ada galeri</h3>
                        <p className="mx-auto mb-6 max-w-md text-muted">
                            {data.length === 0
                                ? 'Tambahkan album foto kegiatan agar tampil di halaman beranda.'
                                : 'Belum ada album pada kategori ini.'}
                        </p>
                        <Link
                            to="/admin/gallery/create"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Galeri Pertama
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredData.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md"
                            >
                                <div className="relative aspect-video bg-surface-muted">
                                    {item.cover_url ? (
                                        <img
                                            src={item.cover_url}
                                            alt={item.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <ImageOff className="h-8 w-8 text-muted" />
                                        </div>
                                    )}

                                    <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-medium text-white">
                                        {item.category?.name ?? 'Tanpa kategori'}
                                    </span>

                                    <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                                        <Images className="mr-1 h-3 w-3" />
                                        {item.photos_count ?? item.photos.length} foto
                                    </span>
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-2 flex items-start justify-between gap-3">
                                        <h3 className="font-semibold text-body">{item.title}</h3>
                                        {item.is_active ? (
                                            <span className="whitespace-nowrap rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                                Tampil
                                            </span>
                                        ) : (
                                            <span className="whitespace-nowrap rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">
                                                Disembunyikan
                                            </span>
                                        )}
                                    </div>

                                    <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted">
                                        {item.description || 'Tanpa deskripsi'}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-line pt-4">
                                        <span className="text-xs text-muted">
                                            Urutan: {item.sort_order}
                                        </span>
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/admin/gallery/${item.id}/edit`}
                                                className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors duration-200 hover:bg-amber-100"
                                            >
                                                <Edit2 className="mr-1.5 h-4 w-4" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(item)}
                                                disabled={deletingId === item.id}
                                                className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {deletingId === item.id ? (
                                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="mr-1.5 h-4 w-4" />
                                                )}
                                                {deletingId === item.id ? 'Menghapus...' : 'Hapus'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Layout>

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
                    <p className="text-body">Apakah Anda yakin ingin menghapus album galeri ini?</p>
                    {selectedItem && (
                        <>
                            <p className="mt-2 text-sm font-medium text-body">
                                &ldquo;{selectedItem.title}&rdquo;
                            </p>
                            <p className="mt-2 text-sm text-muted">
                                {selectedItem.photos_count ?? selectedItem.photos.length} foto di dalamnya
                                akan ikut terhapus permanen.
                            </p>
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
}
