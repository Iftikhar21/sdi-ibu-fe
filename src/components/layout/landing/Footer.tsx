import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, Globe, Facebook, Instagram, Twitter, Youtube, Phone, Mail, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import logo_sdi from "@/assets/img/logo-sdi-ibu.svg";
import api from '../../../api/api';

interface SocialMedia {
    id: number;
    platform: string;
    url: string;
}

interface ContactData {
    id: number;
    logo?: string;
    deskripsi: string;
    alamat: string;
    telepon: string;
    email: string;
    map_embed: string;
    logo_url?: string;
    socials: SocialMedia[];
}

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [contactData, setContactData] = useState<ContactData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const profilLinks = [
        { name: 'Sejarah', path: '/profil/sejarah' },
        { name: 'Visi Misi', path: '/profil/visi-misi' },
        { name: 'Program Unggulan', path: '/profil/program' },
    ];

    const navLinks = [
        { name: 'Beranda', path: '/' },
        { name: 'Berita', path: '/berita' },
        { name: 'Pendaftaran', path: '/pendaftaran' },
        { name: 'Kontak', path: '/kontak' },
    ];

    useEffect(() => {
        const fetchContactData = async () => {
            try {
                // Gunakan api dari file api.ts yang sudah Anda buat
                const response = await api.get('/kontak');
                if (response.data.success) {
                    setContactData(response.data.data);
                } else {
                    setError('Gagal mengambil data kontak');
                }
            } catch (err) {
                console.error('Error fetching contact data:', err);
                setError('Terjadi kesalahan saat mengambil data');
            } finally {
                setLoading(false);
            }
        };

        fetchContactData();
    }, []);

    // Fungsi untuk mendapatkan icon berdasarkan platform menggunakan lucide-react
    const getSocialIcon = (platform: string, className = "w-4 h-4") => {
        const platformLower = platform.toLowerCase();

        switch (platformLower) {
            case 'whatsapp':
                return <MessageCircle className={className} />;
            case 'instagram':
                return <Instagram className={className} />;
            case 'twitter':
            case 'x':
                return <Twitter className={className} />;
            case 'facebook':
                return <Facebook className={className} />;
            case 'youtube':
                return <Youtube className={className} />;
            case 'website':
            case 'web':
                return <Globe className={className} />;
            case 'telegram':
                return <MessageSquare className={className} />;
            case 'tiktok':
                // Untuk TikTok, kita bisa gunakan icon MessageSquare atau buat custom
                // Karena lucide-react tidak punya icon TikTok, kita gunakan icon serupa
                return <MessageSquare className={className} />;
            default:
                return <Globe className={className} />;
        }
    };

    // Fungsi untuk mendapatkan label aksesibilitas
    const getSocialLabel = (platform: string) => {
        const platformLower = platform.toLowerCase();

        switch (platformLower) {
            case 'whatsapp':
                return 'WhatsApp';
            case 'instagram':
                return 'Instagram';
            case 'twitter':
            case 'x':
                return 'Twitter/X';
            case 'facebook':
                return 'Facebook';
            case 'youtube':
                return 'YouTube';
            case 'website':
            case 'web':
                return 'Website';
            case 'telegram':
                return 'Telegram';
            case 'tiktok':
                return 'TikTok';
            default:
                return platform.charAt(0).toUpperCase() + platform.slice(1);
        }
    };

    if (loading) {
        return (
            <footer className="bg-[#004AAD] text-white">
                <div className="container mx-auto px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    <p className="mt-2">Memuat data footer...</p>
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-[#004AAD] text-white">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Logo & Tentang Kami */}
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="mr-3">
                                <img
                                    src={contactData?.logo_url || logo_sdi}
                                    className="h-32 w-32 object-contain"
                                    alt="Logo SDI"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = logo_sdi;
                                    }}
                                />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold leading-tight">
                                    SDI <span className="text-[#E9D21F]">IBU</span>
                                </h3>
                                {/* <h3 className="text-2xl font-bold leading-tight">
                                    <span className="text-[#E9D21F]">Bakti Umat</span>
                                </h3> */}
                            </div>
                        </div>

                        <div className="border-t border-white/30 pt-4 mt-4">
                            <h4 className="font-semibold mb-3 text-base">Tentang Kami</h4>
                            <p className="text-white/80 text-sm leading-relaxed">
                                {contactData?.deskripsi || "SD Islam (SDI) didirikan untuk menghadirkan pendidikan dasar yang mengintegrasikan ilmu pengetahuan, nilai keislaman, dan pembentukan karakter sejak usia dini."}
                            </p>
                        </div>
                    </div>

                    {/* Profil */}
                    <div>
                        <h4 className="font-semibold mb-4 text-base border-b border-white/30 pb-3">Profil</h4>
                        <ul className="space-y-3">
                            {profilLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-white/80 hover:text-white transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Navigasi Cepat */}
                    <div>
                        <h4 className="font-semibold mb-4 text-base border-b border-white/30 pb-3">Navigasi Cepat</h4>
                        <ul className="space-y-3">
                            {navLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-white/80 hover:text-white transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Alamat & Kontak */}
                    <div>
                        <h4 className="font-semibold mb-4 text-base border-b border-white/30 pb-3">Alamat & Kontak</h4>
                        <div className="space-y-6">
                            {/* Alamat */}
                            <div className="flex items-start">
                                <MapPin className="w-4 h-4 text-white mt-0.5 mr-2 flex-shrink-0" />
                                <div>
                                    <p className="text-white/80 text-sm leading-relaxed">
                                        {contactData?.alamat || "Jl. Dalang, RT12/RW.5, Murijul, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13850"}
                                    </p>
                                </div>
                            </div>

                            {/* Map Embed */}
                            {contactData?.map_embed && (
                                <div>
                                    <h5 className="font-semibold mb-3 text-sm">Lokasi Kami</h5>
                                    <div className="h-48 rounded-lg overflow-hidden border border-white/20">
                                        <iframe
                                            src={contactData.map_embed}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="Lokasi SDI Ikhlas Bakti Umat"
                                            className="bg-gray-100"
                                        ></iframe>
                                    </div>
                                </div>
                            )}

                            {/* Kontak Telepon & Email */}
                            {(contactData?.telepon || contactData?.email) && (
                                <div className="space-y-2">
                                    {contactData?.telepon && (
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 text-white mr-2 flex-shrink-0" />
                                            <a
                                                href={`https://wa.me/${contactData.telepon.startsWith("0")
                                                        ? `62${contactData.telepon.slice(1)}`
                                                        : contactData.telepon
                                                    }`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white/80 text-sm hover:text-white transition-colors"
                                            >
                                                {contactData.telepon}
                                            </a>
                                        </div>
                                    )}
                                    {contactData?.email && (
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 text-white mr-2 flex-shrink-0" />
                                            <a
                                                href={`mailto:${contactData.email}`}
                                                className="text-white/80 text-sm hover:text-white transition-colors"
                                            >
                                                {contactData.email}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Social Media */}
                            <div>
                                <h5 className="font-semibold mb-3 text-sm">Sosial Media</h5>
                                <div className="flex flex-wrap gap-2">
                                    {contactData?.socials && contactData.socials.length > 0 ? (
                                        contactData.socials.map((social) => (
                                            <a
                                                key={social.id}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-white/10 hover:bg-white/20 w-9 h-9 rounded flex items-center justify-center transition-colors"
                                                aria-label={getSocialLabel(social.platform)}
                                                title={getSocialLabel(social.platform)}
                                            >
                                                {getSocialIcon(social.platform)}
                                            </a>
                                        ))
                                    ) : (
                                        <>
                                            {/* Default social media jika tidak ada data */}
                                            <button
                                                className="bg-white/10 hover:bg-white/20 w-9 h-9 rounded flex items-center justify-center transition-colors"
                                                aria-label="WhatsApp"
                                                title="WhatsApp"
                                                onClick={() => window.open('#', '_blank')}
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="bg-white/10 hover:bg-white/20 w-9 h-9 rounded flex items-center justify-center transition-colors"
                                                aria-label="Instagram"
                                                title="Instagram"
                                                onClick={() => window.open('#', '_blank')}
                                            >
                                                <Instagram className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="bg-white/10 hover:bg-white/20 w-9 h-9 rounded flex items-center justify-center transition-colors"
                                                aria-label="YouTube"
                                                title="YouTube"
                                                onClick={() => window.open('#', '_blank')}
                                            >
                                                <Youtube className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/20 mt-10 pt-6 text-center">
                    <p className="text-white text-sm font-medium">
                        © {currentYear} Sekolah Dasar Islam Ikhlas Bakti Umat. Hak cipta dilindungi.
                    </p>
                    {error && (
                        <p className="text-yellow-300 text-xs mt-2">
                            {error} - Menampilkan data default
                        </p>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default Footer;