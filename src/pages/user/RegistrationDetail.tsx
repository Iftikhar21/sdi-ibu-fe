import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Calendar,
    Phone,
    Mail,
    MapPin,
    FileText,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    Eye
} from 'lucide-react';
import { registrationService } from '../../services/registrationServices';
import type { Registration } from '../../types/registration';
import Layout from '../../components/layout/panel/MainLayout';
import { Helmet } from 'react-helmet-async';

export default function RegistrationDetail() {
    const { id } = useParams();
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');

    useEffect(() => {
        const fetchRegistration = async () => {
            try {
                const data = await registrationService.getById(Number(id));
                setRegistration(data);
            } catch (error) {
                console.error('Error fetching registration:', error);
                alert('Gagal memuat data pendaftaran');
            } finally {
                setLoading(false);
            }
        };

        fetchRegistration();
    }, [id]);

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
            submitted: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: <Clock className="w-5 h-5" />,
                text: 'Dikirim'
            },
            review: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: <Clock className="w-5 h-5" />,
                text: 'Dalam Review'
            },
            approved: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: <CheckCircle className="w-5 h-5" />,
                text: 'Diterima'
            },
            rejected: {
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: <XCircle className="w-5 h-5" />,
                text: 'Ditolak'
            },
        };

        return configs[status] || {
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            icon: <FileText className="w-5 h-5" />,
            text: status
        };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Fungsi untuk mendapatkan nama file dari URL
    const getFileNameFromUrl = (url: string, type: string): string => {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const fileName = pathname.split('/').pop() || `${type}.jpg`;

            // Hapus query parameters jika ada
            const cleanFileName = fileName.split('?')[0];

            // Buat nama file yang lebih baik
            const sanitizedName = registration?.full_name
                .replace(/\s+/g, '-')
                .replace(/[^a-zA-Z0-9\-]/g, '')
                .toLowerCase() || 'document';

            return `${type}-${sanitizedName}-${cleanFileName}`;
        } catch (error) {
            return `${type}-document.jpg`;
        }
    };

    // Fungsi untuk handle download
    const handleDownload = async (url: string, type: string) => {
        try {
            const fileName = getFileNameFromUrl(url, type);

            // Gunakan fetch untuk download
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
            // Jika download gagal, buka preview modal saja
            handleViewImage(url, type);
        }
    };

    // Fungsi untuk melihat gambar (preview modal)
    const handleViewImage = (url: string, type: string = '') => {
        setSelectedImage(url);
        setSelectedDocumentType(type);
        setShowImageModal(true);
    };

    // Fungsi untuk mendapatkan label dokumen berdasarkan type
    const getDocumentLabel = (type: string): string => {
        const labels: Record<string, string> = {
            'photo': 'Foto Calon Murid',
            'birth_certificate': 'Akte Kelahiran',
            'family_card': 'Kartu Keluarga',
            'payment_proof': 'Bukti Pembayaran'
        };
        return labels[type] || 'Dokumen';
    };

    if (loading) {
        return (
            <Layout title="Loading...">
                <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Memuat data pendaftaran...</p>
                </div>
            </Layout>
        );
    }

    if (!registration) {
        return (
            <Layout title="Data Tidak Ditemukan">
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
                    <p className="text-gray-600 mb-6">Pendaftaran yang Anda cari tidak ditemukan.</p>
                    <Link
                        to="/user/dashboard"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Dashboard
                    </Link>
                </div>
            </Layout>
        );
    }

    const statusConfig = getStatusConfig(registration.status);

    return (
        <>
            <Helmet>
                <title>User Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title={`Detail Pendaftaran - ${registration.full_name}`}>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Link
                                to="/user/dashboard"
                                className="inline-flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Detail Pendaftaran
                            </h1>
                        </div>
                        <p className="text-gray-600">
                            {registration.full_name} ({registration.nickname})
                        </p>
                    </div>
                    <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border ${statusConfig.color}`}>
                        {statusConfig.icon}
                        <span className="ml-2">{statusConfig.text}</span>
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Kolom Kiri: Data Pribadi */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Data Calon Murid */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                                Data Calon Murid
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Nama Lengkap
                                        </label>
                                        <div className="flex items-center text-gray-900">
                                            <User className="w-5 h-5 text-gray-400 mr-2" />
                                            {registration.full_name}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Nama Panggilan
                                        </label>
                                        <div className="flex items-center text-gray-900">
                                            <User className="w-5 h-5 text-gray-400 mr-2" />
                                            {registration.nickname}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Jenis Kelamin
                                        </label>
                                        <div className="flex items-center text-gray-900">
                                            <User className="w-5 h-5 text-gray-400 mr-2" />
                                            {registration.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Tempat, Tanggal Lahir
                                        </label>
                                        <div className="flex items-center text-gray-900">
                                            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                                            {registration.birth_place}, {formatDate(registration.birth_date)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Alamat
                                        </label>
                                        <div className="flex items-start text-gray-900">
                                            <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                                            <span className="flex-1">{registration.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Orang Tua */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                                Data Orang Tua
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Nama Ayah
                                        </label>
                                        <div className="flex items-center text-gray-900">
                                            <User className="w-5 h-5 text-gray-400 mr-2" />
                                            {registration.father_name}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Nama Ibu
                                        </label>
                                        <div className="flex items-center text-gray-900">
                                            <User className="w-5 h-5 text-gray-400 mr-2" />
                                            {registration.mother_name}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Nomor Telepon
                                        </label>
                                        <div className="flex items-center text-gray-900">
                                            <Phone className="w-5 h-5 text-gray-400 mr-2" />
                                            {registration.phone}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Email
                                        </label>
                                        <div className="flex items-center text-gray-900">
                                            <Mail className="w-5 h-5 text-gray-400 mr-2" />
                                            {registration.contact_email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan: Dokumen & Info */}
                    <div className="space-y-6">
                        {/* Status & Timeline */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                                Status Pendaftaran
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Status Saat Ini
                                    </label>
                                    <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${statusConfig.color}`}>
                                        {statusConfig.icon}
                                        <span className="ml-2">{statusConfig.text}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Tanggal Daftar
                                    </label>
                                    <div className="text-gray-900">
                                        {formatDate(registration.created_at)}
                                    </div>
                                </div>
                                {registration.notes && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Catatan
                                        </label>
                                        <div className="text-gray-900 bg-yellow-50 p-3 rounded-lg text-sm">
                                            {registration.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dokumen Pendukung */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                                Dokumen Pendukung
                            </h2>
                            <div className="space-y-4">
                                {/* Foto Preview */}
                                {registration.photo_url && (
                                    <div className="flex flex-col items-center"> {/* Tambahkan items-center di sini agar label & foto ke tengah */}
                                        <label className="w-full text-sm font-medium text-gray-600 mb-2 text-center md:text-left">
                                            Foto Calon Murid
                                        </label>

                                        <div className="relative rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm max-w-[200px] w-full group">
                                            <img
                                                src={registration.photo_url}
                                                alt="Foto"
                                                className="w-full aspect-square object-cover cursor-pointer transition-transform duration-300 group-hover:scale-110"
                                                onClick={() => handleViewImage(registration.photo_url, 'photo')}
                                            />

                                            {/* Overlay saat hover agar lebih interaktif */}
                                            <div
                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                                onClick={() => handleViewImage(registration.photo_url, 'photo')}
                                            >
                                                <Eye className="w-6 h-6 text-white" />
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-gray-400 mt-2 italic">Klik foto untuk memperbesar</p>
                                    </div>
                                )}

                                {/* Daftar Dokumen Lainnya */}
                                <div className="grid grid-cols-1 gap-3">
                                    {registration.birth_certificate_url && (
                                        <div
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group cursor-pointer"
                                            onClick={() => handleViewImage(registration.birth_certificate_url!, 'birth_certificate')}
                                        >
                                            <div className="flex items-center">
                                                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <span className="text-gray-900 block">Akte Kelahiran</span>
                                                    <span className="text-xs text-gray-500">
                                                        Klik untuk melihat dokumen
                                                    </span>
                                                </div>
                                            </div>
                                            <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                        </div>
                                    )}

                                    {registration.family_card_url && (
                                        <div
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group cursor-pointer"
                                            onClick={() => handleViewImage(registration.family_card_url!, 'family_card')}
                                        >
                                            <div className="flex items-center">
                                                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <span className="text-gray-900 block">Kartu Keluarga</span>
                                                    <span className="text-xs text-gray-500">
                                                        Klik untuk melihat dokumen
                                                    </span>
                                                </div>
                                            </div>
                                            <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                        </div>
                                    )}

                                    {registration.payment_proof_url && (
                                        <div
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group cursor-pointer"
                                            onClick={() => handleViewImage(registration.payment_proof_url!, 'payment_proof')}
                                        >
                                            <div className="flex items-center">
                                                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <span className="text-gray-900 block">Bukti Pembayaran</span>
                                                    <span className="text-xs text-gray-500">
                                                        Klik untuk melihat dokumen
                                                    </span>
                                                </div>
                                            </div>
                                            <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Preview Modal */}
                {showImageModal && selectedImage && (
                    <div
                        className="fixed inset-0 backdrop-blur-sm bg-opacity-75 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowImageModal(false)}
                    >
                        <div className="relative max-w-4xl w-full mx-auto my-auto bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col">
                            {/* Header */}
                            <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
                                <span className="font-medium">{getDocumentLabel(selectedDocumentType)}</span>
                                <button onClick={() => setShowImageModal(false)}>✕</button>
                            </div>

                            {/* Area Gambar - Pastikan ada overflow-hidden dan height yang jelas */}
                            <div className="bg-black flex items-center justify-center overflow-hidden" style={{ height: '60vh' }}>
                                <img
                                    src={selectedImage}
                                    className="max-w-full max-h-full object-contain"
                                    alt="Preview"
                                />
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-gray-50 border-t flex justify-end">
                                <button
                                    onClick={() => setShowImageModal(false)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        </>
    );
}