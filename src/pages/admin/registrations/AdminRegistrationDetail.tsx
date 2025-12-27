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
    Eye,
    Edit,
    Printer,
    User as UserIcon,
    X,
    FileDown
} from 'lucide-react';
import { registrationService } from '../../../services/registrationServices';
import Layout from '../../../components/layout/panel/MainLayout';
import type { Registration } from '../../../types/registration';

interface RegistrationWithUser extends Registration {
    user?: {
        id: number;
        name: string;
        email: string;
        created_at: string;
    };
}

// Komponen Modal untuk Preview
function ImagePreviewModal({
    isOpen,
    onClose,
    imageUrl,
    title
}: {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    title: string;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header Modal */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Konten Gambar */}
                <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                    <div className="flex justify-center">
                        <img
                            src={imageUrl}
                            alt={title}
                            className="max-w-full max-h-[70vh] object-contain rounded-lg"
                        />
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

// Komponen untuk Surat Penerimaan
function AcceptanceLetterModal({
    isOpen,
    onClose,
    registration,
    onGeneratePDF
}: {
    isOpen: boolean;
    onClose: () => void;
    registration: RegistrationWithUser;
    onGeneratePDF: () => void;
}) {
    if (!isOpen) return null;

    const getCurrentDate = () => {
        return new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header Modal */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Surat Penerimaan</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            SDI Ikhlas Bakti Umat • {registration.full_name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Konten Surat */}
                <div className="p-6 overflow-auto max-h-[calc(90vh-180px)]" id="acceptance-letter-content">
                    <div className="max-w-4xl mx-auto">
                        {/* Kop Surat */}
                        <div className="text-center mb-8 border-b pb-6">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-blue-800">SDI IKHLAS BAKTI UMAT</h1>
                            </div>
                            <p className="text-gray-600">Jl. Pendidikan No. 123, Kota Pendidikan, 12345</p>
                            <p className="text-gray-600">Telp: (021) 1234567 • Email: admin@sdiikhlasbakti.sch.id</p>
                        </div>

                        {/* Isi Surat */}
                        <div className="space-y-6">
                            <div className="text-right">
                                <p className="text-gray-700">Nomor: {registration.id}/SI-IBU/{new Date().getFullYear()}</p>
                                <p className="text-gray-700">Lamp: -</p>
                                <p className="text-gray-700">Hal: Pemberitahuan Penerimaan Siswa Baru</p>
                            </div>

                            <div>
                                <p className="text-gray-700 mb-4">Kepada Yth.</p>
                                <div className="ml-8">
                                    <p className="text-gray-900 font-semibold text-lg">Orang Tua/Wali dari</p>
                                    <p className="text-gray-900 font-bold text-xl">{registration.full_name}</p>
                                    <p className="text-gray-700">{registration.address}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-700 mb-4">
                                    Dengan hormat,
                                </p>
                                <p className="text-gray-700 mb-4">
                                    Berdasarkan hasil seleksi penerimaan siswa baru tahun ajaran {new Date().getFullYear()}/{new Date().getFullYear() + 1},
                                    kami dengan senang hati mengumumkan bahwa:
                                </p>

                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                                    <p className="text-center text-blue-800 font-bold text-lg">
                                        {registration.full_name}
                                    </p>
                                    <p className="text-center text-blue-700">
                                        DITERIMA sebagai siswa baru di SDI Ikhlas Bakti Umat
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-gray-700">
                                        Selamat! Putra/Putri Anda telah memenuhi persyaratan dan dinyatakan lulus seleksi penerimaan siswa baru.
                                    </p>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-bold text-gray-800 mb-3">Informasi Penting:</h4>
                                        <ul className="list-disc ml-5 space-y-2">
                                            <li className="text-gray-700">
                                                <span className="font-semibold">Waktu Daftar Ulang:</span> 1-7 Juli {new Date().getFullYear()}
                                            </li>
                                            <li className="text-gray-700">
                                                <span className="font-semibold">Tempat:</span> Kantor Tata Usaha SDI Ikhlas Bakti Umat
                                            </li>
                                            <li className="text-gray-700">
                                                <span className="font-semibold">Dokumen yang dibawa:</span> Fotokopi akte kelahiran, KK, dan bukti pembayaran uang pangkal
                                            </li>
                                            <li className="text-gray-700">
                                                <span className="font-semibold">Awal Masuk Sekolah:</span> 15 Juli {new Date().getFullYear()}
                                            </li>
                                        </ul>
                                    </div>

                                    <p className="text-gray-700">
                                        Harap datang tepat waktu sesuai jadwal di atas dengan membawa dokumen asli untuk verifikasi.
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <p className="text-gray-700 mb-2">Demikian surat pemberitahuan ini kami sampaikan.</p>
                                    <p className="text-gray-700">Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>
                                </div>

                                <div className="mt-12 text-right">
                                    <p className="text-gray-700 mb-2">Hormat kami,</p>
                                    <p className="text-gray-700 font-bold">Kepala Sekolah</p>
                                    <div className="mt-16">
                                        <p className="text-gray-800 font-bold">Dr. Ahmad Syafii, M.Pd.</p>
                                        <p className="text-gray-600">NIP. 196512312345678901</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Surat */}
                        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                            <p>Surat ini sah dan dapat digunakan sebagai bukti penerimaan siswa baru</p>
                            <p>Dicetak pada: {getCurrentDate()}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Tutup
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            Cetak
                        </button>
                        <button
                            onClick={onGeneratePDF}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <FileDown className="w-4 h-4" />
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminRegistrationDetail() {
    const { id } = useParams();
    const [registration, setRegistration] = useState<RegistrationWithUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [previewModal, setPreviewModal] = useState<{
        isOpen: boolean;
        imageUrl: string;
        title: string;
    }>({
        isOpen: false,
        imageUrl: '',
        title: ''
    });
    const [acceptanceLetterModal, setAcceptanceLetterModal] = useState(false);

    useEffect(() => {
        const fetchRegistration = async () => {
            try {
                const data = await registrationService.getRegistrationById(Number(id));
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

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const openPreviewModal = (imageUrl: string, title: string) => {
        setPreviewModal({
            isOpen: true,
            imageUrl,
            title
        });
    };

    const closePreviewModal = () => {
        setPreviewModal({
            isOpen: false,
            imageUrl: '',
            title: ''
        });
    };

    const generateAcceptanceLetterPDF = async () => {
        try {
            // Implementasi untuk generate PDF menggunakan library seperti jsPDF atau html2pdf.js
            // Contoh dengan html2pdf.js:
            const element = document.getElementById('acceptance-letter-content');

            if (element) {
                // Install html2pdf.js terlebih dahulu: npm install html2pdf.js
                const html2pdf = (await import('html2pdf.js')).default;

                const opt = {
                    margin: [0.5, 0.5, 0.5, 0.5],
                    filename: `Surat_Penerimaan_${registration?.full_name.replace(/\s+/g, '_')}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        letterRendering: true
                    },
                    jsPDF: {
                        unit: 'in',
                        format: 'letter',
                        orientation: 'portrait'
                    },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                };

                await html2pdf().set(opt).from(element).save();

                alert('Surat penerimaan berhasil diunduh sebagai PDF');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Gagal generate PDF. Silakan coba cetak sebagai alternatif.');
        }
    };

    const handleGenerateAcceptanceLetter = () => {
        if (registration?.status !== 'approved') {
            alert('Hanya pendaftaran dengan status "Diterima" yang dapat dibuatkan surat penerimaan.');
            return;
        }
        setAcceptanceLetterModal(true);
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
                        to="/admin/registrations"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Daftar
                    </Link>
                </div>
            </Layout>
        );
    }

    const statusConfig = getStatusConfig(registration.status);

    return (
        <Layout title={`Detail Pendaftaran - ${registration.full_name}`}>
            {/* Modal Preview Dokumen */}
            <ImagePreviewModal
                isOpen={previewModal.isOpen}
                onClose={closePreviewModal}
                imageUrl={previewModal.imageUrl}
                title={previewModal.title}
            />

            {/* Modal Surat Penerimaan */}
            <AcceptanceLetterModal
                isOpen={acceptanceLetterModal}
                onClose={() => setAcceptanceLetterModal(false)}
                registration={registration}
                onGeneratePDF={generateAcceptanceLetterPDF}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm p-6 mb-6 print:hidden">
                <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                        <Link
                            to="/admin/registrations"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Detail Pendaftaran
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        ID: {registration.id} • {registration.full_name} ({registration.nickname})
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border ${statusConfig.color}`}>
                        {statusConfig.icon}
                        <span className="ml-2">{statusConfig.text}</span>
                    </span>
                    <Link
                        to={`/admin/registrations/${registration.id}/edit`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Status
                    </Link>
                </div>
            </div>

            {/* Print Header (only visible when printing) */}
            <div className="hidden print:block mb-8">
                <div className="text-center border-b pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Detail Pendaftaran</h1>
                    <p className="text-gray-600">SDI Ikhlas Bakti Umat</p>
                    <p className="text-gray-600">Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri: Data Pribadi */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Info User */}
                    {registration.user && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:border print:shadow-none">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                                <UserIcon className="w-5 h-5 inline mr-2" />
                                Data Pendaftar
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Nama Pendaftar
                                        </label>
                                        <div className="flex items-center text-gray-900">
                                            <User className="w-5 h-5 text-gray-400 mr-2" />
                                            {registration.user.name}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Email
                                        </label>
                                        <div className="flex items-center text-gray-900">
                                            <Mail className="w-5 h-5 text-gray-400 mr-2" />
                                            {registration.user.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Tanggal Daftar Akun
                                        </label>
                                        <div className="flex items-center text-gray-900">
                                            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                                            {formatDate(registration.user.created_at)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            ID User
                                        </label>
                                        <div className="text-gray-900 font-mono">
                                            #{registration.user.id}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Calon Murid */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:border print:shadow-none">
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:border print:shadow-none">
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:border print:shadow-none">
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
                                    ID Pendaftaran
                                </label>
                                <div className="text-gray-900 font-mono">
                                    #{registration.id}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Tanggal Daftar
                                </label>
                                <div className="text-gray-900">
                                    {formatDateTime(registration.created_at)}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Terakhir Diupdate
                                </label>
                                <div className="text-gray-900">
                                    {formatDateTime(registration.updated_at)}
                                </div>
                            </div>
                            {registration.notes && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Catatan Admin
                                    </label>
                                    <div className="text-gray-900 bg-yellow-50 p-3 rounded-lg text-sm">
                                        {registration.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dokumen Pendukung */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:border print:shadow-none">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                            Dokumen Pendukung
                        </h2>
                        <div className="space-y-4">
                            {registration.photo_url && (
                                <div className="flex flex-col items-center print:hidden">
                                    <label className="w-full text-sm font-medium text-gray-600 mb-2 text-center">
                                        Foto Calon Murid
                                    </label>

                                    {/* max-w-[160px] agar ukuran pas untuk pas foto */}
                                    <div className="relative w-full max-w-[160px] aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm group bg-gray-50">
                                        <img
                                            src={registration.photo_url}
                                            alt="Foto"
                                            className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
                                            onClick={() => openPreviewModal(registration.photo_url, 'Foto Calon Murid')}
                                        />

                                        {/* Overlay Hover */}
                                        <div
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                            onClick={() => openPreviewModal(registration.photo_url, 'Foto Calon Murid')}
                                        >
                                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                                                <Eye className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-gray-400 mt-2 italic">Klik untuk memperbesar</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-3">
                                {registration.birth_certificate_url && (
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-900">Akte Kelahiran</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openPreviewModal(registration.birth_certificate_url, 'Akte Kelahiran')}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                title="Lihat dokumen"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {registration.family_card_url && (
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-900">Kartu Keluarga</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openPreviewModal(registration.family_card_url, 'Kartu Keluarga')}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                title="Lihat dokumen"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {registration.payment_proof_url && (
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-900">Bukti Pembayaran</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openPreviewModal(registration.payment_proof_url, 'Bukti Pembayaran')}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                title="Lihat dokumen"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="print:hidden">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                                Tindakan Cepat
                            </h2>
                            <div className="grid grid-cols-1 gap-3">
                                <Link
                                    to={`/admin/registrations/${registration.id}/edit`}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <Edit className="w-4 h-4" />
                                    Update Status
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}