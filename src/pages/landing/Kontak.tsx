import MainLayout from "../../components/layout/landing/MainLayout";
import { Phone, Mail, MapPin, Share2, MessageCircle, Facebook, Instagram, Twitter, Youtube, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/api';
import bg_4 from "@/assets/img/bg_4.svg";

interface SocialMedia {
    id: number;
    platform: string;
    url: string;
    created_at: string;
    updated_at: string;
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

const KontakPage = () => {
    const [contactData, setContactData] = useState<ContactData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContactData();
    }, []);

    const fetchContactData = async () => {
        try {
            const response = await api.get('/kontak');
            if (response.data.success) {
                setContactData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching contact data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk mendapatkan icon berdasarkan platform
    const getSocialIcon = (platform: string, className = "w-5 h-5") => {
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
            default:
                return <Share2 className={className} />;
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
            default:
                return platform.charAt(0).toUpperCase() + platform.slice(1);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="relative h-[400px] lg:h-[800px] bg-gradient-to-r from-blue-900/90 to-blue-800/90">
                    <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                        <p>Memuat data kontak...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // Data default jika tidak ada data dari API
    const defaultAlamat = "Jl. Dalang, RT.12/RW.5, Munjul, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13850";
    const defaultTelepon = "0878-5248-2129";
    const defaultEmail = "SDIIkhlas@gmail.com";
    const defaultMapEmbed = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.5234!2d106.9234!3d-6.3234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTknMjQuMiJTIDEwNsKwNTUnMjQuMyJF!5e0!3m2!1sen!2sid!4v1234567890";

    return (
        <MainLayout>
            {/* Hero Section */}
            <div className="relative h-[400px] lg:h-[800px] bg-gradient-to-r from-blue-900/90 to-blue-800/90">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${bg_4}')`,
                        backgroundBlendMode: 'overlay'
                    }}
                />
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Hubungi <span className="text-yellow-400">Kami</span>
                    </h1>
                    <p className="text-lg text-gray-200 max-w-2xl">
                        Informasi dan layanan SDI Ikhlas Bakti Umat.
                    </p>
                </div>
            </div>

            {/* Contact Cards Section */}
            <div className="container mx-auto px-4 py-16">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-block bg-[#004AAD33] text-[#004AAD] px-5 py-2 rounded-full text-sm font-medium mb-4">
                        Kontak Kami
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        <span className="text-[#E13131]">Kontak</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Hubungi kami melalui berbagai saluran komunikasi yang tersedia
                    </p>
                </div>

                {/* Contact Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {/* Telepon Card */}
                    <div
                        className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center cursor-pointer"
                        onClick={() => {
                            const rawNumber = contactData?.telepon || defaultTelepon;
                            const waNumber = rawNumber.startsWith("0") ? `62${rawNumber.slice(1)}` : rawNumber;
                            window.open(`https://wa.me/${waNumber}`, "_blank");
                        }}
                    >
                        <div className="w-16 h-16 bg-[#004AAD33] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Phone className="w-7 h-7 text-[#004AAD]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Telepon</h3>
                        <a
                            href={`https://wa.me/${(contactData?.telepon || defaultTelepon).startsWith("0")
                                    ? `62${(contactData?.telepon || defaultTelepon).slice(1)}`
                                    : contactData?.telepon || defaultTelepon
                                }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-green-600 transition-colors block"
                            onClick={(e) => e.stopPropagation()} // supaya klik nomor tidak ganda
                        >
                            {contactData?.telepon || defaultTelepon}
                        </a>
                    </div>

                    {/* Email Card */}
                    <div className="bg-[#004AAD] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Email</h3>
                        <a
                            href={`mailto:${contactData?.email || defaultEmail}`}
                            className="text-white/90 hover:text-white transition-colors block"
                        >
                            {contactData?.email || defaultEmail}
                        </a>
                    </div>

                    {/* Alamat Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
                        <div className="w-16 h-16 bg-[#004AAD33] rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapPin className="w-7 h-7 text-[#004AAD]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Alamat</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {contactData?.alamat || defaultAlamat}
                        </p>
                    </div>

                    {/* Sosial Media Card */}
                    <div className="bg-[#004AAD] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Share2 className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-6">Sosial Media</h3>
                        <div className="flex justify-center gap-4">
                            {contactData?.socials && contactData.socials.length > 0 ? (
                                contactData.socials.map((social) => (
                                    <a
                                        key={social.id}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center transition-colors"
                                        aria-label={getSocialLabel(social.platform)}
                                        title={getSocialLabel(social.platform)}
                                    >
                                        {getSocialIcon(social.platform)}
                                    </a>
                                ))
                            ) : (
                                <>
                                    {/* Default social media jika tidak ada data */}
                                    <a
                                        href="#"
                                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                                        aria-label="WhatsApp"
                                    >
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </a>
                                    <a
                                        href="#"
                                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                                        aria-label="Twitter"
                                    >
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </a>
                                    <a
                                        href="#"
                                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                                        aria-label="Instagram"
                                    >
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                    <div className="aspect-video w-full">
                        <iframe
                            src={contactData?.map_embed || defaultMapEmbed}
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

                {/* Deskripsi Tambahan */}
                {contactData?.deskripsi && (
                    <div className="mt-12 bg-gray-50 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                            Tentang Kami
                        </h3>
                        <p className="text-gray-600 text-center max-w-2xl mx-auto leading-relaxed">
                            {contactData.deskripsi}
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default KontakPage;