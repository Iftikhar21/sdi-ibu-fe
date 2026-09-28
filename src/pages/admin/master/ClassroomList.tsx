import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Download,
    Edit2,
    FileSpreadsheet,
    FileUp,
    Layers,
    Loader2,
    PlusCircle,
    Search,
    Trash2,
    Users,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import TablePagination from '../../../components/common/TablePagination';
import { useTablePagination } from '../../../components/common/useTablePagination';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { getDownloadErrorMessage } from '../../../utils/fileDownload';
import { classroomService } from '../../../services/classroomServices';
import { academicYearService } from '../../../services/academicYearServices';
import type { Classroom } from '../../../types/classroom';
import type { AcademicYear } from '../../../types/academicYear';

const itemsPerPage = 10;

export default function ClassroomList() {
    const toast = useToast();

    const [items, setItems] = useState<Classroom[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState<Classroom | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const [importMessage, setImportMessage] = useState('');
    const importInputRef = useRef<HTMLInputElement>(null);
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [studentsClassroom, setStudentsClassroom] = useState<Classroom | null>(null);
    const [students, setStudents] = useState<
        Awaited<ReturnType<typeof classroomService.getStudents>>['students']
    >([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const { pageItems: visibleStudents, pagination: studentsPagination } = useTablePagination(students);

    const fetchData = async () => {
        try {
            const [classrooms, years] = await Promise.all([
                classroomService.getAll(),
                academicYearService.getAll(),
            ]);

            setItems(classrooms);
            setAcademicYears(years);
        } catch (error) {
            console.error('Error fetching classrooms:', error);
            toast.error('Gagal memuat data kelas', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredItems = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return items.filter((item) => {
            const matchesYear = yearFilter === 'all' || item.academic_year_id === yearFilter;
            const matchesSearch =
                keyword === '' ||
                (item.display_name ?? `${item.grade_level}${item.name}`)
                    .toLowerCase()
                    .includes(keyword) ||
                (item.academic_year?.name ?? '').toLowerCase().includes(keyword);

            return matchesYear && matchesSearch;
        });
    }, [items, search, yearFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, yearFilter]);

    const confirmDelete = async () => {
        if (!deleting) return;

        setIsDeleting(true);
        try {
            await classroomService.delete(deleting.id);
            toast.success('Kelas berhasil dihapus');
            fetchData();
            setShowDeleteModal(false);
            setDeleting(null);
        } catch (error) {
            console.error('Error deleting classroom:', error);
            toast.error('Gagal menghapus kelas', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await classroomService.exportClasses();
            toast.success('Data kelas berhasil diunduh');
        } catch (error) {
            console.error('Error exporting classrooms:', error);
            const message = await getDownloadErrorMessage(error, 'silakan coba lagi');
            toast.error('Gagal export data kelas', message);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadTemplate = async () => {
        setIsDownloadingTemplate(true);
        try {
            await classroomService.downloadTemplate();
            toast.success('Template import berhasil diunduh');
        } catch (error) {
            console.error('Error downloading classroom template:', error);
            const message = await getDownloadErrorMessage(error, 'silakan coba lagi');
            toast.error('Gagal mengunduh template', message);
        } finally {
            setIsDownloadingTemplate(false);
        }
    };

    const closeImportModal = () => {
        setShowImportModal(false);
        setImportFile(null);
        setImportErrors([]);
        setImportMessage('');

        if (importInputRef.current) {
            importInputRef.current.value = '';
        }
    };

    const handleImport = async () => {
        if (!importFile) {
            setImportMessage('Pilih berkas Excel terlebih dahulu.');
            return;
        }

        setIsImporting(true);
        setImportErrors([]);
        setImportMessage('');

        try {
            const result = await classroomService.importClasses(importFile);

            toast.success('Import data kelas berhasil', result.message);
            closeImportModal();
            fetchData();
        } catch (error) {
            console.error('Error importing classrooms:', error);

            const body = (error as { response?: { data?: { message?: string; errors?: unknown } } })
                ?.response?.data;
            const rawErrors = body?.errors;
            const rowErrors = Array.isArray(rawErrors)
                ? rawErrors.filter((item): item is string => typeof item === 'string')
                : [];

            setImportErrors(rowErrors);
            setImportMessage(
                rowErrors.length > 0
                    ? (body?.message ?? 'Ada baris yang perlu diperbaiki. Tidak ada data yang disimpan.')
                    : getApiErrorMessage(error, 'Gagal mengimport data kelas')
            );
        } finally {
            setIsImporting(false);
        }
    };

    // Buka daftar siswa yang sudah ditempatkan di kelas ini
    const handleShowStudents = async (classroom: Classroom) => {
        setStudentsClassroom(classroom);
        setStudents([]);
        setShowStudentsModal(true);
        setIsLoadingStudents(true);

        try {
            const data = await classroomService.getStudents(classroom.id);

            setStudentsClassroom(data.classroom);
            setStudents(data.students);
        } catch (error) {
            console.error('Error fetching classroom students:', error);
            toast.error('Gagal memuat daftar siswa', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsLoadingStudents(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Kelas | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kelas">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                            <Layers className="h-6 w-6 text-brand" />
                            Master Kelas
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Daftar kelas per tahun ajaran beserta kuotanya
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={isExporting || items.length === 0}
                            title="Unduh semua data kelas ke Excel (.xlsx)"
                            className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isExporting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            {isExporting ? 'Menyiapkan...' : 'Export Excel'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            disabled={isDownloadingTemplate}
                            title="Unduh template import kelas (.xlsx)"
                            className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isDownloadingTemplate ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                            )}
                            Template
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowImportModal(true)}
                            title="Import data kelas dari file Excel/CSV"
                            className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                        >
                            <FileUp className="mr-2 h-4 w-4" />
                            Import
                        </button>
                        <Link
                            to="/admin/kelas/create"
                            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Kelas
                        </Link>
                    </div>
                </div>

                {/* Filter */}
                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                <Search className="mr-2 inline h-4 w-4" />
                                Cari Kelas
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari nama kelas, mis. 1A"
                                className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Tahun Ajaran
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'Semua Tahun Ajaran' },
                                    ...academicYears.map((year) => ({
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

                <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                    {loading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-muted">Memuat data...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                            <Layers className="mx-auto mb-4 h-12 w-12 text-muted" />
                            <h3 className="mb-2 text-lg font-medium text-body">Belum ada kelas</h3>
                            <p className="mx-auto mb-6 max-w-md text-muted">
                                {items.length === 0
                                    ? 'Tambahkan kelas pada tahun ajaran yang sudah dibuat.'
                                    : 'Tidak ada kelas yang sesuai dengan filter.'}
                            </p>
                            <Link
                                to="/admin/kelas/create"
                                className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Kelas Pertama
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-line">
                                    <thead className="bg-surface-muted">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Tahun Ajaran
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Tingkat
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Kelas
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Kuota
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {paginatedItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-surface-muted">
                                                <td className="px-6 py-4 text-sm font-medium text-body">
                                                    {item.academic_year?.name ?? '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted">
                                                    {item.grade_level}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-body">
                                                    <span className="inline-flex items-center gap-2">
                                                        {item.name}
                                                        <span className="rounded-full bg-brand/20 px-2 py-0.5 text-xs font-semibold text-brand">
                                                            {item.display_name ??
                                                                `${item.grade_level}${item.name}`}
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-body">
                                                        {item.filled_count ?? 0} / {item.quota}
                                                    </p>
                                                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-line">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                (item.available_count ?? item.quota) === 0
                                                                    ? 'bg-red-500'
                                                                    : 'bg-brand'
                                                            }`}
                                                            style={{
                                                                width: `${Math.min(
                                                                    100,
                                                                    ((item.filled_count ?? 0) /
                                                                        Math.max(item.quota, 1)) *
                                                                        100
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="mt-1 text-xs text-muted">
                                                        Tersedia {item.available_count ?? item.quota}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.is_active ? (
                                                        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-medium text-muted">
                                                            Tidak Aktif
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleShowStudents(item)}
                                                            title="Lihat siswa di kelas ini"
                                                            className="inline-flex items-center rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-surface"
                                                        >
                                                            <Users className="mr-1.5 h-4 w-4" />
                                                            Siswa
                                                        </button>
                                                        <Link
                                                            to={`/admin/kelas/${item.id}/edit`}
                                                            className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
                                                        >
                                                            <Edit2 className="mr-1.5 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                setDeleting(item);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                                        >
                                                            <Trash2 className="mr-1.5 h-4 w-4" />
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="border-t border-line px-6 py-4">
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                    <div className="text-sm text-muted">
                                        Menampilkan{' '}
                                        <span className="font-medium">{startIndex + 1}</span> sampai{' '}
                                        <span className="font-medium">
                                            {Math.min(startIndex + itemsPerPage, filteredItems.length)}
                                        </span>{' '}
                                        dari{' '}
                                        <span className="font-medium">{filteredItems.length}</span>{' '}
                                        kelas
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="rounded border border-line p-1 text-body disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Halaman pertama"
                                        >
                                            <ChevronsLeft className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage((page) => page - 1)}
                                            disabled={currentPage === 1}
                                            className="rounded border border-line p-1 text-body disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Halaman sebelumnya"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <span className="px-2 text-sm text-muted">
                                            {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage((page) => page + 1)}
                                            disabled={currentPage === totalPages}
                                            className="rounded border border-line p-1 text-body disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Halaman berikutnya"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="rounded border border-line p-1 text-body disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Halaman terakhir"
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Layout>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus"
                type="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={confirmDelete}
                isLoading={isDeleting}
            >
                <div className="py-2">
                    <p className="text-body">
                        Hapus kelas{' '}
                        <span className="font-semibold">
                            {deleting?.display_name ?? `${deleting?.grade_level}${deleting?.name}`}
                        </span>{' '}
                        pada tahun ajaran {deleting?.academic_year?.name}?
                    </p>
                    <p className="mt-2 text-sm text-muted">
                        Data kelas yang dihapus tidak dapat dikembalikan.
                    </p>
                </div>
            </Modal>

            {/* Modal import data kelas */}
            <Modal
                isOpen={showImportModal}
                onClose={closeImportModal}
                title="Import Data Kelas"
                type="default"
                confirmText="Import Sekarang"
                cancelText="Batal"
                onConfirm={handleImport}
                isLoading={isImporting}
                size="lg"
            >
                <div className="space-y-4 py-2">
                    <div className="rounded-lg border border-line bg-surface-muted p-4 text-sm text-muted">
                        <p className="mb-2 font-medium text-body">Cara pakai</p>
                        <ol className="list-decimal space-y-1 pl-4">
                            <li>
                                Klik <span className="font-medium text-body">Template</span> untuk
                                mengunduh format kolom yang benar, atau{' '}
                                <span className="font-medium text-body">Export Excel</span> untuk
                                mengunduh data yang sudah ada lalu mengeditnya.
                            </li>
                            <li>
                                Isi kolom: Tahun Ajaran, Tingkat, Nama Kelas, Kuota, Status. Nama
                                tahun ajaran harus sama dengan yang ada di Master Tahun Ajaran.
                            </li>
                            <li>
                                Kelas yang sudah ada (tahun ajaran + tingkat + nama sama) akan{' '}
                                <span className="font-medium text-body">diperbarui</span>, sisanya
                                dibuat baru.
                            </li>
                        </ol>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            Berkas Excel (.xlsx, .xls) atau CSV, maksimal 5MB
                        </label>
                        <input
                            ref={importInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(event) => {
                                setImportFile(event.target.files?.[0] ?? null);
                                setImportErrors([]);
                                setImportMessage('');
                            }}
                            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-body file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-strong focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        {importFile && (
                            <p className="mt-2 text-xs text-muted">Dipilih: {importFile.name}</p>
                        )}
                    </div>

                    {importMessage && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <p className="flex items-start gap-2 text-sm font-medium text-red-700">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                {importMessage}
                            </p>
                            {importErrors.length > 0 && (
                                <ul className="mt-3 list-disc space-y-1 pl-8 text-sm text-red-700">
                                    {importErrors.map((message, index) => (
                                        <li key={index}>{message}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        disabled={isDownloadingTemplate}
                        className="inline-flex items-center text-sm font-medium text-brand hover:text-brand-strong disabled:opacity-50"
                    >
                        {isDownloadingTemplate ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                        )}
                        Belum punya template? Unduh di sini
                    </button>
                </div>
            </Modal>

            {/* Modal daftar siswa per kelas */}
            <Modal
                isOpen={showStudentsModal}
                onClose={() => setShowStudentsModal(false)}
                title={`Siswa Kelas ${
                    studentsClassroom?.display_name ??
                    `${studentsClassroom?.grade_level ?? ''}${studentsClassroom?.name ?? ''}`
                }`}
                type="default"
                confirmText="Tutup"
                cancelText=""
                onConfirm={() => setShowStudentsModal(false)}
                isLoading={false}
                size="lg"
            >
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-surface-muted p-3">
                            <p className="text-xs text-muted">Kuota</p>
                            <p className="text-lg font-bold text-body">
                                {studentsClassroom?.quota ?? 0}
                            </p>
                        </div>
                        <div className="rounded-lg bg-surface-muted p-3">
                            <p className="text-xs text-muted">Terisi</p>
                            <p className="text-lg font-bold text-body">
                                {studentsClassroom?.filled_count ?? students.length}
                            </p>
                        </div>
                        <div className="rounded-lg bg-surface-muted p-3">
                            <p className="text-xs text-muted">Tersedia</p>
                            <p className="text-lg font-bold text-body">
                                {studentsClassroom?.available_count ?? 0}
                            </p>
                        </div>
                    </div>

                    {isLoadingStudents ? (
                        <div className="py-8 text-center">
                            <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-blue-600" />
                            <p className="text-sm text-muted">Memuat daftar siswa...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted">
                            Belum ada siswa yang ditempatkan di kelas ini.
                        </p>
                    ) : (
                        <>
                        <div className="max-h-80 overflow-y-auto rounded-lg border border-line">
                            <table className="min-w-full divide-y divide-line">
                                <thead className="bg-surface-muted">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            No
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Nama
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Jenis Kelamin
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Tempat, Tanggal Lahir
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {visibleStudents.map((placement, index) => (
                                        <tr key={placement.id}>
                                            <td className="px-4 py-3 text-sm text-muted">
                                                {(studentsPagination.page - 1) * studentsPagination.pageSize + index + 1}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <p className="font-medium text-body">
                                                    {placement.registration?.full_name ?? '-'}
                                                </p>
                                                {placement.registration?.nickname && (
                                                    <p className="text-xs text-muted">
                                                        {placement.registration.nickname}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">
                                                {placement.registration?.gender === 'L'
                                                    ? 'Laki-laki'
                                                    : placement.registration?.gender === 'P'
                                                      ? 'Perempuan'
                                                      : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">
                                                {placement.registration?.birth_place ?? '-'}
                                                {placement.registration?.birth_date
                                                    ? `, ${new Date(
                                                          placement.registration.birth_date
                                                      ).toLocaleDateString('id-ID')}`
                                                    : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <TablePagination {...studentsPagination} />
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
}
