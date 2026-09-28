import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Images, Loader2 } from 'lucide-react';
import MainLayout from '../../components/layout/landing/MainLayout';
import GalleryLightbox from '../../components/landing/GalleryLightbox';
import { galleryService } from '../../services/galleryServices';
import { galleryCategoryService } from '../../services/galleryCategoryServices';
import { useToast } from '../../context/toast';
import type { Gallery, GalleryCategory } from '../../types/gallery';

const perPage = 12;

export default function GaleriPage() {
    const toast = useToast();

    const [albums, setAlbums] = useState<Gallery[]>([]);
    const [categories, setCategories] = useState<GalleryCategory[]>([]);
    const [category, setCategory] = useState<number | 'all'>('all');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingAlbumId, setLoadingAlbumId] = useState<number | null>(null);
    const [openAlbum, setOpenAlbum] = useState<Gallery | null>(null);
    const [openPhotoIndex, setOpenPhotoIndex] = useState(0);

    const fetchAlbums = useCallback(
        async (targetPage: number, targetCategory: number | 'all', append: boolean) => {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            try {
                const response = await galleryService.getPublicList({
                    page: targetPage,
                    per_page: perPage,
                    category: targetCategory === 'all' ? undefined : targetCategory,
                });

                setAlbums((previous) =>
                    append ? [...previous, ...response.data] : response.data
                );
                setPage(response.meta.current_page);
                setLastPage(response.meta.last_page);
                setTotal(response.meta.total);
            } catch (error) {
                console.error('Error fetching galleries:', error);
                toast.error('Gagal memuat galeri', 'Periksa koneksi lalu coba lagi.');
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [toast]
    );

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategories(await galleryCategoryService.getPublic());
            } catch (error) {
                console.error('Error fetching gallery categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        fetchAlbums(1, category, false);
    }, [category, fetchAlbums]);

    const openAlbumAt = async (album: Gallery) => {
        if (loadingAlbumId) return;

        setLoadingAlbumId(album.id);
        try {
            const detail = await galleryService.getPublicDetail(album.id);

            setOpenAlbum(detail);
            setOpenPhotoIndex(0);
        } catch (error) {
            console.error('Error fetching gallery detail:', error);
            toast.error('Gagal membuka album galeri', 'Silakan coba lagi.');
        } finally {
            setLoadingAlbumId(null);
        }
    };

    return (
        <MainLayout>
            <Helmet>
                <title>Galeri Kegiatan | SDI Ikhlas Bakti Umat</title>
                <meta
                    name="description"
                    content="Dokumentasi kegiatan pembelajaran, ibadah, olahraga, dan kegiatan lainnya di Sekolah IBU (Ikhlas Bakti Umat)."
                />
            </Helmet>

            {/* Header */}
            <div className="bg-brand px-4 pb-16 pt-32 text-center text-white">
                <div className="container mx-auto">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-medium">
                        <Images className="h-4 w-4" />
                        Galeri Sekolah
                    </div>
                    <h1 className="mb-4 text-3xl font-bold md:text-4xl">
                        Dokumentasi Kegiatan Sekolah IBU
                    </h1>
                    <p className="mx-auto max-w-2xl text-white/80">
                        Kumpulan momen pembelajaran, ibadah, olahraga, outing, dan kegiatan bersama
                        wali murid.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Filter kategori */}
                <div className="mb-10 flex flex-wrap justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCategory('all')}
                        className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                            category === 'all'
                                ? 'border-brand bg-brand text-white'
                                : 'border-line bg-surface text-muted hover:bg-surface-muted'
                        }`}
                    >
                        Semua
                    </button>

                    {categories.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setCategory(item.id)}
                            className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                                category === item.id
                                    ? 'border-brand bg-brand text-white'
                                    : 'border-line bg-surface text-muted hover:bg-surface-muted'
                            }`}
                        >
                            {item.name}
                            {typeof item.galleries_count === 'number' && (
                                <span className="ml-1 text-xs opacity-70">
                                    ({item.galleries_count})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {!loading && (
                    <p className="mb-6 text-center text-sm text-muted">
                        Menampilkan {albums.length} dari {total} album
                    </p>
                )}

                {/* Daftar album */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : albums.length === 0 ? (
                    <div className="py-20 text-center">
                        <Images className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h2 className="mb-2 text-lg font-semibold text-body">
                            Belum ada album
                        </h2>
                        <p className="text-muted">
                            Belum ada dokumentasi pada kategori ini.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {albums.map((album) => (
                            <button
                                key={album.id}
                                type="button"
                                onClick={() => openAlbumAt(album)}
                                className="group overflow-hidden rounded-2xl bg-surface text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                                    {album.cover_url && (
                                        <img
                                            src={album.cover_url}
                                            alt={album.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    )}

                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                                    <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-brand">
                                        {album.category?.name ?? 'Galeri'}
                                    </span>
                                    <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                                        <Images className="h-3 w-3" />
                                        {album.photos_count ?? album.photos.length} foto
                                    </span>

                                    {loadingAlbumId === album.id && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/50">
                                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    <h2 className="mb-2 text-lg font-semibold text-body transition-colors group-hover:text-brand">
                                        {album.title}
                                    </h2>
                                    {album.description && (
                                        <p className="line-clamp-2 text-sm text-muted">
                                            {album.description}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Muat lebih banyak */}
                {!loading && page < lastPage && (
                    <div className="mt-10 text-center">
                        <button
                            type="button"
                            onClick={() => fetchAlbums(page + 1, category, true)}
                            disabled={loadingMore}
                            className="inline-flex items-center gap-2 rounded-full border border-brand px-6 py-3 font-medium text-brand transition-colors hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                        </button>
                    </div>
                )}
            </div>

            <GalleryLightbox
                album={openAlbum}
                photoIndex={openPhotoIndex}
                onClose={() => setOpenAlbum(null)}
                onIndexChange={setOpenPhotoIndex}
            />
        </MainLayout>
    );
}
