import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Role, User } from '../../../types/user';
import {
    PlusCircle,
    Edit2,
    Trash2,
    Loader2,
    AlertCircle,
    X,
    User as UserIcon,
    Shield,
    UserCheck,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Users,
    UserCog,
    Calendar,
    Clock,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { userService } from '../../../services/manageUserServices';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import SearchableSelect from '../../../components/common/SearchableSelect';

// Interface untuk filter state
interface FilterState {
    search: string;
    role: string;
    status: string; // 'all', 'active', 'inactive'
}

// Interface untuk statistik
interface UserStats {
    total: number;
    admin: number;
    user: number;
    newToday: number;
    newThisWeek: number;
    lastUpdated: string;
}

export default function UserList() {
    const toast = useToast();
    const [data, setData] = useState<User[]>([]);
    const [filteredData, setFilteredData] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<User | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);

    // Statistik state
    const [stats, setStats] = useState<UserStats>({
        total: 0,
        admin: 0,
        user: 0,
        newToday: 0,
        newThisWeek: 0,
        lastUpdated: ''
    });

    // Filter state
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        role: 'all',
        status: 'all'
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);


    // Fungsi untuk menghitung statistik
    const calculateStats = useCallback((users: User[]) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const statsData: UserStats = {
            total: users.length,
            admin: users.filter(u => u.role?.role_name === 'admin').length,
            user: users.filter(u => u.role?.role_name === 'user').length,
            newToday: users.filter(u => new Date(u.created_at) >= today).length,
            newThisWeek: users.filter(u => new Date(u.created_at) >= weekAgo).length,
            lastUpdated: new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        setStats(statsData);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, rolesRes] = await Promise.all([
                userService.getAll(),
                userService.getRoles()
            ]);

            const userData = Array.isArray(usersRes) ? usersRes : (usersRes as any)?.data || [];
            const roleData = Array.isArray(rolesRes) ? rolesRes : (rolesRes as any)?.data || (rolesRes as any)?.roles || [];

            setData(userData);
            setFilteredData(userData);
            setRoles(roleData);
            calculateStats(userData);
            setTotalPages(Math.ceil(userData.length / itemsPerPage));
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
            setFilteredData([]);
            setRoles([]);
            setStats({
                total: 0,
                admin: 0,
                user: 0,
                newToday: 0,
                newThisWeek: 0,
                lastUpdated: ''
            });
        } finally {
            setLoading(false);
        }
    };

    // Filter data berdasarkan search, role, dan status
    const applyFilters = useCallback(() => {
        let result = [...data];

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(user =>
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.id.toString().includes(filters.search)
            );
        }

        // Apply role filter
        if (filters.role !== 'all') {
            result = result.filter(user =>
                user.role?.role_name === filters.role
            );
        }

        setFilteredData(result);
        setTotalPages(Math.ceil(result.length / itemsPerPage));
        setCurrentPage(1);
    }, [data, filters, itemsPerPage]);

    // Handle filter changes
    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            search: '',
            role: 'all',
            status: 'all'
        });
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleDeleteClick = (user: User) => {
        setSelectedItem(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;

        setDeletingId(selectedItem.id);
        try {
            await userService.delete(selectedItem.id);
            toast.success('User berhasil dihapus');
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Gagal menghapus user', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setDeletingId(null);
            setSelectedItem(null);
            setShowDeleteModal(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const getRoleIcon = (roleName?: string) => {
        if (!roleName) return <UserIcon className="w-4 h-4" />;
        switch (roleName) {
            case 'admin':
                return <Shield className="w-4 h-4" />;
            case 'user':
                return <UserIcon className="w-4 h-4" />;
            default:
                return <UserCheck className="w-4 h-4" />;
        }
    };

    const getRoleBadgeClass = (roleName: string) => {
        switch (roleName) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'user':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-surface-muted text-body border-line';
        }
    };

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kelola Semua Pengguna">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Kelola Semua Pengguna
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Kelola semua pengguna sistem
                        </p>
                    </div>
                    <div>
                        <Link
                            to="/admin/kelola-pengguna/create"
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Tambah User Baru
                        </Link>
                    </div>
                </div>

                {/* STATISTICS CARDS */}
                <div className="grid grid-cols-1  lg:grid-cols-3 gap-6 mb-6">
                    {/* Total Users */}
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-muted">Total Semua Pengguna</p>
                                <p className="text-2xl font-bold text-body">{stats.total}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="text-muted">Diperbarui: {stats.lastUpdated}</span>
                            <span className="text-blue-600 font-medium">
                                {stats.newToday > 0 ? `+${stats.newToday} hari ini` : 'Tidak ada yang baru'}
                            </span>
                        </div>
                    </div>

                    {/* Admin Users */}
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-muted">Admin</p>
                                <p className="text-2xl font-bold text-body">{stats.admin}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center text-xs text-muted">
                                <span className="mr-2">{stats.admin > 0 ? Math.round((stats.admin / stats.total) * 100) : 0}% dari total</span>
                            </div>
                        </div>
                    </div>

                    {/* Regular Users */}
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <UserCog className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-muted">Pengguna Biasa</p>
                                <p className="text-2xl font-bold text-body">{stats.user}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center text-xs text-muted">
                                <span className="mr-2">{stats.user > 0 ? Math.round((stats.user / stats.total) * 100) : 0}% dari total</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-surface rounded-xl shadow-sm border border-line p-6 mb-6">
                    <div className="flex items-center mb-4">
                        <Filter className="w-5 h-5 text-muted mr-2" />
                        <h3 className="text-lg font-medium text-body">Filter Pengguna</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Search Input */}
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium text-body mb-1">
                                Cari User
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-muted" />
                                </div>
                                <input
                                    type="text"
                                    id="search"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    placeholder="Cari berdasarkan nama, email, atau ID..."
                                />
                            </div>
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-body mb-1">
                                Role
                            </label>
                            <SearchableSelect
                                compact
                                options={[
                                    { value: 'all', label: 'Semua Role' },
                                    ...roles.map((role) => ({
                                        value: role.role_name,
                                        label:
                                            role.role_name.charAt(0).toUpperCase() +
                                            role.role_name.slice(1),
                                    })),
                                ]}
                                value={filters.role}
                                onChange={(value) => handleFilterChange('role', String(value))}
                                searchPlaceholder="Cari role..."
                                ariaLabel="Filter role pengguna"
                            />
                        </div>

                        {/* Status Filter */}
                        {/* <div>
                            <label htmlFor="status" className="block text-sm font-medium text-body mb-1">
                                Status
                            </label>
                            <select
                                id="status"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="block w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            >
                                <option value="all">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Tidak Aktif</option>
                            </select>
                        </div> */}

                        {/* Results Count */}
                        <div>
                            <label className="block text-sm font-medium text-body mb-1">
                                Hasil Filter
                            </label>
                            <div className="px-3 py-2 bg-surface-muted border border-line rounded-lg">
                                <p className="text-sm text-body">
                                    <span className="font-semibold">{filteredData.length}</span> dari{' '}
                                    <span className="font-semibold">{data.length}</span> user
                                </p>
                                <p className="text-xs text-muted mt-1">
                                    Halaman {currentPage} dari {totalPages}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reset Button */}
                    {(filters.search || filters.role !== 'all' || filters.status !== 'all') && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleResetFilters}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-body bg-surface-muted border border-line rounded-lg hover:bg-line focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Reset Filter
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                    {loading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-muted">Memuat data user...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="py-12 text-center">
                            <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-body mb-2">
                                Tidak ada user yang ditemukan
                            </h3>
                            <p className="text-muted max-w-md mx-auto mb-6">
                                {filters.search || filters.role !== 'all' || filters.status !== 'all'
                                    ? 'Coba ubah filter pencarian Anda.'
                                    : 'Mulai dengan menambahkan user baru.'}
                            </p>
                            {filters.search || filters.role !== 'all' || filters.status !== 'all' ? (
                                <button
                                    onClick={handleResetFilters}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    Reset Filter
                                </button>
                            ) : (
                                <Link
                                    to="/admin/kelola-pengguna/create"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Tambah User Pertama
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
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                Tanggal Dibuat
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-surface divide-y divide-line">
                                        {currentItems.map((user) => (
                                            <tr key={user.id} className="hover:bg-surface-muted transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <UserIcon className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-body">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm text-muted">
                                                                ID: {user.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role?.role_name || '')}`}>
                                                        {getRoleIcon(user.role?.role_name)}
                                                        <span className="ml-1 capitalize">{user.role?.role_name || 'No Role'}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                                                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            to={`/admin/kelola-pengguna/${user.id}/edit`}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                                                        >
                                                            <Edit2 className="w-3 h-3 mr-1" />
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClick(user)}
                                                            disabled={deletingId === user.id}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                        >
                                                            {deletingId === user.id ? (
                                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-3 h-3 mr-1" />
                                                            )}
                                                            {deletingId === user.id ? 'Menghapus...' : 'Hapus'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-line">
                                    <div className="flex flex-col sm:flex-row items-center justify-between">
                                        <div className="mb-4 sm:mb-0">
                                            <p className="text-sm text-body">
                                                Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> -{' '}
                                                <span className="font-medium">
                                                    {Math.min(indexOfLastItem, filteredData.length)}
                                                </span> dari{' '}
                                                <span className="font-medium">{filteredData.length}</span> hasil
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handlePageChange(1)}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-lg border border-line bg-surface text-body hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                title="Halaman pertama"
                                            >
                                                <ChevronsLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-lg border border-line bg-surface text-body hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                title="Halaman sebelumnya"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>

                                            {/* Page Numbers */}
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNumber;
                                                if (totalPages <= 5) {
                                                    pageNumber = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNumber = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNumber = totalPages - 4 + i;
                                                } else {
                                                    pageNumber = currentPage - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() => handlePageChange(pageNumber)}
                                                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${currentPage === pageNumber
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'border-line bg-surface text-body hover:bg-surface-muted'
                                                            }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                );
                                            })}

                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="p-2 rounded-lg border border-line bg-surface text-body hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                title="Halaman berikutnya"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(totalPages)}
                                                disabled={currentPage === totalPages}
                                                className="p-2 rounded-lg border border-line bg-surface text-body hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                title="Halaman terakhir"
                                            >
                                                <ChevronsRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Layout>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus"
                type="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={confirmDelete}
                isLoading={deletingId !== null}
            >
                <div className="py-2">
                    <p className="text-body">
                        Apakah Anda yakin ingin menghapus user <strong>{selectedItem?.name}</strong>?
                    </p>
                    <div className="mt-3 text-sm text-muted space-y-1">
                        <p><strong>Email:</strong> {selectedItem?.email}</p>
                        <p><strong>Role:</strong> {selectedItem?.role?.role_name}</p>
                    </div>
                    <p className="text-sm text-red-600 mt-3">
                        ⚠️ Tindakan ini tidak dapat dibatalkan. User yang dihapus tidak dapat dikembalikan.
                    </p>
                </div>
            </Modal>
        </>
    );
}
