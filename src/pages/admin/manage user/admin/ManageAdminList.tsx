import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../../../types/user';
import {
    PlusCircle,
    Eye,
    Trash2,
    Loader2,
    AlertCircle,
    User as UserIcon,
    Shield,
    Phone,
    UserCheck,
    UserX,
    Key
} from 'lucide-react';
import Layout from '../../../../components/layout/panel/MainLayout';
import Modal from '../../../../components/common/Modal';
import TablePagination from '../../../../components/common/TablePagination';
import { useTablePagination } from '../../../../components/common/useTablePagination';
import { userService } from '../../../../services/manageUserServices';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../../context/toast';
import { getApiErrorMessage } from '../../../../utils/apiError';

export default function ManageAdminList() {
    const toast = useToast();
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [resettingPasswordId, setResettingPasswordId] = useState<number | null>(null);
    const { pageItems, pagination } = useTablePagination(admins);

    const fetchAdmins = async () => {
        try {
            const res = await userService.getAdmins();
            setAdmins(res);
        } catch (error) {
            console.error('Error fetching admins:', error);
            toast.error('Gagal memuat data admin', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (admin: User) => {
        setSelectedAdmin(admin);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedAdmin) return;

        setDeletingId(selectedAdmin.id);
        try {
            await userService.delete(selectedAdmin.id);
            toast.success('Admin berhasil dihapus');
            fetchAdmins();
        } catch (error) {
            console.error('Error deleting admin:', error);
            toast.error('Gagal menghapus admin', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setDeletingId(null);
            setSelectedAdmin(null);
            setShowDeleteModal(false);
        }
    };

    const handleResetPasswordClick = (admin: User) => {
        setSelectedAdmin(admin);
        setShowResetPasswordModal(true);
    };

    const confirmResetPassword = async () => {
        if (!selectedAdmin) return;

        setResettingPasswordId(selectedAdmin.id);
        try {
            const res = await userService.resetPassword(selectedAdmin.id);
            toast.success(res.data.message || 'Password berhasil direset');
            setShowResetPasswordModal(false);
        } catch (error) {
            toast.error('Gagal mereset password', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setResettingPasswordId(null);
            setSelectedAdmin(null);
        }
    };


    useEffect(() => {
        fetchAdmins();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getAdminStatus = (admin: User) => {
        if (admin.admin) {
            return {
                text: 'Lengkap',
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: <UserCheck className="w-4 h-4" />
            };
        } else {
            return {
                text: 'Belum Lengkap',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: <UserX className="w-4 h-4" />
            };
        }
    };

    // Fungsi untuk mengecek apakah admin bisa dihapus/diedit
    const isProtectedAdmin = (adminId: number) => {
        return adminId === 1; // Hanya super admin yang tidak bisa dihapus
    };

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kelola Admin">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Kelola Admin
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Lihat dan kelola semua administrator sistem
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* <Link
                            to="/admin/user/create"
                            state={{ defaultRole: 'admin' }}
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Tambah Admin
                        </Link> */}
                        <Link
                            to="/admin/user"
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-line text-body font-medium text-sm rounded-lg hover:bg-line focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 shadow-sm"
                        >
                            <UserIcon className="w-4 h-4 mr-2" />
                            Lihat Semua User
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-muted">Total Admin</p>
                                <p className="text-2xl font-bold text-body">{admins.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <UserCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-muted">Profil Lengkap</p>
                                <p className="text-2xl font-bold text-body">
                                    {admins.filter(a => a.admin).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <UserX className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-muted">Belum Lengkap</p>
                                <p className="text-2xl font-bold text-body">
                                    {admins.filter(a => !a.admin).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informasi Penting */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                        <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-800">Informasi Penting</p>
                            <p className="text-xs text-blue-600 mt-1">
                                • Data admin hanya dapat dilihat dan ditambah, tidak dapat diedit atau dihapus
                                • Untuk mengubah data admin, hubungi Super Administrator
                                • Password dapat direset ke default jika diperlukan
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                    {loading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-muted">Memuat data admin...</p>
                        </div>
                    ) : admins.length === 0 ? (
                        <div className="py-12 text-center">
                            <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-body mb-2">
                                Belum ada admin
                            </h3>
                            <p className="text-muted max-w-md mx-auto mb-6">
                                Tambahkan admin pertama untuk mengelola sistem.
                            </p>
                            <Link
                                to="/admin/user/create"
                                state={{ defaultRole: 'admin' }}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Tambah Admin Pertama
                            </Link>
                        </div>
                    ) : (
                        <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-line">
                                <thead className="bg-surface-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                            Admin
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                            Status Profil
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                            Kontak
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                            Tanggal Bergabung
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-line">
                                    {pageItems.map((admin) => {
                                        const status = getAdminStatus(admin);
                                        const isProtected = isProtectedAdmin(admin.id);

                                        return (
                                            <tr key={admin.id} className="hover:bg-surface-muted transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                            <Shield className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-body">
                                                                {admin.name}
                                                                {isProtected && (
                                                                    <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                                                                        Super Admin
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-muted">
                                                                {admin.email}
                                                            </div>
                                                            <div className="text-xs text-muted mt-1">
                                                                ID: {admin.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                                                        {status.icon}
                                                        <span className="ml-1">{status.text}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {admin.admin ? (
                                                        <div className="flex items-center">
                                                            <Phone className="w-4 h-4 text-muted mr-2" />
                                                            <span className="text-sm text-body">
                                                                {admin.admin.phone}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted italic">
                                                            Belum diisi
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                                                    {formatDate(admin.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        {/* Tombol Lihat Detail (bukan Edit) */}
                                                        {/* <button
                                                            onClick={() => alert(`Detail Admin:\n\nNama: ${admin.name}\nEmail: ${admin.email}\nRole: ${admin.role.role_name}\nID: ${admin.id}\nTanggal Dibuat: ${formatDate(admin.created_at)}`)}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                                        >
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            Lihat Detail
                                                        </button> */}

                                                        {/* Tombol Reset Password */}
                                                        <button
                                                            onClick={() => handleResetPasswordClick(admin)}
                                                            disabled={resettingPasswordId === admin.id}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                        >
                                                            {resettingPasswordId === admin.id ? (
                                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                            ) : (
                                                                <Key className="w-3 h-3 mr-1" />
                                                            )}
                                                            {resettingPasswordId === admin.id ? 'Mereset...' : 'Reset Password'}
                                                        </button>

                                                        {/* Tombol Hapus (disabled untuk semua admin) */}
                                                        {/* <button
                                                            disabled
                                                            title="Admin tidak dapat dihapus"
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-muted bg-surface-muted border border-line rounded-lg cursor-not-allowed"
                                                        >
                                                            <Trash2 className="w-3 h-3 mr-1" />
                                                            Hapus
                                                        </button> */}

                                                        {/* Tombol Lengkapi Profil (hanya untuk yang belum lengkap) */}
                                                        {!admin.admin && !isProtected && (
                                                            <button
                                                                onClick={() => toast.info('Fitur melengkapi profil admin akan segera tersedia')}
                                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                                            >
                                                                <UserIcon className="w-3 h-3 mr-1" />
                                                                Lengkapi
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <TablePagination {...pagination} />
                        </>
                    )}
                </div>

                {/* Catatan Kaki */}
                <div className="mt-6 p-4 bg-surface-muted border border-line rounded-lg">
                    <p className="text-xs text-muted text-center">
                        <strong>Catatan:</strong> Semua admin hanya dapat dilihat dan ditambah.
                        Untuk perubahan data admin, silakan hubungi administrator sistem.
                    </p>
                </div>
            </Layout>

            {/* Delete Confirmation Modal (tidak digunakan, tapi tetap ada untuk safety) */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus Admin"
                type="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={confirmDelete}
                isLoading={deletingId !== null}
            >
                <div className="py-2">
                    <p className="text-body">
                        Apakah Anda yakin ingin menghapus admin <strong>{selectedAdmin?.name}</strong>?
                    </p>
                    <div className="mt-3 text-sm text-muted space-y-1">
                        <p><strong>Email:</strong> {selectedAdmin?.email}</p>
                        <p><strong>Role:</strong> {selectedAdmin?.role.role_name}</p>
                    </div>
                    <p className="text-sm text-red-600 mt-3">
                        ⚠️ Perhatian: Tindakan ini tidak dapat dibatalkan. Admin yang dihapus tidak dapat mengakses sistem lagi.
                    </p>
                </div>
            </Modal>

            {/* Reset Password Confirmation Modal */}
            <Modal
                isOpen={showResetPasswordModal}
                onClose={() => setShowResetPasswordModal(false)}
                title="Reset Password Admin"
                type="warning"
                confirmText="Ya, Reset Password"
                cancelText="Batal"
                onConfirm={confirmResetPassword}
                isLoading={resettingPasswordId !== null}
            >
                <div className="py-2">
                    <p className="text-body">
                        Apakah Anda yakin ingin mereset password untuk admin <strong>{selectedAdmin?.name}</strong>?
                    </p>
                    <div className="mt-3 text-sm text-muted space-y-1">
                        <p><strong>Email:</strong> {selectedAdmin?.email}</p>
                        <p><strong>Password baru:</strong> password123 (default)</p>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Admin akan mendapatkan password default dan harus mengubahnya saat login pertama kali.
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
