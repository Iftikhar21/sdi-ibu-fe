import MainLayout from "../../components/layout/landing/MainLayout";
import { Calendar, Eye, Share2, Images, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api/api';
import { Helmet } from "react-helmet-async";

interface Photo {
    id: number;
    news_id: number;
    path: string;
    url: string;
    created_at: string;
    updated_at: string;
}

interface NewsDetail {
    id: number;
    title: string;
    slug: string;
    content: string;
    thumbnail_url?: string;
    created_at: string;
    updated_at: string;
    views: number;
    photos: Photo[];
}

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    created_at: string;
    thumbnail_url?: string;
    photos: Photo[];
    views: number;
}

interface ApiResponse {
    success: boolean;
    data: {
        berita: NewsDetail;
        latest_news: NewsItem[];
    };
}

const BeritaDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [news, setNews] = useState<NewsDetail | null>(null);
    const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [showPhotoGallery, setShowPhotoGallery] = useState(false);

    useEffect(() => {
        if (slug) {
            fetchNewsDetail(slug);
        }
    }, [slug]);

    const fetchNewsDetail = async (newsSlug: string) => {
        try {
            const response = await api.get<ApiResponse>(`/berita-detail/${newsSlug}`);
            if (response.data.success) {
                setNews(response.data.data.berita);
                setLatestNews(response.data.data.latest_news);
            }
        } catch (error) {
            console.error('Error fetching news detail:', error);
        } finally {
            setLoading(false);
        }
    };

    // Format tanggal
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Format view count
    const formatViews = (views: number) => {
        if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K`;
        }
        return views.toString();
    };

    // Navigate photos
    const nextPhoto = () => {
        if (!news?.photos) return;
        setActivePhotoIndex((prev) => (prev + 1) % news.photos.length);
    };

    const prevPhoto = () => {
        if (!news?.photos) return;
        setActivePhotoIndex((prev) => (prev - 1 + news.photos.length) % news.photos.length);
    };

    // Open photo in lightbox
    const openPhoto = (index: number) => {
        setActivePhotoIndex(index);
        setShowPhotoGallery(true);
    };

    const splitParagraphs = (html: string) => {
        return html
            .split(/<\/p>/i)
            .map(p => p.trim())
            .filter(p => p.length > 0)
            .map(p => p + '</p>');
    };


    if (loading) {
        return (
            <MainLayout>
                <div className="relative h-[400px] bg-gradient-to-r from-gray-900/90 to-gray-800/90">
                    <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                        <p>Memuat berita...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!news) {
        return (
            <MainLayout>
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Berita tidak ditemukan</h1>
                    <Link to="/berita" className="text-blue-600 hover:text-blue-700 underline">
                        Kembali ke halaman berita
                    </Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Helmet>
                {/* TITLE DINAMIS */}
                <title>
                    {news.title} | SDI Ikhlas Bakti Umat
                </title>

                {/* META DESCRIPTION (ambil dari konten) */}
                <meta
                    property="og:description"
                    content={`Baca Berita: ${news.title}`}
                />

                {/* KEYWORDS (opsional tapi aman) */}
                <meta
                    name="keywords"
                    content={`Berita SDI Ikhlas Bakti Umat, ${news.title}, Sekolah Dasar Islam Jakarta Timur`}
                />

                {/* CANONICAL */}
                <link
                    rel="canonical"
                    href={`https://sdi-ibu.id/berita/${news.slug}`}
                />

                {/* OPEN GRAPH (WA / FB) */}
                <meta property="og:title" content={news.title} />
                <meta
                    property="og:description"
                    content={`Baca Berita: ${news.title}`}
                />
                <meta property="og:type" content="article" />
                <meta
                    property="og:url"
                    content={`https://sdi-ibu.id/berita/${news.slug}`}
                />
                <meta
                    property="og:image"
                    content={
                        news.thumbnail_url ||
                        "https://sdi-ibu.id/default-og.jpg"
                    }
                />

                {/* ARTICLE META */}
                <meta property="article:published_time" content={news.created_at} />
                <meta property="article:modified_time" content={news.updated_at} />
            </Helmet>

            {/* Hero Section */}
            <div className="relative h-[400px] lg:h-[800px] bg-gradient-to-r from-gray-900/90 to-gray-800/90">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${news.thumbnail_url || "https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=1200&h=400&fit=crop"}')`,
                        backgroundBlendMode: 'overlay'
                    }}
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                    <div className="flex items-center gap-2 text-sm mb-4">
                        <Link to="/berita" className="text-gray-300 hover:text-white transition-colors">
                            Berita
                        </Link>
                        <span className="text-gray-400">&gt;</span>
                        <span className="text-yellow-400 block max-w-[250px] truncate">{news.title}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold max-w-4xl">
                        {news.title}
                    </h1>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg">
                            {/* Article Title */}
                            <h1 className="text-3xl font-bold text-gray-800 mb-8">
                                {news.title}
                            </h1>

                            {/* Article Meta */}
                            <div className="flex items-center gap-6 mb-8 pb-6 border-b">
                                <div className="flex items-center text-[#004AAD]">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span className="text-sm">{formatDate(news.created_at)}</span>
                                </div>
                                <div className="flex items-center text-[#004AAD]">
                                    <Eye className="w-4 h-4 mr-2" />
                                    <span className="text-sm">{formatViews(news.views)} Kali</span>
                                </div>
                                {news.photos && news.photos.length > 0 && (
                                    <div className="flex items-center text-[#004AAD]">
                                        <Images className="w-4 h-4 mr-2" />
                                        <span className="text-sm">{news.photos.length} Foto</span>
                                    </div>
                                )}
                            </div>

                            {/* Article Content */}
                            <div className="prose prose-lg max-w-none text-gray-700 space-y-4 mb-8">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: news.content.replace(/\n/g, "<br />"),
                                    }}
                                />
                            </div>

                            {/* Featured Image */}
                            {news.thumbnail_url && (
                                <div className="mb-8">
                                    <div className="rounded-xl overflow-hidden">
                                        <img
                                            src={news.thumbnail_url}
                                            alt={news.title}
                                            className="w-full object-cover"
                                        />
                                    </div>
                                    <p className="text-center text-sm text-gray-500 mt-3 italic">
                                        {news.title}
                                    </p>
                                </div>
                            )}

                            {/* Photo Gallery Section */}
                            {news.photos && news.photos.length > 0 && (
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-gray-800">Galeri Foto</h3>
                                        <span className="text-sm text-gray-500">
                                            {news.photos.length} foto
                                        </span>
                                    </div>

                                    {/* Photo Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {news.photos.slice(0, 6).map((photo, index) => (
                                            <div
                                                key={photo.id}
                                                className="relative rounded-lg overflow-hidden group cursor-pointer"
                                                onClick={() => openPhoto(index)}
                                            >
                                                <img
                                                    src={photo.url}
                                                    alt={`Foto ${index + 1} - ${news.title}`}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                                            </div>
                                        ))}
                                    </div>

                                    {/* View All Photos Button */}
                                    {news.photos.length > 6 && (
                                        <button
                                            onClick={() => setShowPhotoGallery(true)}
                                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                                        >
                                            <Images className="w-4 h-4" />
                                            Lihat semua {news.photos.length} foto
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Additional Info */}
                            <div className="prose prose-lg max-w-none text-gray-700 space-y-4 mb-8">
                                {news.updated_at !== news.created_at && (
                                    <p className="text-sm text-gray-500 pt-4">
                                        Diperbarui pada {formatDate(news.updated_at)}
                                    </p>
                                )}
                            </div>

                            {/* Share Section */}
                            <div className="pt-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bagikan</h3>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: news.title,
                                                    text: `Baca Berita: ${news.title}`,
                                                    url: window.location.href,
                                                });
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert('Link berhasil disalin!');
                                            }
                                        }}
                                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                                        aria-label="Share"
                                    >
                                        <Share2 className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg p-6 sticky top-4">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Berita Terbaru</h3>
                                <Link
                                    to="/berita"
                                    className="text-sm text-gray-500 hover:text-blue-700 font-medium"
                                >
                                    Lihat Semua
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {latestNews.length > 0 ? (
                                    latestNews.map((item) => (
                                        <Link
                                            key={item.id}
                                            to={`/berita/${item.slug}`}
                                            className="flex gap-3 group"
                                        >
                                            <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                                <img
                                                    src={item.thumbnail_url || "https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=400&h=300&fit=crop"}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />

                                                {/* Badge Foto */}
                                                {item.photos && item.photos.length > 0 && (
                                                    <div className="absolute top-1 right-1 bg-white/90 rounded-full p-1">
                                                        <Images className="w-2.5 h-2.5 text-blue-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-[#004AAD] mb-1">
                                                    {formatDate(item.created_at)}
                                                </p>
                                                <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                    {item.title}
                                                </h4>
                                                <p className="text-gray-400 text-xs mt-1">
                                                    {item.views || 0}x dilihat
                                                </p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">Belum ada berita lainnya</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Photo Gallery Modal */}
            {showPhotoGallery && news.photos && news.photos.length > 0 && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
                    <button
                        onClick={() => setShowPhotoGallery(false)}
                        className="absolute top-4 right-4 text-white text-2xl z-50"
                    >
                        ✕
                    </button>

                    <div className="relative w-full max-w-4xl mx-4">
                        {/* Current Photo */}
                        <div className="relative">
                            <img
                                src={news.photos[activePhotoIndex].url}
                                alt={`Foto ${activePhotoIndex + 1}`}
                                className="w-full h-auto max-h-[70vh] object-contain"
                            />

                            {/* Navigation Buttons */}
                            {news.photos.length > 1 && (
                                <>
                                    <button
                                        onClick={prevPhoto}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 text-white"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextPhoto}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 text-white"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Photo Counter */}
                        <div className="text-white text-center mt-4">
                            {activePhotoIndex + 1} / {news.photos.length}
                        </div>

                        {/* Thumbnail Strip */}
                        <div className="mt-4 flex gap-2 overflow-x-auto py-2">
                            {news.photos.map((photo, index) => (
                                <button
                                    key={photo.id}
                                    onClick={() => setActivePhotoIndex(index)}
                                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden ${index === activePhotoIndex ? 'ring-2 ring-blue-500' : 'opacity-60'
                                        }`}
                                >
                                    <img
                                        src={photo.url}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default BeritaDetailPage;