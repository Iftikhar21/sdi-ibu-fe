// pages/admin/manage user/ManageUserList.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../../../types/user';
import {
    PlusCircle,
    Eye,
    Trash2,
    Loader2,
    AlertCircle,
    X,
    User as UserIcon,
    Shield,
    Phone,
    UserCheck,
    UserX,
    Key,
    Mail,
    Calendar,
    Search,
    Filter,
    ChevronRight
} from 'lucide-react';
import Layout from '../../../../components/layout/panel/MainLayout';
import Modal from '../../../../components/common/Modal';
import TablePagination from '../../../../components/common/TablePagination';
import { useTablePagination } from '../../../../components/common/useTablePagination';
import { userService } from '../../../../services/manageUserServices';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../../context/toast';
import { getApiErrorMessage } from '../../../../utils/apiError';

export default function ManageUserList() {
    const toast = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const { pageItems, pagination } = useTablePagination(filteredUsers);

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await userService.getUsers(); // Anda perlu menambahkan method ini di service
            setUsers(res);
            setFilteredUsers(res);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Gagal memuat data pengguna', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    // Apply filters
    useEffect(() => {
        let result = users;

        // Apply search filter
        if (searchTerm) {
            result = result.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply role filter
        if (filterRole !== 'all') {
            result = result.filter(user => user.role.role_name === filterRole);
        }

        setFilteredUsers(result);
    }, [searchTerm, filterRole, users]);

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;

        setDeletingId(selectedUser.id);
        try {
            await userService.delete(selectedUser.id);
            toast.success('Pengguna berhasil dihapus');
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Gagal menghapus pengguna', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setDeletingId(null);
            setSelectedUser(null);
            setShowDeleteModal(false);
        }
    };

    const handleResetPasswordClick = async (user: User) => {
        if (window.confirm(`Reset password untuk ${user.name}?`)) {
            try {
                const res = await userService.resetPassword(user.id);
                toast.success(res.data.message || 'Password berhasil direset');
            } catch (error) {
                toast.error('Gagal mereset password', getApiErrorMessage(error, 'silakan coba lagi'));
            }
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (user: User) => {
        if (user.role.role_name === 'admin') {
            return {
                text: 'Admin',
                color: 'bg-purple-100 text-purple-800 border-purple-200',
                icon: <Shield className="w-3 h-3" />
            };
        } else {
            return {
                text: 'Pengguna',
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: <UserIcon className="w-3 h-3" />
            };
        }
    };

    const getActiveStatus = (user: User) => {
        // Anda bisa menambahkan logic untuk status aktif/nonaktif
        return {
            text: 'Aktif',
            color: 'bg-green-100 text-green-800 border-green-200'
        };
    };

    // Statistik
    const stats = {
        total: users.length,
        admin: users.filter(u => u.role.role_name === 'admin').length,
        user: users.filter(u => u.role.role_name === 'user').length,
        active: users.length // Sesuaikan dengan logic aktif/tidak
    };

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kelola Pengguna">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Kelola Pengguna
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Lihat dan kelola semua pengguna sistem
                        </p>
                    </div>
                    {/* <div className="flex items-center gap-3">
                        <Link
                            to="/admin/kelola-pengguna/create"
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Tambah Pengguna
                        </Link>
                        <Link
                            to="/admin/kelola-admin"
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-line text-body font-medium text-sm rounded-lg hover:bg-line focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 shadow-sm"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Lihat Admin
                        </Link>
                    </div> */}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <UserIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-muted">Total Pengguna</p>
                                <p className="text-2xl font-bold text-body">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    {/* <div className="bg-surface rounded-xl shadow-sm border border-line p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-muted">Admin</p>
                                <p className="text-2xl font-bold text-body">{stats.admin}</p>
                            </div>
                        </div>
                    </div> */}
                    {/* <div className="bg-surface rounded-xl shadow-sm border border-line p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <UserCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-muted">Pengguna Biasa</p>
                                <p className="text-2xl font-bold text-body">{stats.user}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-surface-muted rounded-lg">
                                <UserCheck className="w-6 h-6 text-muted" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-muted">Aktif</p>
                                <p className="text-2xl font-bold text-body">{stats.active}</p>
                            </div>
                        </div>
                    </div> */}
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-surface rounded-xl shadow-sm border border-line p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Cari pengguna berdasarkan nama atau email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-muted"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Filter Button */}
                        {/* <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-4 py-2.5 border border-line text-body font-medium text-sm rounded-lg hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                                {filterRole !== 'all' && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        1
                                    </span>
                                )}
                            </button>
                        </div> */}
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-line">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-body mb-2">
                                        Filter Berdasarkan Role
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setFilterRole('all')}
                                            className={`px-3 py-1.5 text-sm rounded-lg ${filterRole === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-surface-muted text-body hover:bg-line'
                                                }`}
                                        >
                                            Semua
                                        </button>
                                        <button
                                            onClick={() => setFilterRole('admin')}
                                            className={`px-3 py-1.5 text-sm rounded-lg ${filterRole === 'admin'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-surface-muted text-body hover:bg-line'
                                                }`}
                                        >
                                            Admin
                                        </button>
                                        <button
                                            onClick={() => setFilterRole('user')}
                                            className={`px-3 py-1.5 text-sm rounded-lg ${filterRole === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-surface-muted text-body hover:bg-line'
                                                }`}
                                        >
                                            Pengguna
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Info */}
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted">
                        Menampilkan <span className="font-semibold">{filteredUsers.length}</span> dari{' '}
                        <span className="font-semibold">{users.length}</span> pengguna
                    </p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            Hapus pencarian
                            <X className="w-3 h-3 ml-1" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                    {loading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-muted">Memuat data pengguna...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="py-12 text-center">
                            <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-body mb-2">
                                {searchTerm ? 'Pengguna tidak ditemukan' : 'Belum ada pengguna'}
                            </h3>
                            <p className="text-muted max-w-md mx-auto mb-6">
                                {searchTerm
                                    ? 'Coba dengan kata kunci lain atau hapus filter untuk melihat semua pengguna'
                                    : 'Tambahkan pengguna pertama untuk mulai menggunakan sistem.'}
                            </p>
                            {!searchTerm && (
                                <Link
                                    to="/admin/kelola-pengguna/create"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Tambah Pengguna Pertama
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-line">
                                <thead className="bg-surface-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                            Pengguna
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                            Role & Status
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
                                    {pageItems.map((user) => {
                                        const roleBadge = getStatusBadge(user);
                                        const activeStatus = getActiveStatus(user);

                                        return (
                                            <tr key={user.id} className="hover:bg-surface-muted transition-colors duration-150">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-bold">
                                                                {user.name?.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-body">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm text-muted flex items-center">
                                                                <Mail className="w-3 h-3 mr-1" />
                                                                {user.email}
                                                            </div>
                                                            <div className="text-xs text-muted mt-1">
                                                                ID: {user.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${roleBadge.color}`}>
                                                            {roleBadge.icon}
                                                            <span className="ml-1">{roleBadge.text}</span>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-sm text-muted">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        {formatDate(user.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex space-x-2">
                                                        {/* Tombol Detail */}
                                                        {/* <Link
                                                            to={`/admin/kelola-pengguna/${user.id}`}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                                        >
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            Detail
                                                        </Link> */}

                                                        {/* Tombol Edit */}
                                                        {/* <Link
                                                            to={`/admin/kelola-pengguna/${user.id}/edit`}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                                                        >
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            Edit
                                                        </Link> */}

                                                        {/* Tombol Reset Password */}
                                                        <button
                                                            onClick={() => handleResetPasswordClick(user)}
                                                            disabled={deletingId === user.id}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                        >
                                                            <Key className="w-3 h-3 mr-1" />
                                                            Reset PW
                                                        </button>

                                                        {/* Tombol Hapus */}
                                                        {/* <button
                                                            onClick={() => handleDeleteClick(user)}
                                                            disabled={user.role.role_name === 'admin'}
                                                            title={user.role.role_name === 'admin' ? 'Admin tidak dapat dihapus' : 'Hapus pengguna'}
                                                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium ${user.role.role_name === 'admin'
                                                                ? 'text-muted bg-surface-muted border border-line cursor-not-allowed'
                                                                : 'text-red-700 bg-red-50 border border-red-200 hover:bg-red-100'
                                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200`}
                                                        >
                                                            <Trash2 className="w-3 h-3 mr-1" />
                                                            Hapus
                                                        </button> */}
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

                {/* Pagination atau Info Tambahan */}
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-muted">
                        Menampilkan {filteredUsers.length} pengguna
                    </p>
                    {users.length > 10 && (
                        <div className="flex items-center space-x-2">
                            <button className="px-3 py-1.5 text-sm text-body bg-surface-muted rounded-lg hover:bg-line">
                                Sebelumnya
                            </button>
                            <span className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">1</span>
                            <button className="px-3 py-1.5 text-sm text-body bg-surface-muted rounded-lg hover:bg-line">
                                Selanjutnya
                            </button>
                        </div>
                    )}
                </div>

                {/* Catatan Kaki */}
                <div className="mt-6 p-4 bg-surface-muted border border-line rounded-lg">
                    <p className="text-xs text-muted text-center">
                        <strong>Catatan:</strong> Pengguna dengan role Admin tidak dapat dihapus.
                        Pastikan untuk memverifikasi data sebelum melakukan perubahan.
                    </p>
                </div>
            </Layout>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus Pengguna"
                type="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={confirmDelete}
                isLoading={deletingId !== null}
            >
                <div className="py-2">
                    <p className="text-body">
                        Apakah Anda yakin ingin menghapus pengguna <strong>{selectedUser?.name}</strong>?
                    </p>
                    <div className="mt-3 text-sm text-muted space-y-1">
                        <p><strong>Email:</strong> {selectedUser?.email}</p>
                        <p><strong>Role:</strong> {selectedUser?.role.role_name}</p>
                        <p><strong>Tanggal Bergabung:</strong> {selectedUser && formatDate(selectedUser.created_at)}</p>
                    </div>
                    <p className="text-sm text-red-600 mt-3">
                        ⚠️ Perhatian: Tindakan ini tidak dapat dibatalkan. Pengguna yang dihapus tidak dapat mengakses sistem lagi.
                    </p>
                </div>
            </Modal>
        </>
    );
}
