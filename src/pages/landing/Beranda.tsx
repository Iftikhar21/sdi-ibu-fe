import { Link } from 'react-router-dom';
import MainLayout from "../../components/layout/landing/MainLayout";
import { ArrowRight, Award, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, HelpCircle, ImageOff, Images, Loader2, MessageCircle, Newspaper, Share2, Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/api';
import bg_5 from "@/assets/img/bg_5.png";
import ring_home from "@/assets/img/ring_home.svg";
import image_home_1 from "@/assets/img/image_home_1.svg";
import logo_sdi from '@/assets/img/logo-sdi-ibu.svg';
import image_visi_misi_2 from "@/assets/img/image_visi_misi_2.svg";
import bg_2 from "@/assets/img/bg_2.svg";
import { Helmet } from 'react-helmet-async';
import GalleryLightbox from '../../components/landing/GalleryLightbox';
import { galleryService } from '../../services/galleryServices';
import { useToast } from '../../context/toast';
import type { Gallery, GalleryCategory } from '../../types/gallery';
import type { Activity } from '../../types/activity';
import { getActivityTypeLabel } from '../../types/activity';

const taglineWords = ["Iman", "Adab", "Ilmu", "Amal"];

const buildWhatsAppUrl = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    const normalizedPhone = digits.startsWith("62")
        ? digits
        : `62${digits.replace(/^0/, "")}`;

    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(
        "Assalamualaikum, saya ingin bertanya tentang SPMB 2027/2028 di Sekolah IBU."
    )}`;
};

const WhatsAppIcon = ({ className = "h-7 w-7" }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

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

interface FaqData {
    id: number;
    question: string;
    answer: string;
    sort_order: number;
    is_active: boolean;
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
    faqs?: FaqData[];
    galleries?: Gallery[];
    activities?: Activity[];
    stats: {
        program_count: number;
        news_count: number;
        visi_misi_count: number;
    };
}

/**
 * Ambil daftar kategori unik dari album yang tampil, urut sesuai kemunculannya.
 */
const collectGalleryCategories = (albums: Gallery[]): GalleryCategory[] => {
    const unique = new Map<number, GalleryCategory>();

    albums.forEach((album) => {
        if (album.category && !unique.has(album.category.id)) {
            unique.set(album.category.id, album.category);
        }
    });

    // Ikuti urutan kategori yang diatur admin
    return [...unique.values()].sort((a, b) => a.sort_order - b.sort_order);
};

const HomePage = () => {
    const toast = useToast();
    const [homeData, setHomeData] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);
    const [openFaqId, setOpenFaqId] = useState<number | null>(null);
    const [galleryFilter, setGalleryFilter] = useState<number | 'all'>('all');
    const [openAlbum, setOpenAlbum] = useState<Gallery | null>(null);
    const [openPhotoIndex, setOpenPhotoIndex] = useState(0);
    const [activityTab, setActivityTab] = useState<'berita' | 'prestasi' | 'agenda'>('berita');
    const [loadingAlbumId, setLoadingAlbumId] = useState<number | null>(null);

    // Carousel beranda memakai foto sampul dari album galeri teratas,
    // dibatasi 6 album supaya halaman tidak memuat terlalu banyak gambar.
    const heroSlides = (homeData?.galleries ?? []).slice(0, 6).map((album) => ({
        id: album.id,
        image: album.photos[0]?.thumb_url ?? album.cover_url ?? '',
        title: album.title,
        category: album.category?.name ?? 'Galeri',
        album,
    }));

    const currentSlide = heroSlides.length > 0 ? activeSlide % heroSlides.length : 0;

    useEffect(() => {
        fetchHomeData();
    }, []);

    useEffect(() => {
        if (heroSlides.length < 2) return;

        const intervalId = window.setInterval(() => {
            setActiveSlide((current) => (current + 1) % heroSlides.length);
        }, 5000);

        return () => window.clearInterval(intervalId);
    }, [heroSlides.length]);

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

    const nextSlide = () => {
        setActiveSlide((current) => (current + 1) % heroSlides.length);
    };

    const previousSlide = () => {
        setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length);
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
    const whatsAppUrl = buildWhatsAppUrl(contact.telepon);
    const programs = homeData?.programs || [];
    const news = homeData?.news;
    const visiMisi = homeData?.welcome?.visi_misi;
    const sejarah = homeData?.welcome?.sejarah;
    const faqs = homeData?.faqs || [];
    const galleries = homeData?.galleries || [];
    const activities = homeData?.activities || [];
    const prestasiList = activities.filter((item) => item.type === 'prestasi');
    const agendaList = activities.filter((item) => item.type === 'agenda');

    // Kategori diambil dari album yang tampil (master kategori dikelola admin),
    // jadi filter hanya menampilkan kategori yang benar-benar ada isinya.
    const availableGalleryCategories = collectGalleryCategories(galleries);

    const visibleGalleries =
        galleryFilter === 'all'
            ? galleries
            : galleries.filter((album) => album.gallery_category_id === galleryFilter);

    // Data beranda hanya membawa foto sampul, jadi detail album diambil
    // saat album benar-benar dibuka (agar halaman tetap ringan).
    const openAlbumAt = async (album: Gallery, photoIndex = 0) => {
        if (loadingAlbumId) return;

        setLoadingAlbumId(album.id);
        try {
            const detail = await galleryService.getPublicDetail(album.id);

            setOpenAlbum(detail);
            setOpenPhotoIndex(photoIndex);
        } catch (error) {
            console.error('Error fetching gallery detail:', error);
            toast.error('Gagal membuka album galeri', 'Silakan coba lagi.');
        } finally {
            setLoadingAlbumId(null);
        }
    };

    // Generate excerpt dari sejarah
    const sejarahExcerpt = sejarah?.content
        ? generateExcerpt(sejarah.content, 200)
        : "SDI Ikhlas Bakti Umat hadir sebagai tempat belajar yang tidak hanya mengajarkan ilmu pengetahuan, tetapi juga menanamkan nilai keislaman dan karakter positif sejak dini. Kami percaya bahwa pendidikan dasar merupakan fondasi penting dalam membentuk masa depan anak.";

    // Ambil misi pertama atau default
    const misiFirst = visiMisi?.missions?.[0] || "Menyelenggarakan pendidikan yang berlandaskan Al-Qur'an dan Sunnah...";

    return (
        <MainLayout>
            <Helmet>
                <title>Sekolah IBU | Ikhlas Bakti Umat</title>

                <meta
                    name="description"
                    content="Sekolah IBU (Ikhlas Bakti Umat) adalah sekolah dasar Islam yang fokus pada pendidikan iman, adab, ilmu, dan amal."
                />

                <meta
                    name="keywords"
                    content="Sekolah IBU, Ikhlas Bakti Umat, Sekolah Dasar Islam, SD Islam, Sekolah Islam Terpadu"
                />

                {/* Open Graph (buat share WA / FB) */}
                <meta property="og:title" content="Sekolah IBU | Ikhlas Bakti Umat" />
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
                                Sekolah
                                <span className="text-white"> IBU<br />(Ikhlas Bakti Umat)</span>
                            </h1>

                            <div className="mb-8 inline-flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white shadow-lg shadow-black/10 backdrop-blur-md lg:justify-start">
                                {taglineWords.map((word, index) => (
                                    <span key={word} className="flex items-center gap-3">
                                        {index > 0 && <span className="text-[#E9D21F]">•</span>}
                                        <span className="text-sm font-bold uppercase tracking-[0.2em] sm:text-base">
                                            {word}
                                        </span>
                                    </span>
                                ))}
                            </div>

                            <p className="text-lg text-muted mb-8 max-w-lg mx-auto lg:mx-0">
                                Mendidik dengan Iman, Membimbing dengan Adab dan Akhlak Mulia. Pendidikan Iman dan Adab Terintegrasi dalam Kurikulum dan Lingkungan Sekolah.
                            </p>
                            <Link
                                to="/pendaftaran"
                                className="inline-flex items-center gap-3 px-8 py-3 bg-accent hover:bg-yellow-500 text-white font-semibold rounded-full transition-colors shadow-lg"
                            >
                                SPMB 2027/2028
                                <ArrowRight className="h-5 w-5" />
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
                                    alt="Sekolah IBU Students"
                                    className="w-[88%] h-[88%] object-cover"
                                    style={{ clipPath: "polygon(50% 0%, 65% 15%, 85% 15%, 85% 35%, 100% 50%, 85% 65%, 85% 85%, 65% 85%, 50% 100%, 35% 85%, 15% 85%, 15% 65%, 0% 50%, 15% 35%, 15% 15%, 35% 15%)" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Carousel Section — diisi dari album galeri */}
            {heroSlides.length > 0 && (
                <section className="relative overflow-hidden bg-surface py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto mb-10 max-w-3xl text-center">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand/10 px-5 py-2 text-sm font-medium text-brand">
                                <Images className="h-4 w-4" />
                                Galeri Kegiatan
                            </div>
                            <h2 className="text-3xl font-bold text-body md:text-4xl">
                                Momen Belajar & Bermain di <span className="text-accent">Sekolah IBU</span>
                            </h2>
                            <p className="mt-3 text-muted">
                                Dokumentasi kegiatan anak-anak dalam belajar, bermain, dan tumbuh bersama.
                            </p>
                        </div>

                        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] shadow-2xl">
                            <button
                                type="button"
                                onClick={() => openAlbumAt(heroSlides[currentSlide].album)}
                                aria-label={`Buka album ${heroSlides[currentSlide].title}`}
                                className="relative block aspect-[4/3] w-full cursor-zoom-in bg-slate-900 sm:aspect-[16/9]"
                            >
                                {heroSlides.map((slide, index) => (
                                    <img
                                        key={slide.id}
                                        src={slide.image}
                                        alt={slide.title}
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                        decoding="async"
                                        className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-out ${
                                            index === currentSlide
                                                ? 'scale-100 opacity-100'
                                                : 'scale-105 opacity-0'
                                        }`}
                                    />
                                ))}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                            </button>

                            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                                <div className="pointer-events-none">
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                                        {heroSlides[currentSlide].category}
                                    </p>
                                    <p className="text-lg font-bold text-white">
                                        {heroSlides[currentSlide].title}
                                    </p>
                                    <p className="mt-1 text-xs text-white/60">
                                        Slide {currentSlide + 1} dari {heroSlides.length} • klik gambar untuk
                                        melihat semua foto
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={previousSlide}
                                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-md transition hover:bg-surface hover:text-brand"
                                        aria-label="Slide sebelumnya"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextSlide}
                                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-md transition hover:bg-surface hover:text-brand"
                                        aria-label="Slide berikutnya"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="absolute left-1/2 top-5 flex -translate-x-1/2 gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-md">
                                {heroSlides.map((slide, index) => (
                                    <button
                                        key={slide.id}
                                        type="button"
                                        onClick={() => setActiveSlide(index)}
                                        className={`h-2.5 rounded-full transition-all duration-300 ${
                                            index === currentSlide
                                                ? 'w-8 bg-surface'
                                                : 'w-2.5 bg-white/50 hover:bg-surface/80'
                                        }`}
                                        aria-label={`Tampilkan slide ${index + 1}`}
                                        aria-current={index === currentSlide}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Welcome Section */}
            <div className="py-20 bg-surface relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    {/* HEADER: Logo dan Judul di Tengah Atas */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-24 h-24 mb-6">
                            <img src={logo_sdi} alt="Logo SDI" className="w-full h-full object-contain" />
                        </div>
                        <p className="text-body font-semibold text-lg mb-2">
                            Selamat Datang di Sekolah IBU
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold text-body">
                            Belajar, Berakhlak, dan <span className="text-red-600">Berprestasi</span>
                        </h2>
                    </div>

                    {/* KONTEN UTAMA: Grid 2 Kolom */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-start">
                        {/* KOLOM KIRI: Deskripsi & Tombol */}
                        <div className="flex flex-col items-start text-left">
                            <div className="text-muted text-lg leading-relaxed space-y-6 mb-10">
                                <p>
                                    {sejarahExcerpt}
                                </p>
                            </div>

                            <Link
                                to="/profil/sejarah"
                                className="inline-block px-10 py-3 bg-brand hover:bg-gray-700 text-white font-bold rounded-full transition-all shadow-lg"
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
                                    <h3 className="text-2xl font-bold text-body mb-2">Visi Kami</h3>
                                    <p className="text-muted text-lg italic">
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
                                    <h3 className="text-2xl font-bold text-body mb-2">Misi Kami</h3>
                                    <p className="text-muted text-lg leading-relaxed">
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
                    <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-surface via-surface/90 to-transparent" />

                    {/* White Gradient Bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-surface via-surface/90 to-transparent" />

                    {/* Soft overlay agar konten tetap terbaca */}
                    <div className="absolute inset-0 bg-surface/30" />

                    {/* Content Container */}
                    <div className="relative container mx-auto px-4 z-10">
                        {/* Section Header */}
                        <div className="text-center mb-12">
                            <div className="inline-block bg-brand/20 text-brand px-5 py-2 rounded-full text-sm font-medium mb-4">
                                Program Kami
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Program <span className="text-accent">Unggulan</span>
                            </h2>
                            <p className="text-muted max-w-2xl mx-auto">
                                Program pendidikan Al-Quran untuk berbagai usia dengan kurikulum terstruktur
                            </p>
                        </div>

                        {/* Program Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {programs.map((program) => (
                                <div
                                    key={program.id}
                                    className="bg-surface rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-b-[12px] border-brand"
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
                                        <h3 className="text-xl font-bold text-body mb-3">
                                            {program.title}
                                        </h3>
                                        <p className="text-muted text-sm leading-relaxed mb-6">
                                            {generateExcerpt(program.description, 120)}
                                        </p>

                                        {/* Arrow Link */}
                                        <Link
                                            to={`/program/${program.slug}`}
                                            className="w-12 h-12 bg-brand hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-300 ml-auto shadow-md"
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

            {/* Kegiatan Section — Berita, Prestasi, Agenda Sekolah */}
            {(news || prestasiList.length > 0 || agendaList.length > 0) && (
                <div className="py-20 bg-surface">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto mb-10 max-w-3xl text-center">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand/20 px-5 py-2 text-sm font-medium text-brand">
                                <CalendarDays className="h-4 w-4" />
                                Kegiatan Sekolah
                            </div>
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                Kabar & <span className="text-accent">Kegiatan Terbaru</span>
                            </h2>
                            <p className="text-muted">
                                Berita terbaru, prestasi yang diraih, dan agenda kegiatan Sekolah IBU.
                            </p>
                        </div>

                        {/* Tab jenis kegiatan */}
                        <div className="mb-10 flex flex-wrap justify-center gap-2">
                            {[
                                { value: 'berita' as const, label: 'Berita', icon: Newspaper },
                                { value: 'prestasi' as const, label: 'Prestasi', icon: Award },
                                { value: 'agenda' as const, label: 'Agenda Sekolah', icon: CalendarDays },
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setActivityTab(tab.value)}
                                    className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                                        activityTab === tab.value
                                            ? 'border-brand bg-brand text-white'
                                            : 'border-line bg-surface text-muted hover:bg-surface-muted'
                                    }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Berita */}
                        {activityTab === 'berita' &&
                            (news ? (
                                <>
                                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                        {news.featured && (
                                            <Link to={`/berita/${news.featured.slug}`} className="group">
                                                <div className="overflow-hidden rounded-2xl bg-surface shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                                    <div className="relative h-64 overflow-hidden">
                                                        <img
                                                            src={
                                                                news.featured.thumbnail_url ||
                                                                'https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=800&h=400&fit=crop'
                                                            }
                                                            alt={news.featured.title}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                    </div>
                                                    <div className="p-6">
                                                        <p className="mb-2 text-sm font-medium text-brand">
                                                            {formatDate(news.featured.created_at)}
                                                        </p>
                                                        <h3 className="mb-3 text-2xl font-bold text-body transition-colors group-hover:text-brand">
                                                            {news.featured.title}
                                                        </h3>
                                                        <p className="mb-4 leading-relaxed text-muted">
                                                            {news.featured.excerpt ||
                                                                (news.featured.content &&
                                                                    generateExcerpt(
                                                                        news.featured.content,
                                                                        150
                                                                    )) ||
                                                                ''}
                                                        </p>
                                                        <div className="flex items-center font-medium text-brand">
                                                            Baca Selengkapnya
                                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        )}

                                        <div className="space-y-4">
                                            {news.recent &&
                                                news.recent.map((item) => (
                                                    <Link
                                                        key={item.id}
                                                        to={`/berita/${item.slug}`}
                                                        className="group flex gap-4 rounded-xl bg-surface p-4 shadow transition-shadow duration-300 hover:shadow-lg"
                                                    >
                                                        <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                                                            <img
                                                                src={
                                                                    item.thumbnail_url ||
                                                                    'https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=200&h=150&fit=crop'
                                                                }
                                                                alt={item.title}
                                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="mb-2 text-xs text-brand">
                                                                {formatDate(item.created_at)}
                                                            </p>
                                                            <h4 className="mb-2 line-clamp-2 text-base font-semibold text-body transition-colors group-hover:text-brand">
                                                                {item.title}
                                                            </h4>
                                                            <div className="flex items-center text-sm font-medium text-brand">
                                                                Baca Selengkapnya
                                                                <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                        </div>
                                    </div>

                                    <div className="mt-10 text-center">
                                        <Link
                                            to="/berita"
                                            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-strong"
                                        >
                                            Lihat Semua Berita
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <p className="py-10 text-center text-muted">
                                    Belum ada berita yang ditampilkan.
                                </p>
                            ))}

                        {/* Tab Prestasi & Agenda */}
                        {(activityTab === 'prestasi' || activityTab === 'agenda') &&
                            (() => {
                                const list =
                                    activityTab === 'prestasi' ? prestasiList : agendaList;

                                if (list.length === 0) {
                                    return (
                                        <p className="py-10 text-center text-muted">
                                            Belum ada {getActivityTypeLabel(activityTab).toLowerCase()}{' '}
                                            yang ditampilkan.
                                        </p>
                                    );
                                }

                                return (
                                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                        {list.map((item) => (
                                            <div
                                                key={item.id}
                                                className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg transition-transform duration-300 hover:-translate-y-1"
                                            >
                                                <div className="aspect-video bg-surface-muted">
                                                    {item.image_url ? (
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.title}
                                                            loading="lazy"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <ImageOff className="h-10 w-10 text-muted" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-6">
                                                    <span className="inline-block rounded-full bg-brand/20 px-3 py-1 text-xs font-medium text-brand">
                                                        {item.type_label ??
                                                            getActivityTypeLabel(item.type)}
                                                    </span>
                                                    <h3 className="mt-3 text-lg font-semibold text-body">
                                                        {item.title}
                                                    </h3>
                                                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                    </div>
                </div>
            )}

            {/* Gallery Section */}
            {galleries.length > 0 && (
                <div id="galeri" className="scroll-mt-24 bg-surface py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto mb-10 max-w-3xl text-center">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand/20 px-5 py-2 text-sm font-medium text-brand">
                                <Images className="h-4 w-4" />
                                Galeri Kegiatan
                            </div>
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                Dokumentasi <span className="text-accent">Kegiatan Sekolah</span>
                            </h2>
                            <p className="text-muted">
                                Kumpulan momen pembelajaran, ibadah, dan kegiatan lainnya di Sekolah IBU.
                            </p>
                        </div>

                        {/* Filter kategori */}
                        <div className="mb-10 flex flex-wrap justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => setGalleryFilter('all')}
                                className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                                    galleryFilter === 'all'
                                        ? 'border-brand bg-brand text-white'
                                        : 'border-line bg-surface text-muted hover:bg-surface-muted'
                                }`}
                            >
                                Semua
                            </button>

                            {availableGalleryCategories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => setGalleryFilter(category.id)}
                                    className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                                        galleryFilter === category.id
                                            ? 'border-brand bg-brand text-white'
                                            : 'border-line bg-surface text-muted hover:bg-surface-muted'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        {/* Album */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {visibleGalleries.map((album) => (
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
                                        <h3 className="mb-2 text-lg font-semibold text-body transition-colors group-hover:text-brand">
                                            {album.title}
                                        </h3>
                                        {album.description && (
                                            <p className="line-clamp-2 text-sm text-muted">
                                                {album.description}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-10 text-center">
                            <Link
                                to="/galeri"
                                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-strong"
                            >
                                Lihat Semua Galeri
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* FAQ Section */}
            {faqs.length > 0 && (
                <div className="py-20 bg-surface-muted">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 bg-brand/20 text-brand px-5 py-2 rounded-full text-sm font-medium mb-4">
                                <HelpCircle className="w-4 h-4" />
                                Tanya Jawab
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Pertanyaan yang Sering <span className="text-accent">Ditanyakan</span>
                            </h2>
                            <p className="text-muted max-w-2xl mx-auto">
                                Belum menemukan jawabannya? Silakan hubungi kami melalui WhatsApp atau halaman kontak.
                            </p>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-4">
                            {faqs.map((faq) => {
                                const isOpen = openFaqId === faq.id;

                                return (
                                    <div
                                        key={faq.id}
                                        className="bg-surface rounded-2xl shadow-sm border border-line overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                                            aria-expanded={isOpen}
                                            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-200 hover:bg-surface-muted"
                                        >
                                            <span className="text-base font-semibold text-body sm:text-lg">
                                                {faq.question}
                                            </span>
                                            <span
                                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${isOpen ? 'bg-brand text-white' : 'bg-brand/10 text-brand'
                                                    }`}
                                            >
                                                <ChevronDown
                                                    className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                                />
                                            </span>
                                        </button>

                                        <div
                                            className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                                }`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="px-6 pb-6 text-muted leading-relaxed whitespace-pre-line">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* CTA Section */}
            <div className="py-20 bg-surface">
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
                            <div className="inline-block bg-brand/20 text-brand px-5 py-2 rounded-full text-sm font-medium mb-4">
                                Hubungi Kami
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Butuh Informasi <span className="text-red-500">Lebih Lanjut?</span>
                            </h2>
                            <p className="text-muted mb-8 leading-relaxed">
                                Hubungi kami untuk informasi pendaftaran, program, dan pertanyaan lainnya. Tim kami siap membantu Anda!
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 mb-8">
                                {/* Kolom Telepon */}
                                <div>
                                    <h4 className="font-semibold text-body mb-2">Telepon</h4>
                                    <a
                                        href={`tel:${contact.telepon}`}
                                        className="text-muted hover:text-blue-600"
                                    >
                                        {contact.telepon}
                                    </a>
                                </div>

                                {/* Kolom Email */}
                                <div>
                                    <h4 className="font-semibold text-body mb-2">Email</h4>
                                    <a
                                        href={`mailto:${contact.email}`}
                                        className="text-muted hover:text-blue-600"
                                    >
                                        {contact.email}
                                    </a>
                                </div>

                                {/* Kolom Alamat */}
                                <div>
                                    <h4 className="font-semibold text-body mb-2">Alamat</h4>
                                    <p className="text-muted text-sm leading-relaxed">
                                        {contact.alamat}
                                    </p>
                                </div>

                                {/* Kolom Sosial Media */}
                                <div>
                                    <h4 className="font-semibold text-body mb-3">Sosial Media</h4>
                                    <div className="flex gap-3">
                                        {contact.socials && contact.socials.length > 0 ? (
                                            contact.socials.slice(0, 3).map((social) => (
                                                <a
                                                    key={social.id}
                                                    href={social.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 bg-surface-muted hover:bg-brand hover:text-white rounded-lg flex items-center justify-center transition-colors"
                                                    title={social.platform}
                                                >
                                                    {getSocialIcon(social.platform)}
                                                </a>
                                            ))
                                        ) : (
                                            <>
                                                <a href="#" className="w-10 h-10 bg-surface-muted hover:bg-brand hover:text-white rounded-lg flex items-center justify-center transition-colors">
                                                    <MessageCircle className="w-5 h-5" />
                                                </a>
                                                <a href="#" className="w-10 h-10 bg-surface-muted hover:bg-brand hover:text-white rounded-lg flex items-center justify-center transition-colors">
                                                    <Instagram className="w-5 h-5" />
                                                </a>
                                                <a href="#" className="w-10 h-10 bg-surface-muted hover:bg-brand hover:text-white rounded-lg flex items-center justify-center transition-colors">
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
            <div className="pb-20 bg-surface">
                <div className="container mx-auto px-4">
                    <div className="bg-surface rounded-2xl overflow-hidden shadow-lg">
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

            {/* Floating WhatsApp */}
            <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-black/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1ebe5d]"
                aria-label="Hubungi Kami via WhatsApp"
            >
                <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
                <WhatsAppIcon className="relative h-7 w-7" />
            </a>

            {/* Lightbox Galeri */}
            <GalleryLightbox
                album={openAlbum}
                photoIndex={openPhotoIndex}
                onClose={() => setOpenAlbum(null)}
                onIndexChange={setOpenPhotoIndex}
            />
        </MainLayout>
    );
};

export default HomePage;
