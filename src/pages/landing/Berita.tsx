import { useState } from 'react';
import { Search, ArrowRight, Images, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/landing/MainLayout';
import { useEffect } from 'react';
import api from '../../api/api';
import bg_3 from "@/assets/img/bg_3.svg";
import { Helmet } from 'react-helmet-async';

interface Photo {
    id: number;
    news_id: number;
    path: string;
    url: string;
    created_at: string;
    updated_at: string;
}

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    content: string;
    views: number;
    thumbnail: string;
    thumbnail_url: string;
    created_at: string;
    updated_at: string;
    photos: Photo[];
}

interface NewsData {
    featured_news: NewsItem[];  // Berubah dari NewsItem | null menjadi NewsItem[]
    recent_news: NewsItem[];
    recommended_news: NewsItem[];
}

const BeritaPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [newsData, setNewsData] = useState<NewsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchNewsData();
    }, []);

    const fetchNewsData = async () => {
        try {
            const response = await api.get('/berita-list');
            if (response.data.success) {
                const data = response.data.data;
                setNewsData(data);
                // Set initial filtered news dengan semua berita
                updateFilteredNews(data, '');
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk mengupdate filtered news
    const updateFilteredNews = (data: NewsData, query: string) => {
        if (!data || !query.trim()) {
            // Jika tidak ada query, tampilkan semua berita (gabungkan semua kategori)
            const allNews = [
                ...data.featured_news,
                ...data.recent_news,
                ...data.recommended_news
            ];

            // Hapus duplikat berdasarkan ID
            const uniqueNews = allNews.filter((news, index, self) =>
                index === self.findIndex((n) => n.id === news.id)
            );

            setFilteredNews(uniqueNews);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const lowercasedQuery = query.toLowerCase();
        const allNews = [
            ...data.featured_news,
            ...data.recent_news,
            ...data.recommended_news
        ];

        const filtered = allNews.filter(news =>
            news.title.toLowerCase().includes(lowercasedQuery) ||
            (news.content && news.content.toLowerCase().includes(lowercasedQuery))
        );

        // Hapus duplikat
        const uniqueFiltered = filtered.filter((news, index, self) =>
            index === self.findIndex((n) => n.id === news.id)
        );

        setFilteredNews(uniqueFiltered);
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (newsData) {
            updateFilteredNews(newsData, query);
        }
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        if (newsData) {
            updateFilteredNews(newsData, '');
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

    // Generate excerpt dari content
    const generateExcerpt = (content: string, maxLength: number = 150) => {
        const strippedContent = content.replace(/<[^>]*>/g, '');
        if (strippedContent.length <= maxLength) return strippedContent;
        return strippedContent.substring(0, maxLength) + '...';
    };

    // Highlight search term in text
    const highlightText = (text: string, query: string) => {
        if (!query.trim() || !text.toLowerCase().includes(query.toLowerCase())) {
            return text;
        }

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <>
                {parts.map((part, index) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <mark key={index} className="bg-yellow-200 font-semibold">
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </>
        );
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="relative h-[400px] lg:h-[800px] bg-gradient-to-r from-gray-900/90 to-gray-800/90">
                    <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                        <p>Memuat berita...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // Ambil berita pertama sebagai featured news (bisa juga ditampilkan carousel)
    const featuredNews = newsData?.featured_news && newsData.featured_news.length > 0
        ? newsData.featured_news[0]
        : null;

    return (
        <MainLayout>
            <Helmet>
                <title>Berita SDI Ikhlas Bakti Umat | Informasi & Kegiatan Sekolah</title>

                <meta
                    name="description"
                    content="Berita terbaru SDI Ikhlas Bakti Umat Jakarta Timur seputar kegiatan sekolah, prestasi siswa, dan informasi pendidikan."
                />

                <meta
                    name="keywords"
                    content="Berita SDI Ikhlas Bakti Umat, Berita Sekolah Islam, SD Islam Jakarta Timur"
                />

                {/* Open Graph */}
                <meta property="og:title" content="Berita SDI Ikhlas Bakti Umat" />
                <meta
                    property="og:description"
                    content="Informasi dan berita terbaru SDI Ikhlas Bakti Umat Jakarta Timur."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://domainkamu/si/berita" />

                <link rel="canonical" href="https://domainkamu/si/berita" />
            </Helmet>
            {/* Hero Section */}
            <div className="relative h-[400px] lg:h-[800px] bg-gradient-to-r from-gray-900/90 to-gray-800/90">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${bg_3})`,
                        backgroundBlendMode: 'overlay'
                    }}
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Berita
                    </h1>
                    <p className="text-lg text-muted mb-8 max-w-2xl">
                        Berita seputar Sekolah Dasar Islam Ikhlas Bakti Umat
                    </p>

                    {/* Search Bar */}
                    <div className="w-full max-w-2xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Cari berita berdasarkan judul atau isi..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-12 pr-10 py-3 rounded-full bg-surface text-body focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted hover:text-muted"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <p className="text-white mt-2 text-sm">
                                Menampilkan {filteredNews.length} hasil untuk "{searchQuery}"
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12">
                {isSearching ? (
                    // Tampilan saat searching
                    <>
                        {/* Search Results Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-body mb-2">
                                    Hasil Pencarian
                                </h2>
                                <p className="text-muted">
                                    Ditemukan {filteredNews.length} berita untuk "{searchQuery}"
                                </p>
                            </div>
                            <button
                                onClick={clearSearch}
                                className="text-muted hover:text-body text-sm flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                Hapus pencarian
                            </button>
                        </div>

                        {filteredNews.length === 0 ? (
                            <div className="text-center py-16">
                                <Search className="w-16 h-16 text-muted mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-body mb-2">
                                    Tidak ada hasil ditemukan
                                </h3>
                                <p className="text-muted mb-6">
                                    Tidak ada berita yang sesuai dengan pencarian "{searchQuery}"
                                </p>
                                <button
                                    onClick={clearSearch}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Tampilkan Semua Berita
                                </button>
                            </div>
                        ) : (
                            // Grid untuk search results
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredNews.map((news) => (
                                    <Link
                                        key={news.id}
                                        to={`/berita/${news.slug}`}
                                        className="bg-surface rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group"
                                    >
                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={news.thumbnail_url || "https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=400&h=300&fit=crop"}
                                                alt={news.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {news.photos && news.photos.length > 0 && (
                                                <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                                    <Images className="w-3 h-3 text-blue-600" />
                                                    <span className="text-xs font-medium text-blue-600">
                                                        {news.photos.length}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-brand text-sm">
                                                    {formatDate(news.created_at)}
                                                </p>
                                                <p className="text-muted text-xs">
                                                    {news.views || 0} dilihat
                                                </p>
                                            </div>
                                            <h3 className="text-lg font-bold text-body mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {highlightText(news.title, searchQuery)}
                                            </h3>
                                            <p className="text-muted text-sm mb-3 line-clamp-2">
                                                {highlightText(
                                                    generateExcerpt(news.content, 100),
                                                    searchQuery
                                                )}
                                            </p>
                                            <div className="flex items-center text-brand font-medium text-sm">
                                                Baca Selengkapnya
                                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    // Tampilan normal (tidak searching)
                    <>
                        {/* Berita Populer Badge - Tampilkan jika ada featured news */}
                        {featuredNews && (
                            <>
                                <div className="inline-block bg-brand/20 text-brand px-5 py-2 rounded-full text-sm font-medium mb-8">
                                    Berita Populer
                                </div>

                                {/* Featured News */}
                                <Link to={`/berita/${featuredNews.slug}`} className="block mb-16 group">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                        <div className="relative rounded-2xl overflow-hidden shadow-xl">
                                            <img
                                                src={featuredNews.thumbnail_url || "https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=800&h=500&fit=crop"}
                                                alt={featuredNews.title}
                                                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {featuredNews.photos && featuredNews.photos.length > 0 && (
                                                <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                                                    <Images className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-600">
                                                        {featuredNews.photos.length} Foto
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <p className="text-brand text-sm font-medium">
                                                    {formatDate(featuredNews.created_at)}
                                                </p>
                                                <span className="text-muted">•</span>
                                                <p className="text-muted text-sm">
                                                    {featuredNews.views || 0} dilihat
                                                </p>
                                            </div>
                                            <h2 className="text-3xl font-bold text-body mb-4 group-hover:text-blue-600 transition-colors">
                                                {featuredNews.title}
                                            </h2>
                                            <p className="text-muted leading-relaxed mb-6">
                                                {generateExcerpt(featuredNews.content)}
                                            </p>
                                            <div className="flex items-center text-brand font-medium group-hover:text-blue-700">
                                                Baca Selengkapnya
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                {newsData?.featured_news && newsData.featured_news.length > 1 && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                                            {newsData.featured_news.slice(1).map((news) => (
                                                <Link
                                                    key={news.id}
                                                    to={`/berita/${news.slug}`}
                                                    className="bg-surface rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group"
                                                >
                                                    <div className="relative h-56 overflow-hidden">
                                                        <img
                                                            src={news.thumbnail_url || "https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=400&h=300&fit=crop"}
                                                            alt={news.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        {news.photos && news.photos.length > 0 && (
                                                            <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                                                <Images className="w-3 h-3 text-blue-600" />
                                                                <span className="text-xs font-medium text-blue-600">
                                                                    {news.photos.length}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-5">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-brand text-sm">
                                                                {formatDate(news.created_at)}
                                                            </p>
                                                            <p className="text-muted text-xs">
                                                                {news.views || 0} dilihat
                                                            </p>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-body mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                            {news.title}
                                                        </h3>
                                                        <div className="flex items-center text-brand font-medium text-sm">
                                                            Baca Selengkapnya
                                                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}



                        {/* Berita Terbaru Badge */}
                        {newsData?.recent_news && newsData.recent_news.length > 0 && (
                            <>
                                <div className="inline-block bg-brand/20 text-brand px-5 py-2 rounded-full text-sm font-medium mb-8">
                                    Berita Terbaru
                                </div>

                                {/* Recent News Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                                    {newsData.recent_news.map((news) => (
                                        <Link
                                            key={news.id}
                                            to={`/berita/${news.slug}`}
                                            className="bg-surface rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group"
                                        >
                                            <div className="relative h-56 overflow-hidden">
                                                <img
                                                    src={news.thumbnail_url || "https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=400&h=300&fit=crop"}
                                                    alt={news.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {news.photos && news.photos.length > 0 && (
                                                    <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                                        <Images className="w-3 h-3 text-blue-600" />
                                                        <span className="text-xs font-medium text-blue-600">
                                                            {news.photos.length}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-brand text-sm">
                                                        {formatDate(news.created_at)}
                                                    </p>
                                                    <p className="text-muted text-xs">
                                                        {news.views || 0} dilihat
                                                    </p>
                                                </div>
                                                <h3 className="text-lg font-bold text-body mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                    {news.title}
                                                </h3>
                                                <div className="flex items-center text-brand font-medium text-sm">
                                                    Baca Selengkapnya
                                                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Rekomendasi Berita Badge */}
                        {newsData?.recommended_news && newsData.recommended_news.length > 0 && (
                            <>
                                <div className="inline-block bg-brand/20 text-brand px-5 py-2 rounded-full text-sm font-medium mb-8">
                                    Rekomendasi Berita
                                </div>

                                {/* Recommended News Grid - Tampilkan semua berita recommended */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {newsData.recommended_news.map((news) => (
                                        <Link
                                            key={news.id}
                                            to={`/berita/${news.slug}`}
                                            className="flex gap-4 bg-surface rounded-lg p-4 shadow hover:shadow-lg transition-shadow duration-300 group"
                                        >
                                            <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                                <img
                                                    src={news.thumbnail_url || "https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=200&h=150&fit=crop"}
                                                    alt={news.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {news.photos && news.photos.length > 0 && (
                                                    <div className="absolute top-1 right-1 bg-surface/90 rounded-full p-1">
                                                        <Images className="w-3 h-3 text-blue-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-brand text-xs">
                                                        {formatDate(news.created_at)}
                                                    </p>
                                                    <p className="text-muted text-xs">
                                                        {news.views || 0} views
                                                    </p>
                                                </div>
                                                <h4 className="text-base font-semibold text-body line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                                                    {news.title}
                                                </h4>
                                                <div className="flex items-center text-brand font-medium text-sm">
                                                    Baca Selengkapnya
                                                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default BeritaPage;