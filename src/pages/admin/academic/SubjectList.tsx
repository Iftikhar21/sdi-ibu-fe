import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    AlertTriangle,
    BookOpen,
    Download,
    Edit2,
    FileSpreadsheet,
    FileUp,
    Loader2,
    PlusCircle,
    Search,
    Trash2,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import TablePagination from '../../../components/common/TablePagination';
import { useTablePagination } from '../../../components/common/useTablePagination';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { getDownloadErrorMessage } from '../../../utils/fileDownload';
import { subjectService } from '../../../services/academicServices';
import { gradeLevels } from '../../../types/classroom';
import type { Subject } from '../../../types/academic';

export default function SubjectList() {
    const toast = useToast();

    const [items, setItems] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [deleting, setDeleting] = useState<Subject | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importMessage, setImportMessage] = useState('');
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const importInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        try {
            setItems(await subjectService.getAll());
        } catch (error) {
            console.error('Error fetching subjects:', error);
            toast.error('Gagal memuat mata pelajaran', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return items.filter((item) => {
            const cocokCari =
                keyword === '' ||
                item.name.toLowerCase().includes(keyword) ||
                item.code.toLowerCase().includes(keyword);
            const cocokTingkat =
                gradeFilter === 'all' ||
                item.grade_level === gradeFilter ||
                item.grade_level === null;
            const cocokStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' ? item.is_active : !item.is_active);

            return cocokCari && cocokTingkat && cocokStatus;
        });
    }, [items, search, gradeFilter, statusFilter]);
    const { pageItems, pagination } = useTablePagination(filtered);

    const confirmDelete = async () => {
        if (!deleting) return;

        setIsDeleting(true);
        try {
            await subjectService.delete(deleting.id);
            toast.success('Mata pelajaran berhasil dihapus');
            setDeleting(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting subject:', error);
            toast.error('Gagal menghapus mata pelajaran', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await subjectService.exportSubjects();
            toast.success('Data mata pelajaran berhasil diunduh');
        } catch (error) {
            toast.error(
                'Gagal mengekspor mata pelajaran',
                await getDownloadErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadTemplate = async () => {
        setIsDownloadingTemplate(true);
        try {
            await subjectService.downloadTemplate();
            toast.success('Template mata pelajaran berhasil diunduh');
        } catch (error) {
            toast.error(
                'Gagal mengunduh template',
                await getDownloadErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsDownloadingTemplate(false);
        }
    };

    const closeImportModal = () => {
        setShowImportModal(false);
        setImportFile(null);
        setImportMessage('');
        setImportErrors([]);
        if (importInputRef.current) importInputRef.current.value = '';
    };

    const handleImport = async () => {
        if (!importFile) {
            setImportMessage('Pilih berkas Excel terlebih dahulu.');
            return;
        }

        setIsImporting(true);
        setImportMessage('');
        setImportErrors([]);
        try {
            const result = await subjectService.importSubjects(importFile);
            toast.success('Impor mata pelajaran berhasil', result.message);
            closeImportModal();
            await fetchData();
        } catch (error) {
            const body = (error as { response?: { data?: { message?: string; errors?: unknown } } })
                ?.response?.data;
            const errors = Array.isArray(body?.errors)
                ? body.errors.filter((message): message is string => typeof message === 'string')
                : [];
            setImportErrors(errors);
            setImportMessage(
                body?.message ?? getApiErrorMessage(error, 'Gagal mengimpor mata pelajaran')
            );
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Mata Pelajaran | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Mata Pelajaran">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                            <BookOpen className="h-6 w-6 text-brand" />
                            Master Mata Pelajaran
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Daftar mata pelajaran beserta tingkat yang berlaku
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={isExporting || items.length === 0}
                            className="inline-flex items-center rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-body hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isExporting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            Export Excel
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowImportModal(true)}
                            className="inline-flex items-center rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-body hover:bg-surface-muted"
                        >
                            <FileUp className="mr-2 h-4 w-4" />
                            Import Excel
                        </button>
                        <Link
                            to="/admin/mata-pelajaran/create"
                            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Mata Pelajaran
                        </Link>
                    </div>
                </div>

                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                <Search className="mr-2 inline h-4 w-4" />
                                Cari Mata Pelajaran
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari kode atau nama"
                                className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">Tingkat</label>
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'Semua Tingkat' },
                                    ...gradeLevels.map((grade) => ({
                                        value: grade,
                                        label: `Tingkat ${grade}`,
                                    })),
                                ]}
                                value={gradeFilter}
                                onChange={(value) =>
                                    setGradeFilter(value === 'all' ? 'all' : Number(value))
                                }
                                searchPlaceholder="Cari tingkat..."
                                ariaLabel="Filter tingkat"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">Status</label>
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'Semua Status' },
                                    { value: 'active', label: 'Aktif' },
                                    { value: 'inactive', label: 'Tidak Aktif' },
                                ]}
                                value={statusFilter}
                                onChange={(value) =>
                                    setStatusFilter(value as 'all' | 'active' | 'inactive')
                                }
                                searchPlaceholder="Cari status..."
                                ariaLabel="Filter status"
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
                    ) : filtered.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted" />
                            <h3 className="mb-2 text-lg font-medium text-body">
                                {items.length === 0
                                    ? 'Belum ada mata pelajaran'
                                    : 'Tidak ada mata pelajaran yang sesuai filter'}
                            </h3>
                            <p className="mx-auto mb-6 max-w-md text-muted">
                                Tambahkan mata pelajaran agar bisa dipakai saat input nilai.
                            </p>
                            <Link
                                to="/admin/mata-pelajaran/create"
                                className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Mata Pelajaran
                            </Link>
                        </div>
                    ) : (
                        <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-line">
                                <thead className="bg-surface-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Kode
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Nama Mata Pelajaran
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Tingkat
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
                                    {pageItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-muted">
                                            <td className="px-6 py-4 text-sm font-semibold text-body">
                                                {item.code}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-body">
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted">
                                                {item.grade_label ??
                                                    (item.grade_level
                                                        ? `Tingkat ${item.grade_level}`
                                                        : 'Semua Tingkat')}
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
                                                    <Link
                                                        to={`/admin/mata-pelajaran/${item.id}/edit`}
                                                        className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
                                                    >
                                                        <Edit2 className="mr-1.5 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleting(item)}
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
                        <TablePagination {...pagination} />
                        </>
                    )}
                </div>
            </Layout>

            <Modal
                isOpen={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                title="Konfirmasi Hapus"
                type="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={confirmDelete}
                isLoading={isDeleting}
            >
                <div className="py-2">
                    <p className="text-body">
                        Hapus mata pelajaran{' '}
                        <span className="font-semibold">
                            {deleting?.code} — {deleting?.name}
                        </span>
                        ?
                    </p>
                    <p className="mt-2 text-sm text-muted">
                        Mata pelajaran yang sudah punya nilai tidak bisa dihapus; nonaktifkan saja.
                    </p>
                </div>
            </Modal>

            <Modal
                isOpen={showImportModal}
                onClose={closeImportModal}
                title="Import Mata Pelajaran"
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
                                Unduh Template untuk menambah data, atau Export Excel untuk
                                memperbarui data yang ada.
                            </li>
                            <li>
                                Sistem mencocokkan mata pelajaran lewat Kode. Kode baru akan
                                ditambahkan otomatis.
                            </li>
                            <li>
                                Tingkat diisi 1–6 atau Semua Tingkat. Status diisi Aktif atau Tidak
                                Aktif.
                            </li>
                            <li>
                                ID ditentukan sistem. Jika satu baris salah, seluruh impor dibatalkan.
                            </li>
                        </ol>
                    </div>
                    <div>
                        <label
                            htmlFor="subject-import-file"
                            className="mb-2 block text-sm font-medium text-body"
                        >
                            Berkas Excel (.xlsx, .xls) atau CSV, maksimal 5MB
                        </label>
                        <input
                            id="subject-import-file"
                            ref={importInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(event) => {
                                setImportFile(event.target.files?.[0] ?? null);
                                setImportMessage('');
                                setImportErrors([]);
                            }}
                            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-body file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-strong"
                        />
                    </div>
                    {importMessage && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <p className="flex items-start gap-2 font-medium">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                {importMessage}
                            </p>
                            {importErrors.length > 0 && (
                                <ul className="mt-3 list-disc space-y-1 pl-8">
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
        </>
    );
}
