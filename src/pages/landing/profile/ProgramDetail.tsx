import MainLayout from "../../../components/layout/landing/MainLayout";
import { Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../api/api';
import bg_1 from "@/assets/img/bg_1.svg";
import { Helmet } from "react-helmet-async";

interface ProgramDetail {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    thumbnail_url?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

interface NewsItem {
    id: number;
    title: string;
    created_at: string;
    thumbnail_url?: string;
}

interface ApiResponse {
    success: boolean;
    data: {
        program: ProgramDetail;
        latest_news: NewsItem[];
    };
}

const ProgramDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [program, setProgram] = useState<ProgramDetail | null>(null);
    const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetchProgramDetail(slug);
        }
    }, [slug]);

    const fetchProgramDetail = async (programSlug: string) => {
        try {
            const response = await api.get<ApiResponse>(`/program-detail/${programSlug}`);
            if (response.data.success) {
                setProgram(response.data.data.program);
                setLatestNews(response.data.data.latest_news);
            }
        } catch (error) {
            console.error('Error fetching program detail:', error);
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

    const truncateSeo = (text: string, max = 155) => {
        return text.length > max ? text.substring(0, max) + "…" : text;
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="relative h-[400px] lg:h-[800px]">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${bg_1}')` }}
                    />
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                        <p>Memuat program...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!program) {
        return (
            <MainLayout>
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Program tidak ditemukan</h1>
                    <Link to="profil/program" className="text-blue-600 hover:text-blue-700 underline">
                        Kembali ke halaman program
                    </Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {program && (
                <Helmet>
                    {/* TITLE */}
                    <title>{program.title} | Program Unggulan SDI Ibu</title>

                    {/* SEO DESCRIPTION */}
                    <meta
                        name="description"
                        content={truncateSeo(program.description.replace(/<[^>]+>/g, ""))}
                    />

                    {/* OPEN GRAPH */}
                    <meta
                        property="og:title"
                        content={`${program.title} | SDI Ibu`}
                    />
                    <meta
                        property="og:description"
                        content={truncateSeo(program.description.replace(/<[^>]+>/g, ""))}
                    />
                    <meta
                        property="og:type"
                        content="article"
                    />
                    <meta
                        property="og:url"
                        content={window.location.href}
                    />

                    {/* OG IMAGE */}
                    {program.thumbnail_url && (
                        <meta
                            property="og:image"
                            content={program.thumbnail_url}
                        />
                    )}
                </Helmet>
            )}

            {/* Hero Section */}
            <div className="relative h-[400px] lg:h-[800px]">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${bg_1}')` }}
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                    <Link to="/profil/program" className="inline-flex items-center gap-2 text-lg mb-3 text-gray-300 hover:text-white transition-colors duration-300">
                        <p className="text-lg mb-3 text-gray-300">
                            Program Unggulan &gt; <span className="text-yellow-400 capitalize">{program.title}</span>
                        </p>
                    </Link>
                    <h1 className="text-4xl md:text-7xl font-bold capitalize">
                        {program.title}
                    </h1>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg p-8">
                            <h2 className="text-4xl font-bold text-gray-800 mb-6 capitalize border-b pb-4">
                                {program.title}
                            </h2>

                            {/* Program Image */}
                            {program.thumbnail_url && (
                                <div className="mb-6 flex justify-center"> {/* Tambahkan flex & justify-center agar posisi kotak di tengah jika diinginkan */}
                                    <div className="w-96 aspect-square overflow-hidden rounded-lg shadow-sm border border-gray-100">
                                        <img
                                            src={program.thumbnail_url}
                                            alt={program.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                                <div dangerouslySetInnerHTML={{ __html: program.description.replace(/\n/g, '<br/>') }} />
                            </div>

                            {/* Meta Info */}
                            <div className="mt-8 pt-6 text-sm text-gray-500">
                                <a href="https://sdi-ibu.id" className="text-blue-600 hover:text-blue-700 underline">
                                    https://sdi-ibu.id
                                </a>
                                <p>Dibuat pada <span className="font-semibold">{formatDate(program.created_at)}</span></p>
                                {program.updated_at !== program.created_at && (
                                    <p>Terakhir diperbarui <span className="font-semibold">{formatDate(program.updated_at)}</span></p>
                                )}
                            </div>

                            {/* Share Section */}
                            <div className="mt-8 pt-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-500 mb-4">Bagikan</h3>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: program.title,
                                                    text: program.description.substring(0, 100) + '...',
                                                    url: window.location.href,
                                                });
                                            } else {
                                                // Fallback: copy to clipboard
                                                navigator.clipboard.writeText(window.location.href);
                                                alert('Link berhasil disalin!');
                                            }
                                        }}
                                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
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
                                    latestNews.map((news) => (
                                        <Link
                                            key={news.id}
                                            to={`/berita/${news.id}`}
                                            className="flex gap-3 group"
                                        >
                                            <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                                <img
                                                    src={news.thumbnail_url || "https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=400&h=300&fit=crop"}
                                                    alt={news.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-[#004AAD] mb-1">
                                                    {formatDate(news.created_at)}
                                                </p>
                                                <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                    {news.title}
                                                </h4>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">Belum ada berita</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ProgramDetailPage;