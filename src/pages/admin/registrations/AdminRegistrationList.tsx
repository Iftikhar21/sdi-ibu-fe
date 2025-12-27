import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    User,
    Calendar,
    Phone,
    Mail,
    Download,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import type { Registration } from '../../../types/registration';
import { registrationService } from '../../../services/registrationServices';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';

interface RegistrationWithUser extends Registration {
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

interface Stats {
    total: number;
    submitted: number;
    review: number;
    approved: number;
    rejected: number;
}

export default function AdminRegistrationList() {
    const [registrations, setRegistrations] = useState<RegistrationWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        submitted: 0,
        review: 0,
        approved: 0,
        rejected: 0
    });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<RegistrationWithUser | null>(null);
    const [updateStatus, setUpdateStatus] = useState('');
    const [updateNotes, setUpdateNotes] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: perPage.toString(),
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(search && { search: search })
            });

            // Menggunakan service yang baru
            const response = await registrationService.getAllRegistrationsWithParams(params.toString());
            console.log('API Response:', response);
            setRegistrations(response.data.data);
            setStats(response.stats || {
                total: 0,
                submitted: 0,
                review: 0,
                approved: 0,
                rejected: 0
            });
            setTotalPages(response.meta?.last_page || 1);
            setTotalItems(response.meta?.total || 0);
        } catch (error) {
            console.error('Error fetching registrations:', error);
            alert('Gagal memuat data pendaftaran');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, [currentPage, statusFilter, perPage]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchRegistrations();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

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

        return configs[status] || {
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            icon: <FileText className="w-4 h-4" />,
            text: status
        };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleUpdateStatus = (registration: RegistrationWithUser) => {
        setSelectedRegistration(registration);
        setUpdateStatus(registration.status);
        setUpdateNotes(registration.notes || '');
        setShowUpdateModal(true);
    };

    const confirmUpdateStatus = async () => {
        if (!selectedRegistration) return;

        setIsUpdating(true);
        try {
            await registrationService.updateStatus(selectedRegistration.id, {
                status: updateStatus,
                notes: updateNotes
            });

            fetchRegistrations();
            setShowUpdateModal(false);
            setSelectedRegistration(null);
            setUpdateStatus('');
            setUpdateNotes('');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Gagal memperbarui status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPaginationButtons = () => {
        const buttons = [];
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        // First page
        if (startPage > 1) {
            buttons.push(
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                buttons.push(<span key="dots1" className="px-2">...</span>);
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 border rounded-lg ${currentPage === i
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    {i}
                </button>
            );
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(<span key="dots2" className="px-2">...</span>);
            }
            buttons.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    {totalPages}
                </button>
            );
        }

        return buttons;
    };

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kelola Pendaftaran">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Kelola Pendaftaran
                        </h1>
                        <p className="text-gray-600">
                            Kelola semua pendaftaran peserta didik baru
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin/dashboard"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Ke Dashboard
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Dikirim</p>
                                <p className="text-lg font-bold text-gray-900">{stats.submitted}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Review</p>
                                <p className="text-lg font-bold text-gray-900">{stats.review}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Diterima</p>
                                <p className="text-lg font-bold text-gray-900">{stats.approved}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Ditolak</p>
                                <p className="text-lg font-bold text-gray-900">{stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Search className="w-4 h-4 inline mr-2" />
                                Cari Pendaftaran
                            </label>
                            <input
                                type="text"
                                placeholder="Cari berdasarkan nama, orang tua, atau email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Filter className="w-4 h-4 inline mr-2" />
                                Filter Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Semua Status</option>
                                <option value="submitted">Dikirim</option>
                                <option value="review">Dalam Review</option>
                                <option value="approved">Diterima</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-12 text-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Memuat data pendaftaran...</p>
                            </div>
                        ) : registrations.length === 0 ? (
                            <div className="py-12 text-center">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Tidak ada pendaftaran
                                </h3>
                                <p className="text-gray-600">
                                    {search || statusFilter !== 'all'
                                        ? 'Tidak ada pendaftaran yang sesuai dengan filter'
                                        : 'Belum ada pendaftaran yang dikirim'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Calon Murid
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email Orang Tua
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {registrations.map((reg) => {
                                            const statusConfig = getStatusConfig(reg.status);
                                            return (
                                                <tr key={reg.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            {reg.photo_url ? (
                                                                <img
                                                                    src={reg.photo_url}
                                                                    alt={reg.full_name}
                                                                    className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                                                    <User className="w-5 h-5 text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {reg.full_name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {reg.nickname}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">
                                                            {/* <div className="font-medium">{reg.father_name}</div>
                                                            <div className="text-gray-500">{reg.mother_name}</div>
                                                            <div className="flex items-center mt-1 text-gray-500">
                                                                <Phone className="w-3 h-3 mr-1" />
                                                                <span className="text-xs">{reg.phone}</span>
                                                            </div> */}
                                                            <div className="flex items-center text-blue-500">
                                                                <Mail className="w-3 h-3 mr-1" />
                                                                <span className="text-md truncate">{reg.contact_email}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                                            {statusConfig.icon}
                                                            <span className="ml-1">{statusConfig.text}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                            {formatDate(reg.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Link
                                                                to={`/admin/registrations/${reg.id}`}
                                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                                                            >
                                                                <Eye className="w-3 h-3 mr-1" />
                                                                Detail
                                                            </Link>
                                                            <button
                                                                onClick={() => handleUpdateStatus(reg)}
                                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors duration-200"
                                                            >
                                                                <FileText className="w-3 h-3 mr-1" />
                                                                Update Status
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan{' '}
                                            <span className="font-medium">{(currentPage - 1) * perPage + 1}</span>{' '}
                                            sampai{' '}
                                            <span className="font-medium">
                                                {Math.min(currentPage * perPage, totalItems)}
                                            </span>{' '}
                                            dari <span className="font-medium">{totalItems}</span> hasil
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-700">Per halaman:</label>
                                                <select
                                                    value={perPage}
                                                    onChange={(e) => setPerPage(Number(e.target.value))}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                                >
                                                    <option value="10">10</option>
                                                    <option value="25">25</option>
                                                    <option value="50">50</option>
                                                    <option value="100">100</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handlePageChange(1)}
                                                    disabled={currentPage === 1}
                                                    className="p-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronsLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="p-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <div className="flex items-center gap-1">
                                                    {getPaginationButtons()}
                                                </div>
                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="p-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange(totalPages)}
                                                    disabled={currentPage === totalPages}
                                                    className="p-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronsRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Layout>

            {/* Update Status Modal */}
            <Modal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                title="Update Status Pendaftaran"
                type="info"
                confirmText="Simpan Perubahan"
                cancelText="Batal"
                onConfirm={confirmUpdateStatus}
                isLoading={isUpdating}
                size="md"
            >
                <div className="py-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Calon Murid
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium">{selectedRegistration?.full_name}</p>
                            <p className="text-sm text-gray-600">{selectedRegistration?.nickname}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                ID: {selectedRegistration?.id} • Oleh: {selectedRegistration?.user?.name}
                            </p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Saat Ini
                        </label>
                        <div className="flex items-center gap-2 mb-3">
                            {selectedRegistration && (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusConfig(selectedRegistration.status).color}`}>
                                    {getStatusConfig(selectedRegistration.status).icon}
                                    <span className="ml-1">{getStatusConfig(selectedRegistration.status).text}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Baru *
                        </label>
                        <select
                            value={updateStatus}
                            onChange={(e) => setUpdateStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="submitted">Dikirim</option>
                            <option value="review">Dalam Review</option>
                            <option value="approved">Diterima</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Catatan (Opsional)
                        </label>
                        <textarea
                            value={updateNotes}
                            onChange={(e) => setUpdateNotes(e.target.value)}
                            placeholder="Tambahkan catatan untuk orang tua..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {updateNotes.length}/500 karakter
                        </p>
                    </div>

                    {updateStatus === 'approved' && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">Status Diterima</p>
                                    <p className="text-xs text-green-600 mt-1">
                                        Orang tua akan menerima notifikasi dan dapat mengunduh surat penerimaan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {updateStatus === 'rejected' && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start">
                                <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">Status Ditolak</p>
                                    <p className="text-xs text-red-600 mt-1">
                                        Pastikan telah memberikan alasan yang jelas di catatan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}