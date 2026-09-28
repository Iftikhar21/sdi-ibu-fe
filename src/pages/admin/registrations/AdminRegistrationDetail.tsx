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
    FileDown,
    Loader2,
    GraduationCap
} from 'lucide-react';
import { registrationService } from '../../../services/registrationServices';
import { studentService } from '../../../services/studentServices';
import Layout from '../../../components/layout/panel/MainLayout';
import type { Registration } from '../../../types/registration';
import { Helmet } from 'react-helmet-async';
import { getDownloadErrorMessage } from '../../../utils/fileDownload';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../context/toast';

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
            <div className="relative bg-surface rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header Modal */}
                <div className="flex items-center justify-between p-4 border-b border-line">
                    <h3 className="text-lg font-semibold text-body">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-muted" />
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
                <div className="flex justify-end p-4 border-t border-line bg-surface-muted">
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
            <div className="relative bg-surface rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header Modal */}
                <div className="flex items-center justify-between p-4 border-b border-line bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h3 className="text-lg font-bold text-body">Surat Penerimaan</h3>
                        <p className="text-sm text-muted mt-1">
                            SDI Ikhlas Bakti Umat • {registration.full_name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-muted" />
                    </button>
                </div>

                {/* Konten Surat */}
                {/* force-light: surat & berkas PDF selalu berlatar terang, walau mode gelap aktif */}
                <div
                    className="force-light p-6 overflow-auto max-h-[calc(90vh-180px)]"
                    id="acceptance-letter-content"
                >
                    <div className="max-w-4xl mx-auto">
                        {/* Kop Surat */}
                        <div className="text-center mb-8 border-b pb-6">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-blue-800">SDI IKHLAS BAKTI UMAT</h1>
                            </div>
                            <p className="text-muted">Jl. Pendidikan No. 123, Kota Pendidikan, 12345</p>
                            <p className="text-muted">Telp: (021) 1234567 • Email: admin@sdiikhlasbakti.sch.id</p>
                        </div>

                        {/* Isi Surat */}
                        <div className="space-y-6">
                            <div className="text-right">
                                <p className="text-body">Nomor: {registration.id}/SI-IBU/{new Date().getFullYear()}</p>
                                <p className="text-body">Lamp: -</p>
                                <p className="text-body">Hal: Pemberitahuan Penerimaan Siswa Baru</p>
                            </div>

                            <div>
                                <p className="text-body mb-4">Kepada Yth.</p>
                                <div className="ml-8">
                                    <p className="text-body font-semibold text-lg">Orang Tua/Wali dari</p>
                                    <p className="text-body font-bold text-xl">{registration.full_name}</p>
                                    <p className="text-body">{registration.address}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-body mb-4">
                                    Dengan hormat,
                                </p>
                                <p className="text-body mb-4">
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
                                    <p className="text-body">
                                        Selamat! Putra/Putri Anda telah memenuhi persyaratan dan dinyatakan lulus seleksi penerimaan siswa baru.
                                    </p>

                                    <div className="bg-surface-muted p-4 rounded-lg">
                                        <h4 className="font-bold text-body mb-3">Informasi Penting:</h4>
                                        <ul className="list-disc ml-5 space-y-2">
                                            <li className="text-body">
                                                <span className="font-semibold">Waktu Daftar Ulang:</span> 1-7 Juli {new Date().getFullYear()}
                                            </li>
                                            <li className="text-body">
                                                <span className="font-semibold">Tempat:</span> Kantor Tata Usaha SDI Ikhlas Bakti Umat
                                            </li>
                                            <li className="text-body">
                                                <span className="font-semibold">Dokumen yang dibawa:</span> Fotokopi akte kelahiran, KK, dan bukti pembayaran uang pangkal
                                            </li>
                                            <li className="text-body">
                                                <span className="font-semibold">Awal Masuk Sekolah:</span> 15 Juli {new Date().getFullYear()}
                                            </li>
                                        </ul>
                                    </div>

                                    <p className="text-body">
                                        Harap datang tepat waktu sesuai jadwal di atas dengan membawa dokumen asli untuk verifikasi.
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <p className="text-body mb-2">Demikian surat pemberitahuan ini kami sampaikan.</p>
                                    <p className="text-body">Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>
                                </div>

                                <div className="mt-12 text-right">
                                    <p className="text-body mb-2">Hormat kami,</p>
                                    <p className="text-body font-bold">Kepala Sekolah</p>
                                    <div className="mt-16">
                                        <p className="text-body font-bold">Dr. Ahmad Syafii, M.Pd.</p>
                                        <p className="text-muted">NIP. 196512312345678901</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Surat */}
                        <div className="mt-8 pt-4 border-t border-line text-center text-sm text-muted">
                            <p>Surat ini sah dan dapat digunakan sebagai bukti penerimaan siswa baru</p>
                            <p>Dicetak pada: {getCurrentDate()}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="flex justify-between items-center p-4 border-t border-line bg-surface-muted">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-body bg-surface border border-line rounded-lg hover:bg-surface-muted transition-colors"
                    >
                        Tutup
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-body bg-surface border border-line rounded-lg hover:bg-surface-muted transition-colors"
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
    const toast = useToast();
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
    const [isDownloadingDocs, setIsDownloadingDocs] = useState(false);
    const [isCreatingStudent, setIsCreatingStudent] = useState(false);

    // Bentuk data siswa dari pendaftaran yang sudah Diterima
    const handleCreateStudent = async () => {
        if (!registration) return;

        setIsCreatingStudent(true);
        try {
            const result = await studentService.createFromRegistration(registration.id);

            toast.success('Data siswa siap', result.message);
            setRegistration(await registrationService.getRegistrationById(registration.id));
        } catch (error) {
            console.error('Error creating student:', error);
            toast.error('Gagal membentuk data siswa', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsCreatingStudent(false);
        }
    };

    const handleDownloadAllDocuments = async () => {
        if (!registration) return;

        setIsDownloadingDocs(true);
        try {
            await registrationService.downloadRegistrationDocuments(
                registration.id,
                `dokumen-${registration.full_name}.zip`
            );
        } catch (error) {
            console.error('Error downloading documents:', error);
            const message = await getDownloadErrorMessage(error, 'silakan coba lagi');
            toast.error('Gagal mengunduh dokumen pendukung', message);
        } finally {
            setIsDownloadingDocs(false);
        }
    };

    useEffect(() => {
        const fetchRegistration = async () => {
            try {
                const data = await registrationService.getRegistrationById(Number(id));
                setRegistration(data);
            } catch (error) {
                console.error('Error fetching registration:', error);
                toast.error('Gagal memuat data pendaftaran', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };

        fetchRegistration();
    }, [id, toast]);

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
            color: 'bg-surface-muted text-body border-line',
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

                toast.success('Surat penerimaan berhasil diunduh sebagai PDF');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Gagal membuat PDF', 'Silakan coba cetak sebagai alternatif.');
        }
    };

    const handleGenerateAcceptanceLetter = () => {
        if (registration?.status !== 'approved') {
            toast.warning('Hanya pendaftaran dengan status "Diterima" yang dapat dibuatkan surat penerimaan.');
            return;
        }
        setAcceptanceLetterModal(true);
    };

    if (loading) {
        return (
            <Layout title="Loading...">
                <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-muted mt-4">Memuat data pendaftaran...</p>
                </div>
            </Layout>
        );
    }

    if (!registration) {
        return (
            <Layout title="Data Tidak Ditemukan">
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-body mb-2">Data Tidak Ditemukan</h2>
                    <p className="text-muted mb-6">Pendaftaran yang Anda cari tidak ditemukan.</p>
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
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6 print:hidden">
                    <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Link
                                to="/admin/registrations"
                                className="inline-flex items-center text-muted hover:text-body"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                            </Link>
                            <h1 className="text-2xl font-bold text-body">
                                Detail Pendaftaran
                            </h1>
                        </div>
                        <p className="text-muted">
                            ID: {registration.id} • {registration.full_name} ({registration.nickname})
                            {registration.registration_number && (
                                <span className="mt-1 block text-sm text-muted">
                                    Nomor Pendaftaran:{' '}
                                    <span className="font-semibold text-body">
                                        {registration.registration_number}
                                    </span>
                                </span>
                            )}
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
                        <h1 className="text-2xl font-bold text-body">Detail Pendaftaran</h1>
                        <p className="text-muted">SDI Ikhlas Bakti Umat</p>
                        <p className="text-muted">Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Kolom Kiri: Data Pribadi */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Siswa */}
                        {registration.status === 'approved' && (
                            <div className="bg-surface rounded-xl shadow-sm border border-line p-6 print:hidden">
                                <h2 className="text-xl font-bold text-body mb-6 pb-3 border-b border-line">
                                    <GraduationCap className="w-5 h-5 inline mr-2" />
                                    Data Siswa
                                </h2>

                                {registration.student ? (
                                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                        <div>
                                            <p className="font-medium text-body">
                                                {registration.full_name}
                                            </p>
                                            <p className="mt-1 text-sm text-muted">
                                                NIS: {registration.student.nis ?? 'Belum diisi'} •
                                                Status: {registration.student.status_label ?? '-'}
                                            </p>
                                        </div>
                                        <Link
                                            to={`/admin/siswa/${registration.student.id}`}
                                            className="inline-flex items-center justify-center rounded-lg border border-line bg-surface-muted px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-surface"
                                        >
                                            <GraduationCap className="mr-2 h-4 w-4" />
                                            Buka Data Siswa
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                        <p className="text-sm text-muted">
                                            Pendaftar sudah Diterima tetapi data siswanya belum
                                            terbentuk. Data siswa dipakai untuk riwayat kelas dan
                                            penempatan kelas.
                                        </p>
                                        <button
                                            onClick={handleCreateStudent}
                                            disabled={isCreatingStudent}
                                            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isCreatingStudent ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <GraduationCap className="mr-2 h-4 w-4" />
                                            )}
                                            Bentuk Data Siswa
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Info User */}
                        {registration.user && (
                            <div className="bg-surface rounded-xl shadow-sm border border-line p-6 print:border print:shadow-none">
                                <h2 className="text-xl font-bold text-body mb-6 pb-3 border-b border-line">
                                    <UserIcon className="w-5 h-5 inline mr-2" />
                                    Data Pendaftar
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-muted mb-1">
                                                Nama Pendaftar
                                            </label>
                                            <div className="flex items-center text-body">
                                                <User className="w-5 h-5 text-muted mr-2" />
                                                {registration.user.name}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted mb-1">
                                                Email
                                            </label>
                                            <div className="flex items-center text-body">
                                                <Mail className="w-5 h-5 text-muted mr-2" />
                                                {registration.user.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-muted mb-1">
                                                Tanggal Daftar Akun
                                            </label>
                                            <div className="flex items-center text-body">
                                                <Calendar className="w-5 h-5 text-muted mr-2" />
                                                {formatDate(registration.user.created_at)}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted mb-1">
                                                ID User
                                            </label>
                                            <div className="text-body font-mono">
                                                #{registration.user.id}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Data Calon Murid */}
                        <div className="bg-surface rounded-xl shadow-sm border border-line p-6 print:border print:shadow-none">
                            <h2 className="text-xl font-bold text-body mb-6 pb-3 border-b border-line">
                                Data Calon Murid
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1">
                                            Nama Lengkap
                                        </label>
                                        <div className="flex items-center text-body">
                                            <User className="w-5 h-5 text-muted mr-2" />
                                            {registration.full_name}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1">
                                            Nama Panggilan
                                        </label>
                                        <div className="flex items-center text-body">
                                            <User className="w-5 h-5 text-muted mr-2" />
                                            {registration.nickname}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1">
                                            Jenis Kelamin
                                        </label>
                                        <div className="flex items-center text-body">
                                            <User className="w-5 h-5 text-muted mr-2" />
                                            {registration.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1">
                                            Tempat, Tanggal Lahir
                                        </label>
                                        <div className="flex items-center text-body">
                                            <Calendar className="w-5 h-5 text-muted mr-2" />
                                            {registration.birth_place}, {formatDate(registration.birth_date)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1">
                                            Alamat
                                        </label>
                                        <div className="flex items-start text-body">
                                            <MapPin className="w-5 h-5 text-muted mr-2 mt-0.5" />
                                            <span className="flex-1">{registration.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Orang Tua */}
                        <div className="bg-surface rounded-xl shadow-sm border border-line p-6 print:border print:shadow-none">
                            <h2 className="text-xl font-bold text-body mb-6 pb-3 border-b border-line">
                                Data Orang Tua
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1">
                                            Nama Ayah
                                        </label>
                                        <div className="flex items-center text-body">
                                            <User className="w-5 h-5 text-muted mr-2" />
                                            {registration.father_name}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1">
                                            Nama Ibu
                                        </label>
                                        <div className="flex items-center text-body">
                                            <User className="w-5 h-5 text-muted mr-2" />
                                            {registration.mother_name}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1">
                                            Nomor Telepon
                                        </label>
                                        <div className="flex items-center text-body">
                                            <Phone className="w-5 h-5 text-muted mr-2" />
                                            {registration.phone}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1">
                                            Email
                                        </label>
                                        <div className="flex items-center text-body">
                                            <Mail className="w-5 h-5 text-muted mr-2" />
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
                        <div className="bg-surface rounded-xl shadow-sm border border-line p-6 print:border print:shadow-none">
                            <h2 className="text-xl font-bold text-body mb-6 pb-3 border-b border-line">
                                Status Pendaftaran
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-1">
                                        Status Saat Ini
                                    </label>
                                    <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${statusConfig.color}`}>
                                        {statusConfig.icon}
                                        <span className="ml-2">{statusConfig.text}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-1">
                                        ID Pendaftaran
                                    </label>
                                    <div className="text-body font-mono">
                                        #{registration.id}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-1">
                                        Tanggal Daftar
                                    </label>
                                    <div className="text-body">
                                        {formatDateTime(registration.created_at)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-1">
                                        Terakhir Diupdate
                                    </label>
                                    <div className="text-body">
                                        {formatDateTime(registration.updated_at)}
                                    </div>
                                </div>
                                {registration.notes && (
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1">
                                            Catatan Admin
                                        </label>
                                        <div className="text-body bg-yellow-50 p-3 rounded-lg text-sm">
                                            {registration.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dokumen Pendukung */}
                        <div className="bg-surface rounded-xl shadow-sm border border-line p-6 print:border print:shadow-none">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-3 border-b border-line print:hidden">
                                <h2 className="text-xl font-bold text-body">
                                    Dokumen Pendukung
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleDownloadAllDocuments}
                                    disabled={isDownloadingDocs}
                                    title="Unduh semua dokumen pendukung dalam satu file ZIP"
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {isDownloadingDocs ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4 mr-2" />
                                    )}
                                    {isDownloadingDocs ? 'Menyiapkan...' : 'Download Semua'}
                                </button>
                            </div>
                            <h2 className="hidden print:block text-xl font-bold text-body mb-6 pb-3 border-b border-line">
                                Dokumen Pendukung
                            </h2>
                            <div className="space-y-4">
                                {registration.photo_url && (
                                    <div className="flex flex-col items-center print:hidden">
                                        <label className="w-full text-sm font-medium text-muted mb-2 text-center">
                                            Foto Calon Murid
                                        </label>

                                        {/* max-w-[160px] agar ukuran pas untuk pas foto */}
                                        <div className="relative w-full max-w-[160px] aspect-square rounded-2xl overflow-hidden border-2 border-line shadow-sm group bg-surface-muted">
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

                                        <p className="text-[10px] text-muted mt-2 italic">Klik untuk memperbesar</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-3">
                                    {registration.birth_certificate_url && (
                                        <div className="flex items-center justify-between p-3 border border-line rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                                            <div className="flex items-center">
                                                <FileText className="w-5 h-5 text-muted mr-3" />
                                                <span className="text-body">Akte Kelahiran</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openPreviewModal(registration.birth_certificate_url, 'Akte Kelahiran')}
                                                    className="p-1.5 text-muted hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                    title="Lihat dokumen"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {registration.family_card_url && (
                                        <div className="flex items-center justify-between p-3 border border-line rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                                            <div className="flex items-center">
                                                <FileText className="w-5 h-5 text-muted mr-3" />
                                                <span className="text-body">Kartu Keluarga</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openPreviewModal(registration.family_card_url, 'Kartu Keluarga')}
                                                    className="p-1.5 text-muted hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                    title="Lihat dokumen"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {registration.payment_proof_url && (
                                        <div className="flex items-center justify-between p-3 border border-line rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                                            <div className="flex items-center">
                                                <FileText className="w-5 h-5 text-muted mr-3" />
                                                <span className="text-body">Bukti Pembayaran</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openPreviewModal(registration.payment_proof_url, 'Bukti Pembayaran')}
                                                    className="p-1.5 text-muted hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
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
                            <div className="bg-surface rounded-xl shadow-sm border border-line p-6">
                                <h2 className="text-xl font-bold text-body mb-6 pb-3 border-b border-line">
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
        </>
    );
}
