import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    Mail,
    Download,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    AlertCircle,
    Layers,
    CalendarRange,
    Pencil,
    Trash2
} from 'lucide-react';
import type { Registration } from '../../../types/registration';
import { registrationService } from '../../../services/registrationServices';
import { academicYearService } from '../../../services/academicYearServices';
import type { AcademicYear } from '../../../types/academicYear';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { getApiErrorMessage } from '../../../utils/apiError';
import { getDownloadErrorMessage } from '../../../utils/fileDownload';
import { useToast } from '../../../context/toast';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { classroomService } from '../../../services/classroomServices';
import type { Classroom } from '../../../types/classroom';

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
    const [isExporting, setIsExporting] = useState(false);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [placementFilter, setPlacementFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
    const [yearOptions, setYearOptions] = useState<AcademicYear[]>([]);
    const [showPlacementModal, setShowPlacementModal] = useState(false);
    const [placementRegistration, setPlacementRegistration] =
        useState<RegistrationWithUser | null>(null);
    const [classroomOptions, setClassroomOptions] = useState<Classroom[]>([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);
    const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);
    const [isPlacing, setIsPlacing] = useState(false);
    const [showYearModal, setShowYearModal] = useState(false);
    const [yearRegistration, setYearRegistration] = useState<RegistrationWithUser | null>(null);
    const [academicYearOptions, setAcademicYearOptions] = useState<AcademicYear[]>([]);
    const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
    const [isLoadingYears, setIsLoadingYears] = useState(false);
    const [isSavingYear, setIsSavingYear] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteRegistration, setDeleteRegistration] = useState<RegistrationWithUser | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const toast = useToast();

    // Filter yang sedang aktif, dipakai untuk list maupun export
    const buildFilterQuery = (includePagination = true) => {
        const params = new URLSearchParams();

        if (includePagination) {
            params.set('page', currentPage.toString());
            params.set('per_page', perPage.toString());
        }

        if (statusFilter !== 'all') {
            params.set('status', statusFilter);
        }

        if (search) {
            params.set('search', search);
        }

        if (placementFilter !== 'all') {
            params.set('placement', placementFilter);
        }

        if (yearFilter !== 'all') {
            params.set('academic_year_id', String(yearFilter));
        }

        return params.toString();
    };

    const fetchRegistrations = async () => {
        try {
            setLoading(true);

            // Menggunakan service yang baru
            const response = await registrationService.getAllRegistrationsWithParams(buildFilterQuery());
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
            toast.error('Gagal memuat data pendaftaran', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await registrationService.exportRegistrations(buildFilterQuery(false));
        } catch (error) {
            console.error('Error exporting registrations:', error);
            const message = await getDownloadErrorMessage(error, 'silakan coba lagi');
            toast.error('Gagal export data pendaftaran', message);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadDocuments = async (registration: RegistrationWithUser) => {
        setDownloadingId(registration.id);
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
            setDownloadingId(null);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, [currentPage, statusFilter, placementFilter, yearFilter, perPage]);

    // Daftar tahun ajaran untuk filter
    useEffect(() => {
        const fetchYears = async () => {
            try {
                setYearOptions(await academicYearService.getAll());
            } catch (error) {
                console.error('Error fetching academic years:', error);
            }
        };

        fetchYears();
    }, []);

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
                icon: <Clock className="h-3.5 w-3.5" />,
                text: 'Dikirim'
            },
            review: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: <Clock className="h-3.5 w-3.5" />,
                text: 'Dalam Review'
            },
            approved: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: <CheckCircle className="h-3.5 w-3.5" />,
                text: 'Diterima'
            },
            rejected: {
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: <XCircle className="h-3.5 w-3.5" />,
                text: 'Ditolak'
            },
        };

        return configs[status] || {
            color: 'bg-surface-muted text-body border-line',
            icon: <FileText className="h-3.5 w-3.5" />,
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

            toast.success('Status pendaftaran berhasil diperbarui');
            fetchRegistrations();
            setShowUpdateModal(false);
            setSelectedRegistration(null);
            setUpdateStatus('');
            setUpdateNotes('');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Gagal memperbarui status', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteClick = (registration: RegistrationWithUser) => {
        setDeleteRegistration(registration);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteRegistration) return;

        setIsDeleting(true);
        try {
            const result = await registrationService.deleteRegistration(deleteRegistration.id);
            const shouldMoveToPreviousPage = registrations.length === 1 && currentPage > 1;

            setShowDeleteModal(false);
            setDeleteRegistration(null);
            toast.success('Pendaftaran berhasil dihapus', result.message);

            if (shouldMoveToPreviousPage) {
                setCurrentPage((page) => page - 1);
            } else {
                await fetchRegistrations();
            }
        } catch (error) {
            console.error('Error deleting registration:', error);
            toast.error(
                'Gagal menghapus pendaftaran',
                getApiErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Buka modal penempatan kelas: muat pilihan kelas pada tahun ajaran pendaftar
    const handlePlacementClick = async (registration: RegistrationWithUser) => {
        setPlacementRegistration(registration);
        setSelectedClassroomId(registration.classroom_id ?? null);
        setClassroomOptions([]);
        setShowPlacementModal(true);
        setIsLoadingClassrooms(true);

        try {
            const data = await classroomService.getAll(
                registration.academic_year_id
                    ? { academic_year_id: registration.academic_year_id }
                    : {}
            );

            setClassroomOptions(data.filter((classroom) => classroom.is_active));
        } catch (error) {
            console.error('Error fetching classrooms:', error);
            toast.error('Gagal memuat daftar kelas', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsLoadingClassrooms(false);
        }
    };

    // Buka modal isi/ubah tahun ajaran pendaftar
    const handleYearClick = async (registration: RegistrationWithUser) => {
        setYearRegistration(registration);
        setSelectedYearId(registration.academic_year_id ?? null);
        setShowYearModal(true);
        setIsLoadingYears(true);

        try {
            const years = await academicYearService.getAll();

            setAcademicYearOptions(years);

            // Default: tahun ajaran pendaftar, atau tahun ajaran aktif bila belum ada
            if (!registration.academic_year_id) {
                setSelectedYearId(years.find((year) => year.is_active)?.id ?? null);
            }
        } catch (error) {
            console.error('Error fetching academic years:', error);
            toast.error('Gagal memuat tahun ajaran', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsLoadingYears(false);
        }
    };

    const confirmAcademicYear = async () => {
        if (!yearRegistration || !selectedYearId) {
            toast.warning('Tahun ajaran wajib dipilih');
            return;
        }

        setIsSavingYear(true);
        try {
            const result = await registrationService.setAcademicYear(
                yearRegistration.id,
                selectedYearId
            );

            toast.success(result.message || 'Tahun ajaran berhasil disimpan');
            fetchRegistrations();
            setShowYearModal(false);
            setYearRegistration(null);
            setSelectedYearId(null);
        } catch (error) {
            console.error('Error saving academic year:', error);
            toast.error('Gagal menyimpan tahun ajaran', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsSavingYear(false);
        }
    };

    const confirmPlacement = async () => {
        if (!placementRegistration || !selectedClassroomId) {
            toast.warning('Kelas wajib dipilih');
            return;
        }

        setIsPlacing(true);
        try {
            const result = await registrationService.assignClassroom(
                placementRegistration.id,
                selectedClassroomId
            );

            toast.success(result.message || 'Penempatan kelas berhasil disimpan');
            fetchRegistrations();
            setShowPlacementModal(false);
            setPlacementRegistration(null);
            setSelectedClassroomId(null);
        } catch (error) {
            console.error('Error assigning classroom:', error);
            toast.error('Gagal menyimpan penempatan kelas', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsPlacing(false);
        }
    };

    const getPaginationButtons = () => {
        const buttons = [];
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        const endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        // First page
        if (startPage > 1) {
            buttons.push(
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-1 border border-line rounded-lg hover:bg-surface-muted"
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
                        : 'border-line hover:bg-surface-muted'
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
                    className="px-3 py-1 border border-line rounded-lg hover:bg-surface-muted"
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6 lg:p-4 lg:mb-4">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-2xl lg:text-xl font-bold text-body mb-2 lg:mb-1">
                            Kelola Pendaftaran
                        </h1>
                        <p className="text-muted lg:text-sm">
                            Kelola semua pendaftaran peserta didik baru
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={isExporting || totalItems === 0}
                            title="Unduh data pendaftar ke Excel (.xlsx), mengikuti filter yang aktif"
                            className="inline-flex items-center px-4 py-2 text-sm lg:px-3 lg:py-1.5 lg:text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            {isExporting ? 'Menyiapkan...' : 'Export Excel'}
                        </button>
                        <Link
                            to="/admin/dashboard"
                            className="inline-flex items-center px-4 py-2 text-sm lg:px-3 lg:py-1.5 lg:text-xs font-medium text-body bg-surface border border-line rounded-lg hover:bg-surface-muted transition-colors duration-200"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Ke Dashboard
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="registration-stats grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 lg:gap-3 lg:mb-4">
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-muted">Total</p>
                                <p className="text-lg font-bold text-body">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-muted">Dikirim</p>
                                <p className="text-lg font-bold text-body">{stats.submitted}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-muted">Review</p>
                                <p className="text-lg font-bold text-body">{stats.review}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-muted">Diterima</p>
                                <p className="text-lg font-bold text-body">{stats.approved}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface rounded-xl shadow-sm border border-line p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-muted">Ditolak</p>
                                <p className="text-lg font-bold text-body">{stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-surface rounded-xl shadow-sm border border-line p-6 mb-6 lg:p-4 lg:mb-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-body mb-2">
                                <Search className="w-4 h-4 inline mr-2" />
                                Cari Pendaftaran
                            </label>
                            <input
                                type="text"
                                placeholder="Cari berdasarkan nama, orang tua, atau email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2 lg:px-3 lg:text-sm border border-line rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-body mb-2">
                                <Filter className="w-4 h-4 inline mr-2" />
                                Filter Status
                            </label>
                            <SearchableSelect
                                compact
                                options={[
                                    { value: 'all', label: 'Semua Status' },
                                    { value: 'submitted', label: 'Dikirim' },
                                    { value: 'review', label: 'Dalam Review' },
                                    { value: 'approved', label: 'Diterima' },
                                    { value: 'rejected', label: 'Ditolak' },
                                ]}
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(String(value))}
                                searchPlaceholder="Cari status..."
                                ariaLabel="Filter status pendaftaran"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-body mb-2">
                                <Layers className="w-4 h-4 inline mr-2" />
                                Status Penempatan Kelas
                            </label>
                            <SearchableSelect
                                compact
                                options={[
                                    { value: 'all', label: 'Semua' },
                                    { value: 'unplaced', label: 'Belum Ditempatkan' },
                                    { value: 'placed', label: 'Sudah Ditempatkan' },
                                ]}
                                value={placementFilter}
                                onChange={(value) => setPlacementFilter(String(value))}
                                searchPlaceholder="Cari status..."
                                ariaLabel="Filter status penempatan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-body mb-2">
                                <CalendarRange className="h-4 w-4 inline mr-2" />
                                Tahun Ajaran
                            </label>
                            <SearchableSelect
                                compact
                                options={[
                                    { value: 'all', label: 'Semua Tahun Ajaran' },
                                    ...yearOptions.map((year) => ({
                                        value: year.id,
                                        label: year.name,
                                        description: year.is_active ? 'Aktif' : undefined,
                                    })),
                                ]}
                                value={yearFilter}
                                onChange={(value) =>
                                    setYearFilter(value === 'all' ? 'all' : Number(value))
                                }
                                searchPlaceholder="Cari tahun ajaran..."
                                ariaLabel="Filter tahun ajaran"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-12 text-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                                <p className="text-muted">Memuat data pendaftaran...</p>
                            </div>
                        ) : registrations.length === 0 ? (
                            <div className="py-12 text-center">
                                <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-body mb-2">
                                    Tidak ada pendaftaran
                                </h3>
                                <p className="text-muted">
                                    {search || statusFilter !== 'all'
                                        ? 'Tidak ada pendaftaran yang sesuai dengan filter'
                                        : 'Belum ada pendaftaran yang dikirim'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <table className="w-full min-w-[1100px] table-fixed divide-y divide-line">
                                    <thead className="bg-surface-muted">
                                        <tr>
                                            <th className="w-[18%] px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                Calon Murid
                                            </th>
                                            <th className="w-[17%] px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                Email Orang Tua
                                            </th>
                                            <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                Tahun Ajaran
                                            </th>
                                            <th className="w-[11%] px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                Kelas
                                            </th>
                                            <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                Tanggal
                                            </th>
                                            <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-surface divide-y divide-line">
                                        {registrations.map((reg) => {
                                            const statusConfig = getStatusConfig(reg.status);
                                            return (
                                                <tr key={reg.id} className="hover:bg-surface-muted transition-colors duration-150">
                                                    <td className="px-6 py-4">
                                                        <div className="flex min-w-0 items-center gap-2.5">
                                                            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-muted">
                                                                <User className="h-4 w-4 text-muted" />
                                                                {reg.photo_url && (
                                                                    <img
                                                                        src={reg.photo_url}
                                                                        alt=""
                                                                        className="absolute inset-0 h-full w-full object-cover"
                                                                        onError={(event) => { event.currentTarget.style.display = 'none'; }}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="line-clamp-2 text-sm font-semibold leading-5 text-body" title={reg.full_name}>
                                                                    {reg.full_name}
                                                                </div>
                                                                <div className="truncate text-xs text-muted" title={reg.nickname}>
                                                                    {reg.nickname}
                                                                </div>
                                                                <div className="truncate text-[11px] text-muted">
                                                                    {reg.registration_number ??
                                                                        `ID ${reg.id}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="min-w-0 text-sm text-body">
                                                            {/* <div className="font-medium">{reg.father_name}</div>
                                                            <div className="text-muted">{reg.mother_name}</div>
                                                            <div className="flex items-center mt-1 text-muted">
                                                                <Phone className="w-3 h-3 mr-1" />
                                                                <span className="text-xs">{reg.phone}</span>
                                                            </div> */}
                                                            <div className="flex min-w-0 items-center text-blue-500">
                                                                <Mail className="mr-1 h-3 w-3 shrink-0" />
                                                                <span className="truncate text-xs" title={reg.contact_email}>{reg.contact_email}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            {reg.academic_year?.name ? (
                                                                <>
                                                                    <span className="whitespace-nowrap text-xs text-body">
                                                                        {reg.academic_year.name}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleYearClick(reg)}
                                                                        title="Ubah tahun ajaran pendaftar"
                                                                        className="rounded-lg border border-line bg-surface-muted p-1.5 text-muted transition-colors hover:bg-surface hover:text-brand"
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleYearClick(reg)}
                                                                    title="Isi tahun ajaran pendaftar ini"
                                                                    className="inline-flex items-center whitespace-nowrap rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 transition-colors hover:bg-amber-100"
                                                                >
                                                                    <CalendarRange className="mr-1 h-3.5 w-3.5" />
                                                                    Isi Tahun Ajaran
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {reg.classroom_label ? (
                                                            <span className="inline-flex items-center rounded-full bg-brand/20 px-2 py-0.5 text-[11px] font-semibold text-brand">
                                                                {reg.classroom_label}
                                                            </span>
                                                        ) : (
                                                            <span className="whitespace-nowrap text-[11px] font-medium text-muted">
                                                                Belum Ditempatkan
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusConfig.color}`}>
                                                            {statusConfig.icon}
                                                            <span className="ml-1">{statusConfig.text}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-muted">
                                                        <div className="flex items-center whitespace-nowrap">
                                                            <Calendar className="mr-1 h-3 w-3 shrink-0 text-muted" />
                                                            {formatDate(reg.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1">
                                                            <Link
                                                                to={`/admin/registrations/${reg.id}`}
                                                                className="inline-flex h-8 items-center whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-2 text-xs font-medium text-blue-700 transition-colors duration-200 hover:bg-blue-100"
                                                            >
                                                                <Eye className="mr-1 h-3 w-3" />
                                                                Detail
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDownloadDocuments(reg)}
                                                                disabled={downloadingId === reg.id}
                                                                aria-label="Unduh dokumen pendukung"
                                                                title="Unduh semua dokumen pendukung (ZIP)"
                                                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-700 transition-colors duration-200 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {downloadingId === reg.id ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <Download className="h-3.5 w-3.5" />
                                                                )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateStatus(reg)}
                                                                aria-label="Ubah status pendaftaran"
                                                                title="Ubah status pendaftaran"
                                                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 transition-colors duration-200 hover:bg-amber-100"
                                                            >
                                                                <FileText className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteClick(reg)}
                                                                aria-label="Hapus pendaftaran"
                                                                title="Hapus pendaftaran"
                                                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition-colors duration-200 hover:bg-red-100"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                            {reg.status === 'approved' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handlePlacementClick(reg)}
                                                                    aria-label={reg.classroom_label ? 'Ubah kelas' : 'Tempatkan ke kelas'}
                                                                    title={
                                                                        reg.classroom_label
                                                                            ? 'Pindahkan ke kelas lain'
                                                                            : 'Tempatkan ke kelas'
                                                                    }
                                                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand transition-colors duration-200 hover:bg-brand/20"
                                                                >
                                                                    <Layers className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                <div className="px-4 py-3 border-t border-line">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="text-sm text-body">
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
                                                <label className="text-sm text-body">Per halaman:</label>
                                                <select
                                                    value={perPage}
                                                    onChange={(e) => setPerPage(Number(e.target.value))}
                                                    className="px-2 py-1 border border-line rounded text-sm"
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
                                                    className="p-1 border border-line rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronsLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="p-1 border border-line rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <div className="flex items-center gap-1">
                                                    {getPaginationButtons()}
                                                </div>
                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="p-1 border border-line rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange(totalPages)}
                                                    disabled={currentPage === totalPages}
                                                    className="p-1 border border-line rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <label className="block text-sm font-medium text-body mb-2">
                            Calon Murid
                        </label>
                        <div className="p-3 bg-surface-muted rounded-lg">
                            <p className="font-medium">{selectedRegistration?.full_name}</p>
                            <p className="text-sm text-muted">{selectedRegistration?.nickname}</p>
                            <p className="text-xs text-muted mt-1">
                                ID: {selectedRegistration?.id} • Oleh: {selectedRegistration?.user?.name}
                            </p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-body mb-2">
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
                        <label className="block text-sm font-medium text-body mb-2">
                            Status Baru *
                        </label>
                        <SearchableSelect
                            options={[
                                { value: 'submitted', label: 'Dikirim' },
                                { value: 'review', label: 'Dalam Review' },
                                { value: 'approved', label: 'Diterima' },
                                { value: 'rejected', label: 'Ditolak' },
                            ]}
                            value={updateStatus}
                            onChange={(value) => setUpdateStatus(String(value))}
                            searchPlaceholder="Cari status..."
                            ariaLabel="Status pendaftaran baru"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-body mb-2">
                            Catatan (Opsional)
                        </label>
                        <textarea
                            value={updateNotes}
                            onChange={(e) => setUpdateNotes(e.target.value)}
                            placeholder="Tambahkan catatan untuk orang tua..."
                            rows={3}
                            className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-muted mt-1">
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

            {/* Modal Hapus Pendaftaran */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteRegistration(null);
                }}
                title="Hapus Pendaftaran"
                type="danger"
                confirmText="Ya, Hapus Permanen"
                cancelText="Batal"
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                size="md"
            >
                <div className="space-y-4 py-2">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="font-medium text-red-900">
                            Pendaftaran {deleteRegistration?.full_name} akan dihapus permanen.
                        </p>
                        <p className="mt-2 text-sm text-red-700">
                            Berkas unggahan pendaftaran juga akan dihapus. Akun orang tua tetap tersimpan.
                        </p>
                    </div>

                    {deleteRegistration?.status === 'approved' && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            Pendaftar ini sudah diterima. Data siswa beserta penempatan kelas, nilai,
                            kehadiran, dan kelulusan terkait juga akan ikut terhapus.
                        </div>
                    )}

                    <p className="text-sm text-muted">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
            </Modal>

            {/* Modal Penempatan / Pemindahan Kelas */}
            <Modal
                isOpen={showPlacementModal}
                onClose={() => setShowPlacementModal(false)}
                title={placementRegistration?.classroom_label ? 'Ubah Kelas' : 'Penempatan Kelas'}
                type="warning"
                confirmText="Simpan"
                cancelText="Batal"
                onConfirm={confirmPlacement}
                isLoading={isPlacing}
                size="md"
            >
                <div className="space-y-4 py-2">
                    <div className="rounded-lg bg-surface-muted p-4">
                        <p className="font-medium text-body">
                            {placementRegistration?.full_name}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                            Tahun ajaran:{' '}
                            {placementRegistration?.academic_year?.name ?? 'Belum ditentukan'}
                        </p>
                        <p className="text-sm text-muted">
                            Kelas saat ini:{' '}
                            {placementRegistration?.classroom_label ?? 'Belum ditempatkan'}
                        </p>
                    </div>

                    {!placementRegistration?.academic_year_id && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm text-amber-700">
                                Pendaftar ini belum punya tahun ajaran, jadi kelas belum bisa dipilih.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    const registration = placementRegistration;

                                    setShowPlacementModal(false);
                                    setPlacementRegistration(null);

                                    if (registration) {
                                        handleYearClick(registration);
                                    }
                                }}
                                className="mt-2 inline-flex items-center rounded-lg border border-amber-200 bg-surface px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
                            >
                                <CalendarRange className="mr-1.5 h-3.5 w-3.5" />
                                Isi tahun ajaran sekarang
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            Kelas Tujuan <span className="text-red-500">*</span>
                        </label>
                        <SearchableSelect
                            options={classroomOptions.map((classroom) => {
                                const available = classroom.available_count ?? classroom.quota;
                                const isFull = available <= 0;

                                return {
                                    value: classroom.id,
                                    label:
                                        classroom.display_name ??
                                        `${classroom.grade_level} ${classroom.name}`,
                                    description: isFull
                                        ? `Kuota ${classroom.quota} — penuh`
                                        : `Kuota ${classroom.quota} • terisi ${
                                              classroom.filled_count ?? 0
                                          } • tersedia ${available}`,
                                    disabled:
                                        isFull &&
                                        classroom.id !== placementRegistration?.classroom_id,
                                };
                            })}
                            value={selectedClassroomId}
                            onChange={(value) => setSelectedClassroomId(Number(value))}
                            placeholder="Pilih kelas"
                            searchPlaceholder="Cari kelas..."
                            emptyMessage={
                                classroomOptions.length === 0
                                    ? 'Belum ada kelas pada tahun ajaran ini'
                                    : 'Kelas tidak ditemukan'
                            }
                            loading={isLoadingClassrooms}
                            ariaLabel="Kelas tujuan"
                        />
                        <p className="mt-2 text-xs text-muted">
                            Kelas yang kuotanya penuh tidak dapat dipilih. Pemindahan hanya berlaku
                            dalam tahun ajaran yang sama.
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Modal Isi / Ubah Tahun Ajaran Pendaftar */}
            <Modal
                isOpen={showYearModal}
                onClose={() => {
                    setShowYearModal(false);
                    setYearRegistration(null);
                    setSelectedYearId(null);
                }}
                title={yearRegistration?.academic_year ? 'Ubah Tahun Ajaran' : 'Isi Tahun Ajaran'}
                type="warning"
                confirmText="Simpan"
                cancelText="Batal"
                onConfirm={confirmAcademicYear}
                isLoading={isSavingYear}
                size="md"
            >
                <div className="space-y-4 py-2">
                    <div className="rounded-lg bg-surface-muted p-4">
                        <p className="font-medium text-body">{yearRegistration?.full_name}</p>
                        <p className="mt-1 text-sm text-muted">
                            Tahun ajaran saat ini:{' '}
                            {yearRegistration?.academic_year?.name ?? 'Belum diisi'}
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            Tahun Ajaran <span className="text-red-500">*</span>
                        </label>
                        <SearchableSelect
                            options={academicYearOptions.map((year) => ({
                                value: year.id,
                                label: year.name,
                                description: year.is_active ? 'Aktif' : undefined
                            }))}
                            value={selectedYearId}
                            onChange={(value) => setSelectedYearId(Number(value))}
                            placeholder="Pilih tahun ajaran"
                            searchPlaceholder="Cari tahun ajaran..."
                            emptyMessage="Belum ada Master Tahun Ajaran"
                            loading={isLoadingYears}
                            ariaLabel="Tahun ajaran pendaftar"
                        />
                        <p className="mt-2 text-xs text-muted">
                            Tahun ajaran ini menentukan kelas mana yang bisa dipilih saat penempatan.
                            {academicYearOptions.length === 0 && !isLoadingYears && (
                                <>
                                    {' '}
                                    Belum ada data — buat dulu di menu Master Data → Tahun Ajaran.
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
