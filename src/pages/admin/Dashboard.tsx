import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    UserPlus,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    BarChart3,
    TrendingUp,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Eye,
    ArrowRight,
    Loader2,
    UserCheck,
    Newspaper,
    School,
    AlertCircle,
    DollarSign
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { dashboardService, type DashboardStats } from '../../services/dashboardServices';
import Layout from '../../components/layout/panel/MainLayout';

export default function Dashboard() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Format jam dan tanggal
    const formattedTime = currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const formattedDate = currentTime.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Update setiap detik
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const data = await dashboardService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Gagal memuat data dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
            submitted: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: <Clock className="w-4 h-4" />,
                text: 'Dikirim'
            },
            review: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: <Clock className="w-4 h-4" />,
                text: 'Review'
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

        return configs[status] || {
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            icon: <FileText className="w-4 h-4" />,
            text: status
        };
    };

    // Format number dengan separator
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Get greeting based on time
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    if (loading) {
        return (
            <Layout title="Dashboard">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Memuat dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Dashboard">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{error}</h2>
                        <p className="text-gray-600 mb-4">Silakan refresh halaman atau coba lagi nanti</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Dashboard Admin">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-white">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
                        {getGreeting()}, {user?.name || 'Admin'}!
                    </h1>
                    <p className="text-gray-600">
                        Selamat datang di dashboard SDI Ikhlas Bakti Umat
                    </p>
                </div>
                <div className="text-left md:text-right">
                    <div className="text-2xl md:text-3xl text-blue-600 font-bold mb-1">{formattedTime}</div>
                    <div className="text-sm md:text-base text-gray-600">{formattedDate}</div>
                </div>
            </div>

            {/* Quick Stats - 4 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Pendaftaran */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Pendaftaran</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(stats?.registration_stats.total || 0)}
                            </p>
                            <div className="flex items-center mt-2 text-sm">
                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                <span className="text-green-600">
                                    {formatNumber(stats?.registration_stats.today || 0)} hari ini
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Pengguna */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Pengguna</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(stats?.user_stats.total || 0)}
                            </p>
                            <div className="flex items-center mt-2 text-sm">
                                <Users className="w-4 h-4 text-blue-500 mr-1" />
                                <span className="text-blue-600">
                                    {formatNumber(stats?.user_stats.admin || 0)} admin
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Pendaftaran Perlu Review */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Perlu Review</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(stats?.registration_stats.submitted || 0)}
                            </p>
                            <div className="flex items-center mt-2 text-sm">
                                <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                                <span className="text-yellow-600">
                                    Butuh tindakan segera
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                {/* Pendaftaran Diterima */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Diterima</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(stats?.registration_stats.approved || 0)}
                            </p>
                            <div className="flex items-center mt-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                <span className="text-green-600">
                                    {Math.round((stats?.registration_stats.approved || 0) / (stats?.registration_stats.total || 1) * 100)}% dari total
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Berita */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            <Newspaper className="w-5 h-5 inline mr-2 text-blue-600" />
                            Berita
                        </h3>
                        <Link
                            to="/admin/news"
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Lihat semua
                        </Link>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Berita</span>
                            <span className="font-semibold">{formatNumber(stats?.content_stats.news_total || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Program */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            <School className="w-5 h-5 inline mr-2 text-green-600" />
                            Program
                        </h3>
                        <Link
                            to="/admin/program"
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Lihat semua
                        </Link>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Program</span>
                            <span className="font-semibold">{formatNumber(stats?.content_stats.program_total || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Aktif</span>
                            <span className="font-semibold text-green-600">{formatNumber(stats?.content_stats.program_active || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Distribusi Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            <BarChart3 className="w-5 h-5 inline mr-2 text-purple-600" />
                            Status Pendaftaran
                        </h3>
                        <Link
                            to="/admin/registrations"
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Lihat semua
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(stats?.status_distribution || {}).map(([status, count]) => {
                            const config = getStatusConfig(status);
                            const percentage = Math.round((count / (stats?.registration_stats.total || 1)) * 100);
                            return (
                                <div key={status} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
                                                {config.icon}
                                                <span className="ml-1">{config.text}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{formatNumber(count)}</span>
                                            <span className="text-sm text-gray-500">({percentage}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${status === 'submitted' ? 'bg-blue-500' :
                                                status === 'review' ? 'bg-yellow-500' :
                                                    status === 'approved' ? 'bg-green-500' :
                                                        'bg-red-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Recent Activity - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Pendaftaran Terbaru */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Pendaftaran Terbaru
                            </h3>
                            <Link
                                to="/admin/registrations"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                                Lihat semua
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Calon Murid
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pendaftar
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats?.latest_registrations.map((reg) => {
                                    const statusConfig = getStatusConfig(reg.status);
                                    return (
                                        <tr key={reg.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="font-medium text-gray-900">{reg.full_name}</div>
                                                    <div className="text-sm text-gray-500">{reg.nickname}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {reg.user_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}>
                                                    {statusConfig.icon}
                                                    <span className="ml-1">{statusConfig.text}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(reg.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {(!stats?.latest_registrations || stats.latest_registrations.length === 0) && (
                            <div className="py-8 text-center">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Belum ada pendaftaran</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Terbaru */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">
                                User Terbaru
                            </h3>
                            <Link
                                to="/admin/kelola-pengguna"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                                Lihat semua
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats?.latest_users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-blue-600 font-medium text-sm">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {user.role === 'admin' ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!stats?.latest_users || stats.latest_users.length === 0) && (
                            <div className="py-8 text-center">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Belum ada user baru</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Link
                        to="/admin/registrations?status=submitted"
                        className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200 group"
                    >
                        <div className="flex items-center">
                            <Clock className="w-6 h-6 text-blue-600 mr-3" />
                            <div>
                                <p className="font-medium text-blue-800">Review Pendaftaran</p>
                                <p className="text-sm text-blue-600">
                                    {formatNumber(stats?.registration_stats.submitted || 0)} menunggu
                                </p>
                            </div>
                        </div>
                    </Link>
                    <Link
                        to="/admin/news/create"
                        className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200 group"
                    >
                        <div className="flex items-center">
                            <Newspaper className="w-6 h-6 text-green-600 mr-3" />
                            <div>
                                <p className="font-medium text-green-800">Tulis Berita</p>
                                <p className="text-sm text-green-600">Buat berita baru</p>
                            </div>
                        </div>
                    </Link>
                    <Link
                        to="/admin/kelola-pengguna"
                        className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors duration-200 group"
                    >
                        <div className="flex items-center">
                            <Users className="w-6 h-6 text-purple-600 mr-3" />
                            <div>
                                <p className="font-medium text-purple-800">Kelola User</p>
                                <p className="text-sm text-purple-600">
                                    {formatNumber(stats?.user_stats.total || 0)} total user
                                </p>
                            </div>
                        </div>
                    </Link>
                    <Link
                        to="/admin/contacts"
                        className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors duration-200 group"
                    >
                        <div className="flex items-center">
                            <Phone className="w-6 h-6 text-orange-600 mr-3" />
                            <div>
                                <p className="font-medium text-orange-800">Kontak</p>
                                <p className="text-sm text-orange-600">Kelola kontak website</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </Layout>
    );
}