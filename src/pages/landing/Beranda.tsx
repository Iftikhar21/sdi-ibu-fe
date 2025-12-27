import { Link } from 'react-router-dom';
import MainLayout from "../../components/layout/landing/MainLayout";
import { ArrowRight, BookOpen, Target, Award, MessageCircle, Mail, Phone, MapPin, Share2, Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/api';
import bg_5 from "@/assets/img/bg_5.png";
import ring_home from "@/assets/img/ring_home.svg";
import image_home_1 from "@/assets/img/image_home_1.svg";
import logo_sdi from '@/assets/img/logo-sdi-ibu.svg';
import image_visi_misi_2 from "@/assets/img/image_visi_misi_2.svg";
import bg_2 from "@/assets/img/bg_2.svg";
import image_sejarah_1 from '@/assets/img/image_sejarah_1.svg';
import { Helmet } from 'react-helmet-async';

interface ProgramData {
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

interface NewsData {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    thumbnail_url?: string;
    created_at: string;
    views: number;
}

interface SocialMedia {
    id: number;
    platform: string;
    url: string;
    created_at: string;
    updated_at: string;
}

interface ContactData {
    id: number;
    alamat: string;
    telepon: string;
    email: string;
    map_embed: string;
    socials: SocialMedia[];
}

interface VisiMisiData {
    id: number;
    vision: string;
    missions: string[];
    created_at: string;
    updated_at: string;
}

interface SejarahData {
    id: number;
    content: string;
    created_at: string;
    updated_at: string;
}

interface HomeData {
    welcome: {
        sejarah: SejarahData;
        visi_misi: VisiMisiData;
    };
    programs: ProgramData[];
    news: {
        featured: NewsData;
        recent: NewsData[];
    };
    contact: ContactData;
    stats: {
        program_count: number;
        news_count: number;
        visi_misi_count: number;
    };
}

const HomePage = () => {
    const [homeData, setHomeData] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        try {
            const response = await api.get('/home');
            if (response.data.success) {
                setHomeData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk mendapatkan excerpt dari content
    const generateExcerpt = (content: string, maxLength: number = 100) => {
        const strippedContent = content.replace(/<[^>]*>/g, '');
        if (strippedContent.length <= maxLength) return strippedContent;
        return strippedContent.substring(0, maxLength) + '...';
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

    // Fungsi untuk mendapatkan icon social media
    const getSocialIcon = (platform: string, className = "w-5 h-5") => {
        const platformLower = platform.toLowerCase();

        switch (platformLower) {
            case 'whatsapp':
                return <MessageCircle className={className} />;
            case 'instagram':
                return (
                    <Instagram className={className} />
                );
            case 'twitter':
            case 'x':
                return (
                    <Twitter className={className} />
                );
            case 'facebook':
                return (
                    <Facebook className={className} />
                );
            case 'youtube':
                return (
                    <Youtube className={className} />
                );
            default:
                return <Share2 className={className} />;
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            </MainLayout>
        );
    }

    // Data default jika tidak ada dari API
    const defaultContact = {
        alamat: "Jl. Dalang, RT.12/RW.5, Munjul, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13850",
        telepon: "0878-5248-2129",
        email: "SDIIkhlas@gmail.com",
        map_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.3670102893125!2d106.89625697499147!3d-6.346498493643336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ed478d5baf01%3A0x4dce5bf47aedf189!2sMasjid%20Jami'%20Al-Ikhlas!5e0!3m2!1sid!2sid!4v1766469376968!5m2!1sid!2sid",
        socials: []
    };

    const contact = homeData?.contact || defaultContact;
    const programs = homeData?.programs || [];
    const news = homeData?.news;
    const visiMisi = homeData?.welcome?.visi_misi;
    const sejarah = homeData?.welcome?.sejarah;

    // Generate excerpt dari sejarah
    const sejarahExcerpt = sejarah?.content
        ? generateExcerpt(sejarah.content, 200)
        : "SDI Ikhlas Bakti Umat hadir sebagai tempat belajar yang tidak hanya mengajarkan ilmu pengetahuan, tetapi juga menanamkan nilai keislaman dan karakter positif sejak dini. Kami percaya bahwa pendidikan dasar merupakan fondasi penting dalam membentuk masa depan anak.";

    // Ambil misi pertama atau default
    const misiFirst = visiMisi?.missions?.[0] || "Menyelenggarakan pendidikan yang berlandaskan Al-Qur'an dan Sunnah...";

    return (
        <MainLayout>
            <Helmet>
                <title>SDI Ikhlas Bakti Umat | Sekolah Dasar Islam</title>

                <meta
                    name="description"
                    content="SDI Ikhlas Bakti Umat adalah Sekolah Dasar Islam yang fokus pada pendidikan iman, adab, dan prestasi akademik."
                />

                <meta
                    name="keywords"
                    content="SDI Ikhlas Bakti Umat, Sekolah Dasar Islam, SD Islam, Sekolah Islam Terpadu"
                />

                {/* Open Graph (buat share WA / FB) */}
                <meta property="og:title" content="SDI Ikhlas Bakti Umat" />
                <meta
                    property="og:description"
                    content="Sekolah Dasar Islam yang membentuk generasi beriman, berakhlak, dan berprestasi."
                />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="/og-image.jpg" />

                {/* SEO dasar */}
                <meta name="robots" content="index, follow" />
            </Helmet>
            {/* Hero Section */}
            <div className="relative overflow-hidden min-h-screen flex items-center justify-center">
                {/* Decorative Wave */}
                <div className="absolute bottom-0 left-0 right-0 h-[150vh] z-0">
                    <img
                        src={bg_5}
                        alt="Decorative Wave"
                        className="w-full h-full object-cover object-top"
                    />
                </div>

                <div className="container mx-auto px-4 -mt-50 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-items-center">
                        {/* Text Content */}
                        <div className="text-white text-center lg:text-left">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                Sekolah Dasar<br />
                                Islam <span className="text-yellow-400">Ikhlas Bakti<br />Umat</span>
                            </h1>
                            <p className="text-lg text-gray-200 mb-8 max-w-lg mx-auto lg:mx-0">
                                Mendidik dengan Iman, Membimbing dengan Adab dan Akhlak Mulia. Pendidikan Iman dan Adab Terintegrasi dalam Kurikulum dan Lingkungan Sekolah.
                            </p>
                            <Link
                                to="/pendaftaran"
                                className="inline-block px-8 py-3 bg-[#CEBB2A] hover:bg-yellow-500 text-white font-semibold rounded-full transition-colors shadow-lg"
                            >
                                Daftar Sekarang
                            </Link>
                        </div>

                        {/* Image with Islamic Frame */}
                        <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px]">
                            {/* Ring / Frame SVG */}
                            <img
                                src={ring_home}
                                alt="Ring Frame"
                                className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
                            />

                            {/* Gambar Murid dengan clip-path */}
                            <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
                                <img
                                    src={image_home_1}
                                    alt="SDI Students"
                                    className="w-[88%] h-[88%] object-cover"
                                    style={{ clipPath: "polygon(50% 0%, 65% 15%, 85% 15%, 85% 35%, 100% 50%, 85% 65%, 85% 85%, 65% 85%, 50% 100%, 35% 85%, 15% 85%, 15% 65%, 0% 50%, 15% 35%, 15% 15%, 35% 15%)" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Welcome Section */}
            <div className="py-20 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    {/* HEADER: Logo dan Judul di Tengah Atas */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-24 h-24 mb-6">
                            <img src={logo_sdi} alt="Logo SDI" className="w-full h-full object-contain" />
                        </div>
                        <p className="text-gray-800 font-semibold text-lg mb-2">
                            Selamat Datang di SDI Ikhlas Bakti Umat
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
                            Belajar, Berakhlak, dan <span className="text-red-600">Berprestasi</span>
                        </h2>
                    </div>

                    {/* KONTEN UTAMA: Grid 2 Kolom */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-start">
                        {/* KOLOM KIRI: Deskripsi & Tombol */}
                        <div className="flex flex-col items-start text-left">
                            <div className="text-gray-600 text-lg leading-relaxed space-y-6 mb-10">
                                <p>
                                    {sejarahExcerpt}
                                </p>
                            </div>

                            <Link
                                to="/profil/sejarah"
                                className="inline-block px-10 py-3 bg-[#004AAD] hover:bg-gray-700 text-white font-bold rounded-full transition-all shadow-lg"
                            >
                                Baca Selengkapnya
                            </Link>
                        </div>

                        {/* KOLOM KANAN: Visi & Misi */}
                        <div className="space-y-12">
                            {/* Row Visi */}
                            <div className="flex gap-6 items-start">
                                <div className="flex-shrink-0 w-16 h-16">
                                    <img src={image_visi_misi_2} alt="" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Visi Kami</h3>
                                    <p className="text-gray-600 text-lg italic">
                                        {visiMisi?.vision || "Mewujudkan generasi Islami yang beriman, berilmu, berakhlak mulia, dan berprestasi."}
                                    </p>
                                </div>
                            </div>

                            {/* Row Misi */}
                            <div className="flex gap-6 items-start">
                                <div className="flex-shrink-0 w-16 h-16">
                                    <img src={image_visi_misi_2} alt="" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Misi Kami</h3>
                                    <p className="text-gray-600 text-lg leading-relaxed">
                                        {misiFirst}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Programs Section */}
            {programs.length > 0 && (
                <div className="relative py-20 overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${bg_2}')` }}
                    />

                    {/* White Gradient Top */}
                    <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-white via-white/90 to-transparent" />

                    {/* White Gradient Bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-white via-white/90 to-transparent" />

                    {/* Soft overlay agar konten tetap terbaca */}
                    <div className="absolute inset-0 bg-white/30" />

                    {/* Content Container */}
                    <div className="relative container mx-auto px-4 z-10">
                        {/* Section Header */}
                        <div className="text-center mb-12">
                            <div className="inline-block bg-[#004AAD33] text-[#004AAD] px-5 py-2 rounded-full text-sm font-medium mb-4">
                                Program Kami
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Program <span className="text-[#E13131]">Unggulan</span>
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Program pendidikan Al-Quran untuk berbagai usia dengan kurikulum terstruktur
                            </p>
                        </div>

                        {/* Program Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {programs.map((program) => (
                                <div
                                    key={program.id}
                                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-b-[12px] border-[#004AAD]"
                                >
                                    {/* Image Section */}
                                    <div className="relative aspect-square overflow-hidden">
                                        <img
                                            src={program.thumbnail_url || "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=400&h=400&fit=crop"}
                                            alt={program.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-8">
                                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                                            {program.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                            {generateExcerpt(program.description, 120)}
                                        </p>

                                        {/* Arrow Link */}
                                        <Link
                                            to={`/program/${program.slug}`}
                                            className="w-12 h-12 bg-[#004AAD] hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-300 ml-auto shadow-md"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* News Section */}
            {news && (
                <div className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <div className="inline-block bg-[#004AAD33] text-[#004AAD] px-5 py-2 rounded-full text-sm font-medium mb-4">
                                    Berita Terbaru
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold">
                                    Berita & Kegiatan <span className="text-[#E13131]">Terbaru</span>
                                </h2>
                                <p className="text-gray-600 mt-2">
                                    Berita seputar Sekolah Dasar Islam Ikhlas Bakti Umat
                                </p>
                            </div>
                            <Link
                                to="/berita"
                                className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-[#004AAD] hover:bg-blue-700 text-white font-medium rounded-4xl transition-colors"
                            >
                                Lihat Semua
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Featured News */}
                            {news.featured && (
                                <Link to={`/berita/${news.featured.slug}`} className="group">
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                                        <div className="relative h-64 overflow-hidden">
                                            <img
                                                src={news.featured.thumbnail_url || "https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=800&h=400&fit=crop"}
                                                alt={news.featured.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-6">
                                            <p className="text-[#004AAD] text-sm font-medium mb-2">
                                                {formatDate(news.featured.created_at)}
                                            </p>
                                            <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                                                {news.featured.title}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed mb-4">
                                                {news.featured.excerpt || (news.featured.content && generateExcerpt(news.featured.content, 150)) || ''}
                                            </p>
                                            <div className="flex items-center text-[#004AAD] font-medium">
                                                Baca Selengkapnya
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* News List */}
                            <div className="space-y-4">
                                {news.recent && news.recent.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={`/berita/${item.slug}`}
                                        className="flex gap-4 bg-white rounded-xl p-4 shadow hover:shadow-lg transition-shadow duration-300 group"
                                    >
                                        <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                            <img
                                                src={item.thumbnail_url || "https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=200&h=150&fit=crop"}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[#004AAD] text-xs mb-2">
                                                {formatDate(item.created_at)}
                                            </p>
                                            <h4 className="text-base font-semibold text-gray-800 line-clamp-2 group-hover:text-[#004AAD] transition-colors mb-2">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center text-[#004AAD] font-medium text-sm">
                                                Baca Selengkapnya
                                                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="text-center mt-10 md:hidden">
                            <Link
                                to="/berita"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#004AAD] hover:bg-blue-700 text-white font-medium rounded-4xl transition-colors"
                            >
                                Lihat Semua
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* CTA Section */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mx-auto">
                        {/* Image */}
                        <div className="order-2 lg:order-1">
                            <div className="relative">
                                <div className="relative">
                                    <img
                                        src={image_home_1}
                                        alt="Students Learning"
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="order-1 lg:order-2">
                            <div className="inline-block bg-[#004AAD33] text-[#004AAD] px-5 py-2 rounded-full text-sm font-medium mb-4">
                                Hubungi Kami
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Butuh Informasi <span className="text-red-500">Lebih Lanjut?</span>
                            </h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Hubungi kami untuk informasi pendaftaran, program, dan pertanyaan lainnya. Tim kami siap membantu Anda!
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 mb-8">
                                {/* Kolom Telepon */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Telepon</h4>
                                    <a
                                        href={`tel:${contact.telepon}`}
                                        className="text-gray-600 hover:text-blue-600"
                                    >
                                        {contact.telepon}
                                    </a>
                                </div>

                                {/* Kolom Email */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Email</h4>
                                    <a
                                        href={`mailto:${contact.email}`}
                                        className="text-gray-600 hover:text-blue-600"
                                    >
                                        {contact.email}
                                    </a>
                                </div>

                                {/* Kolom Alamat */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Alamat</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {contact.alamat}
                                    </p>
                                </div>

                                {/* Kolom Sosial Media */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-3">Sosial Media</h4>
                                    <div className="flex gap-3">
                                        {contact.socials && contact.socials.length > 0 ? (
                                            contact.socials.slice(0, 3).map((social) => (
                                                <a
                                                    key={social.id}
                                                    href={social.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 bg-gray-100 hover:bg-[#004AAD] hover:text-white rounded-lg flex items-center justify-center transition-colors"
                                                    title={social.platform}
                                                >
                                                    {getSocialIcon(social.platform)}
                                                </a>
                                            ))
                                        ) : (
                                            <>
                                                <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-[#004AAD] hover:text-white rounded-lg flex items-center justify-center transition-colors">
                                                    <MessageCircle className="w-5 h-5" />
                                                </a>
                                                <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-[#004AAD] hover:text-white rounded-lg flex items-center justify-center transition-colors">
                                                    <Instagram className="w-5 h-5" />
                                                </a>
                                                <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-[#004AAD] hover:text-white rounded-lg flex items-center justify-center transition-colors">
                                                    <Youtube className="w-5 h-5" />
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="pb-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                        <div className="aspect-video w-full">
                            <iframe
                                src={contact.map_embed}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Lokasi SDI Ikhlas Bakti Umat"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default HomePage;