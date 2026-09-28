import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    AlertTriangle,
    CalendarRange,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Download,
    FileSpreadsheet,
    FileUp,
    Layers,
    Loader2,
    Search,
    UserCheck,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { getDownloadErrorMessage } from '../../../utils/fileDownload';
import {
    classroomPlacementService,
    type PlacementFilters,
} from '../../../services/classroomPlacementServices';
import { classroomService } from '../../../services/classroomServices';
import { academicYearService } from '../../../services/academicYearServices';
import { registrationService } from '../../../services/registrationServices';
import type { Registration } from '../../../types/registration';
import type { Classroom } from '../../../types/classroom';
import type { AcademicYear } from '../../../types/academicYear';

const itemsPerPage = 10;

export default function ClassroomPlacementList() {
    const toast = useToast();

    const [items, setItems] = useState<Registration[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
    const [placementFilter, setPlacementFilter] = useState<'all' | 'placed' | 'unplaced'>('all');
    const [currentPage, setCurrentPage] = useState(1);

    const [isExporting, setIsExporting] = useState(false);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const [importMessage, setImportMessage] = useState('');

    const [showPlacementModal, setShowPlacementModal] = useState(false);
    const [placementTarget, setPlacementTarget] = useState<Registration | null>(null);
    const [classroomOptions, setClassroomOptions] = useState<Classroom[]>([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);
    const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);
    const [isPlacing, setIsPlacing] = useState(false);
    const [tanpaTahunAjaran, setTanpaTahunAjaran] = useState(0);
    const [showYearModal, setShowYearModal] = useState(false);
    const [bulkYearId, setBulkYearId] = useState<number | null>(null);
    const [isSavingYear, setIsSavingYear] = useState(false);

    const buildFilters = (): PlacementFilters => ({
        search: search.trim() || undefined,
        academic_year_id: yearFilter,
        placement: placementFilter,
    });

    const fetchData = async () => {
        try {
            setLoading(true);

            const [candidates, years] = await Promise.all([
                classroomPlacementService.getAll(buildFilters()),
                academicYearService.getAll(),
            ]);

            setItems(candidates.items);
            setTanpaTahunAjaran(candidates.withoutAcademicYear);
            setAcademicYears(years);

            setBulkYearId((current) => current ?? years.find((year) => year.is_active)?.id ?? null);
        } catch (error) {
            console.error('Error fetching placement candidates:', error);
            toast.error('Gagal memuat data penempatan', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, yearFilter, placementFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, yearFilter, placementFilter]);

    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = useMemo(
        () => items.slice(startIndex, startIndex + itemsPerPage),
        [items, startIndex]
    );

    const belumDitempatkan = items.filter((item) => !item.classroom_label).length;

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await classroomPlacementService.exportPlacements(buildFilters());
            toast.success('Data penempatan berhasil diunduh');
        } catch (error) {
            console.error('Error exporting placements:', error);
            const message = await getDownloadErrorMessage(error, 'silakan coba lagi');
            toast.error('Gagal export data penempatan', message);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadTemplate = async () => {
        setIsDownloadingTemplate(true);
        try {
            await classroomPlacementService.downloadTemplate();
            toast.success('Template penempatan berhasil diunduh');
        } catch (error) {
            console.error('Error downloading placement template:', error);
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
            const result = await classroomPlacementService.importPlacements(importFile);

            toast.success('Penempatan berhasil disimpan', result.message);
            closeImportModal();
            fetchData();
        } catch (error) {
            console.error('Error importing placements:', error);

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
                    : getApiErrorMessage(error, 'Gagal import penempatan kelas')
            );
        } finally {
            setIsImporting(false);
        }
    };

    const confirmBulkYear = async () => {
        if (!bulkYearId) {
            toast.warning('Tahun ajaran wajib dipilih');
            return;
        }

        setIsSavingYear(true);
        try {
            const result = await classroomPlacementService.assignAcademicYear(bulkYearId);

            toast.success('Tahun ajaran berhasil diisi', result.message);
            setShowYearModal(false);
            fetchData();
        } catch (error) {
            console.error('Error assigning academic year:', error);
            toast.error('Gagal mengisi tahun ajaran', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsSavingYear(false);
        }
    };

    const handlePlacementClick = async (registration: Registration) => {
        setPlacementTarget(registration);
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

    const confirmPlacement = async () => {
        if (!placementTarget || !selectedClassroomId) {
            toast.warning('Kelas wajib dipilih');
            return;
        }

        setIsPlacing(true);
        try {
            const result = await registrationService.assignClassroom(
                placementTarget.id,
                selectedClassroomId
            );

            toast.success(result.message || 'Penempatan kelas berhasil disimpan');
            setShowPlacementModal(false);
            setPlacementTarget(null);
            setSelectedClassroomId(null);
            fetchData();
        } catch (error) {
            console.error('Error assigning classroom:', error);
            toast.error('Gagal menyimpan penempatan kelas', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsPlacing(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Penempatan Kelas | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Penempatan Kelas">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                            <Layers className="h-6 w-6 text-brand" />
                            Penempatan Kelas
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Tempatkan siswa yang sudah Diterima ke kelas, satu per satu atau lewat
                            Excel
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={isExporting || items.length === 0}
                            title="Unduh daftar penempatan ke Excel (.xlsx), mengikuti filter yang aktif"
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
                            title="Unduh template import penempatan kelas (.xlsx)"
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
                            className="inline-flex items-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong"
                        >
                            <FileUp className="mr-2 h-4 w-4" />
                            Import Excel
                        </button>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
                        <p className="text-sm text-muted">Siswa Diterima</p>
                        <p className="mt-1 text-2xl font-bold text-body">{items.length}</p>
                    </div>
                    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
                        <p className="text-sm text-muted">Belum Ditempatkan</p>
                        <p className="mt-1 text-2xl font-bold text-body">{belumDitempatkan}</p>
                    </div>
                </div>

                {tanpaTahunAjaran > 0 && (
                    <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 md:flex-row md:items-center">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
                            <div>
                                <p className="font-medium text-amber-700">
                                    {tanpaTahunAjaran} pendaftar Diterima belum punya tahun ajaran
                                </p>
                                <p className="mt-1 text-sm text-amber-700">
                                    Selama tahun ajarannya kosong, siswa ini belum bisa ditempatkan ke
                                    kelas. Isi sekaligus di sini, atau isi kolom &ldquo;Tahun
                                    Ajaran&rdquo; pada berkas Excel saat import.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowYearModal(true)}
                            className="inline-flex flex-shrink-0 items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong"
                        >
                            <CalendarRange className="mr-2 h-4 w-4" />
                            Isi Tahun Ajaran
                        </button>
                    </div>
                )}

                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                <Search className="mr-2 inline h-4 w-4" />
                                Cari Siswa
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari nama atau NIS"
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

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Status Penempatan
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'Semua' },
                                    { value: 'unplaced', label: 'Belum Ditempatkan' },
                                    { value: 'placed', label: 'Sudah Ditempatkan' },
                                ]}
                                value={placementFilter}
                                onChange={(value) =>
                                    setPlacementFilter(value as 'all' | 'placed' | 'unplaced')
                                }
                                searchPlaceholder="Cari status..."
                                ariaLabel="Filter status penempatan"
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
                    ) : items.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                            <UserCheck className="mx-auto mb-4 h-12 w-12 text-muted" />
                            <h3 className="mb-2 text-lg font-medium text-body">
                                Tidak ada siswa yang perlu ditempatkan
                            </h3>
                            <p className="mx-auto mb-6 max-w-md text-muted">
                                Hanya pendaftar berstatus Diterima yang muncul di halaman ini. Ubah
                                status pendaftar di menu Pendaftaran terlebih dahulu.
                            </p>
                            <Link
                                to="/admin/registrations"
                                className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
                            >
                                Buka Pendaftaran
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-line">
                                    <thead className="bg-surface-muted">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Nama
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                NIS
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Tahun Ajaran
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Kelas
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {paginatedItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-surface-muted">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-body">
                                                        {item.full_name}
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        No. Pendaftaran {item.id}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-body">
                                                    {item.student?.nis ?? (
                                                        <span className="text-xs text-muted">
                                                            Belum diisi
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted">
                                                    {item.academic_year?.name ?? '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.classroom_label ? (
                                                        <span className="inline-flex items-center rounded-full bg-brand/20 px-3 py-1 text-xs font-semibold text-brand">
                                                            {item.classroom_label}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-medium text-muted">
                                                            Belum Ditempatkan
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handlePlacementClick(item)}
                                                        className="inline-flex items-center rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-surface"
                                                    >
                                                        <Layers className="mr-1.5 h-4 w-4" />
                                                        {item.classroom_label
                                                            ? 'Ubah Kelas'
                                                            : 'Tempatkan'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="border-t border-line px-6 py-4">
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                    <div className="text-sm text-muted">
                                        Menampilkan{' '}
                                        <span className="font-medium">{startIndex + 1}</span> sampai{' '}
                                        <span className="font-medium">
                                            {Math.min(startIndex + itemsPerPage, items.length)}
                                        </span>{' '}
                                        dari <span className="font-medium">{items.length}</span> siswa
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

            {/* Modal penempatan satu siswa */}
            <Modal
                isOpen={showPlacementModal}
                onClose={() => {
                    setShowPlacementModal(false);
                    setPlacementTarget(null);
                }}
                title={placementTarget?.classroom_label ? 'Ubah Kelas' : 'Penempatan Kelas'}
                type="warning"
                confirmText="Simpan"
                cancelText="Batal"
                onConfirm={confirmPlacement}
                isLoading={isPlacing}
            >
                <div className="space-y-4 py-2">
                    <div className="rounded-lg bg-surface-muted p-4">
                        <p className="font-medium text-body">{placementTarget?.full_name}</p>
                        <p className="mt-1 text-sm text-muted">
                            Tahun ajaran:{' '}
                            {placementTarget?.academic_year?.name ?? 'Belum ditentukan'}
                        </p>
                        <p className="text-sm text-muted">
                            Kelas saat ini: {placementTarget?.classroom_label ?? 'Belum ditempatkan'}
                        </p>
                    </div>

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
                                        `${classroom.grade_level}${classroom.name}`,
                                    description: isFull
                                        ? `Kuota ${classroom.quota} — penuh`
                                        : `Kuota ${classroom.quota} • terisi ${
                                              classroom.filled_count ?? 0
                                          } • tersedia ${available}`,
                                    disabled:
                                        isFull &&
                                        classroom.id !== placementTarget?.classroom_id,
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

            {/* Modal import penempatan */}
            <Modal
                isOpen={showImportModal}
                onClose={closeImportModal}
                title="Import Penempatan Kelas"
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
                                Klik <span className="font-medium text-body">Export Excel</span> untuk
                                mengunduh daftar siswa yang sudah Diterima.
                            </li>
                            <li>
                                Isi kolom <span className="font-medium text-body">Kelas Tujuan</span>{' '}
                                hanya pada siswa yang ingin ditempatkan, mis. <code>1A</code>. Baris
                                yang dikosongkan tidak akan diubah.
                            </li>
                            <li>
                                Upload kembali berkasnya. Siswa yang dipindah otomatis keluar dari
                                kelas lamanya, dan kuota tetap dicek.
                            </li>
                            <li>
                                Kalau kolom <span className="font-medium text-body">Tahun Ajaran</span>{' '}
                                pada baris siswa masih kosong, isi juga (mis.{' '}
                                <code>2026/2027</code>) agar pendaftar lama ikut dilengkapi otomatis.
                            </li>
                        </ol>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            Berkas Excel (.xlsx, .xls) atau CSV, maksimal 5MB
                        </label>
                        <input
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

            {/* Modal isi tahun ajaran massal */}
            <Modal
                isOpen={showYearModal}
                onClose={() => setShowYearModal(false)}
                title="Isi Tahun Ajaran yang Kosong"
                type="warning"
                confirmText="Simpan"
                cancelText="Batal"
                onConfirm={confirmBulkYear}
                isLoading={isSavingYear}
            >
                <div className="space-y-4 py-2">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm text-amber-700">
                            Ada <span className="font-semibold">{tanpaTahunAjaran} pendaftaran</span>{' '}
                            yang belum punya tahun ajaran (termasuk pendaftar yang statusnya masih
                            Dikirim/Review). Semuanya akan diisi dengan tahun ajaran yang Anda pilih di
                            bawah ini.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            Tahun Ajaran <span className="text-red-500">*</span>
                        </label>
                        <SearchableSelect
                            options={academicYears.map((year) => ({
                                value: year.id,
                                label: year.name,
                                description: year.is_active ? 'Aktif' : undefined,
                            }))}
                            value={bulkYearId}
                            onChange={(value) => setBulkYearId(Number(value))}
                            placeholder="Pilih tahun ajaran"
                            searchPlaceholder="Cari tahun ajaran..."
                            emptyMessage="Belum ada Master Tahun Ajaran"
                            ariaLabel="Tahun ajaran untuk diisi massal"
                        />
                        <p className="mt-2 text-xs text-muted">
                            Pastikan tahun ajarannya memang benar untuk pendaftar-pendaftar tersebut.
                            Kalau ragu, isi lewat berkas Excel per baris supaya lebih terkendali.
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
