import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    User,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    PlusCircle,
    Users,
    Calendar,
    Phone,
    Mail
} from 'lucide-react';
import { registrationService } from '../../services/registrationServices';
import type { Registration } from '../../types/registration';
import Layout from '../../components/layout/panel/MainLayout';
import { Helmet } from 'react-helmet-async';

export default function DashboardUser() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        submitted: 0,
        approved: 0,
        rejected: 0
    });

    const fetchRegistrations = async () => {
        try {
            const data = await registrationService.getAll();
            setRegistrations(data);

            // Hitung statistik
            const stats = {
                total: data.length,
                submitted: data.filter(r => r.status === 'submitted').length,
                approved: data.filter(r => r.status === 'approved').length,
                rejected: data.filter(r => r.status === 'rejected').length
            };
            setStats(stats);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
            submitted: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: <Clock className="w-4 h-4" />,
                text: 'Dikirim'
            },
            review: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: <Clock className="w-4 h-4" />,
                text: 'Dalam Review'
            },
            approved: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: <CheckCircle className="w-4 h-4" />,
                text: 'Diterima'
            },
            rejected: {
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: <XCircle className="w-4 h-4" />,
                text: 'Ditolak'
            },
        };

        const config = statusConfig[status] || {
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            icon: <FileText className="w-4 h-4" />,
            text: status
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                {config.icon}
                <span className="ml-1">{config.text}</span>
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <>
            <Helmet>
                <title>User Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Dashboard Pendaftaran">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Dashboard Pendaftaran
                        </h1>
                        <p className="text-gray-600">
                            Kelola pendaftaran anak Anda di SDI Ibu
                        </p>
                    </div>
                    <Link
                        to="/pendaftaran"
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Daftarkan Anak
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Pendaftaran</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Dalam Proses</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Diterima</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Ditolak</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informasi Multi Pendaftaran */}
                {registrations.length > 0 && (
                    <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-4">
                            <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                    Daftarkan Lebih dari Satu Anak?
                                </h3>
                                <p className="text-blue-700 mb-3">
                                    Anda dapat mendaftarkan semua anak Anda dengan satu akun. Klik tombol "Daftarkan Anak" untuk menambahkan pendaftaran baru.
                                </p>
                                <div className="text-sm text-blue-600 space-y-1">
                                    <p>• Satu akun untuk semua anak dalam keluarga</p>
                                    <p>• Kelola semua pendaftaran di satu tempat</p>
                                    <p>• Pantau status masing-masing anak</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Daftar Pendaftaran */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            Daftar Pendaftaran Anak
                        </h2>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-4 font-medium">Memuat data...</p>
                        </div>
                    ) : registrations.length === 0 ? (
                        <div className="py-16 text-center px-4">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-10 h-10 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                Belum Ada Pendaftaran
                            </h3>
                            <p className="text-gray-500 max-w-xs mx-auto mb-8 text-sm">
                                Anda belum mendaftarkan anak. Silakan klik tombol di bawah untuk mulai.
                            </p>
                            <Link
                                to="/pendaftaran"
                                className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                            >
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Daftarkan Anak Sekarang
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {registrations.map((reg) => (
                                <div key={reg.id} className="p-5 md:p-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Kolom Foto & Nama */}
                                        <div className="flex flex-1 gap-5">
                                            <div className="flex-shrink-0">
                                                {reg.photo_url ? (
                                                    <img
                                                        src={reg.photo_url}
                                                        alt={reg.full_name}
                                                        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl border-2 border-white shadow-md"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center">
                                                        <User className="w-10 h-10 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                    <h3 className="text-lg font-bold text-gray-900 truncate">
                                                        {reg.full_name}
                                                    </h3>
                                                    <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                                                        {reg.nickname}
                                                    </span>
                                                    {getStatusBadge(reg.status)}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600 mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{reg.birth_place}, {formatDate(reg.birth_date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        <span>{reg.phone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        <span>{reg.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{reg.contact_email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Kolom Actions & Status */}
                                        <div className="flex flex-row lg:flex-col justify-between lg:justify-center gap-3 lg:border-l lg:pl-6 border-gray-100 lg:min-w-[200px]">
                                            <Link
                                                to={`/user/registrations/${reg.id}`}
                                                className="flex-1 lg:flex-none inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                                            >
                                                <FileText className="w-4 h-4 mr-2" />
                                                Detail
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Catatan di bagian bawah jika ada */}
                                    {reg.notes && (
                                        <div className="mt-4 flex gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <span className="text-amber-500 font-bold text-xs uppercase">Catatan:</span>
                                            </div>
                                            <p className="text-sm text-amber-800 leading-relaxed italic">
                                                "{reg.notes}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Layout>
        </>
    );
}