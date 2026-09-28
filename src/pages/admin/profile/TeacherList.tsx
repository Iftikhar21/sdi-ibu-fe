import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    CheckCircle2,
    Download,
    Edit2,
    FileSpreadsheet,
    FileUp,
    KeyRound,
    Loader2,
    PlusCircle,
    Trash2,
    User,
    UserPlus,
    Users as UsersIcon,
    AlertTriangle,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import TablePagination from '../../../components/common/TablePagination';
import { useTablePagination } from '../../../components/common/useTablePagination';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { getDownloadErrorMessage } from '../../../utils/fileDownload';
import { teacherService } from '../../../services/schoolProfileServices';
import type { Teacher } from '../../../types/schoolProfile';

export default function TeacherList() {
    const toast = useToast();

    const [items, setItems] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState<Teacher | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [accountTarget, setAccountTarget] = useState<Teacher | null>(null);
    const [accountEmail, setAccountEmail] = useState('');
    const [isSavingAccount, setIsSavingAccount] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importMessage, setImportMessage] = useState('');
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const importInputRef = useRef<HTMLInputElement>(null);
    const { pageItems, pagination } = useTablePagination(items);
    const [credentials, setCredentials] = useState<{
        name: string;
        email: string;
        password: string;
        message: string;
        isReset: boolean;
    } | null>(null);

    const fetchData = async () => {
        try {
            setItems(await teacherService.getAll());
        } catch (error) {
            console.error('Error fetching teachers:', error);
            toast.error('Gagal memuat data guru', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const confirmDelete = async () => {
        if (!deleting) return;

        setIsDeleting(true);
        try {
            await teacherService.delete(deleting.id);
            toast.success('Data guru berhasil dihapus');
            fetchData();
            setShowDeleteModal(false);
            setDeleting(null);
        } catch (error) {
            console.error('Error deleting teacher:', error);
            toast.error('Gagal menghapus data guru', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsDeleting(false);
        }
    };

    const totalMale = items.filter((item) => item.gender === 'L').length;
    const totalFemale = items.filter((item) => item.gender === 'P').length;

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await teacherService.exportTeachers();
            toast.success('Data guru berhasil diunduh');
        } catch (error) {
            toast.error('Gagal mengekspor guru', await getDownloadErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadTemplate = async () => {
        setIsDownloadingTemplate(true);
        try {
            await teacherService.downloadTemplate();
            toast.success('Template guru berhasil diunduh');
        } catch (error) {
            toast.error('Gagal mengunduh template', await getDownloadErrorMessage(error, 'silakan coba lagi'));
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
            const result = await teacherService.importTeachers(importFile);
            toast.success('Impor guru berhasil', result.message);
            closeImportModal();
            await fetchData();
        } catch (error) {
            const body = (error as { response?: { data?: { message?: string; errors?: unknown } } })?.response?.data;
            const errors = Array.isArray(body?.errors)
                ? body.errors.filter((message): message is string => typeof message === 'string')
                : [];
            setImportErrors(errors);
            setImportMessage(body?.message ?? getApiErrorMessage(error, 'Gagal mengimpor guru'));
        } finally {
            setIsImporting(false);
        }
    };

    const openAccountModal = (teacher: Teacher) => {
        setAccountTarget(teacher);
        setAccountEmail(teacher.email ?? '');
    };

    const handleCreateAccount = async () => {
        if (!accountTarget) return;

        if (!accountEmail.trim()) {
            toast.warning('Email guru wajib diisi');
            return;
        }

        setIsSavingAccount(true);
        try {
            const result = await teacherService.createAccount(accountTarget.id, accountEmail.trim());

            setCredentials({
                name: accountTarget.name,
                email: result.email,
                password: result.password,
                message: result.message,
                isReset: false,
            });
            setAccountTarget(null);
            fetchData();
        } catch (error) {
            console.error('Error creating teacher account:', error);
            toast.error('Gagal membuat akun guru', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsSavingAccount(false);
        }
    };

    const handleResetPassword = async (teacher: Teacher) => {
        try {
            const result = await teacherService.resetPassword(teacher.id);

            setCredentials({
                name: teacher.name,
                email: result.email,
                password: result.password,
                message: result.message,
                isReset: true,
            });
        } catch (error) {
            console.error('Error resetting teacher password:', error);
            toast.error('Gagal membuat ulang password', getApiErrorMessage(error, 'silakan coba lagi'));
        }
    };

    return (
        <>
            <Helmet>
                <title>Guru & Tenaga Kependidikan | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Guru & Tenaga Kependidikan">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Guru & Tenaga Kependidikan
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            {items.length} orang terdaftar • {totalMale} laki-laki • {totalFemale}{' '}
                            perempuan
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={isExporting || items.length === 0}
                            className="inline-flex items-center rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-body hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Export Excel
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            disabled={isDownloadingTemplate}
                            className="inline-flex items-center rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-body hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isDownloadingTemplate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                            Template
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowImportModal(true)}
                            className="inline-flex items-center rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-body hover:bg-surface-muted"
                        >
                            <FileUp className="mr-2 h-4 w-4" />
                            Import
                        </button>
                        <Link
                            to="/admin/guru/create"
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Guru
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-line bg-surface py-12 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat data...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-xl border border-line bg-surface px-4 py-12 text-center shadow-sm">
                        <UsersIcon className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Belum ada data guru
                        </h3>
                        <p className="mx-auto mb-6 max-w-md text-muted">
                            Tambahkan guru dan tenaga kependidikan agar tampil di halaman profil.
                        </p>
                        <Link
                            to="/admin/guru/create"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Data Pertama
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-line">
                                <thead className="bg-surface-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Nama
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Jabatan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Pendidikan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Kontak
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line bg-surface">
                                    {pageItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-muted">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-surface-muted">
                                                        {item.photo_url ? (
                                                            <img
                                                                src={item.photo_url}
                                                                alt={item.name}
                                                                loading="lazy"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <User className="h-5 w-5 text-muted" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-body">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs text-muted">
                                                            {item.gender === 'L'
                                                                ? 'Laki-laki'
                                                                : 'Perempuan'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted">
                                                {item.position || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted">
                                                {item.last_education || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted">
                                                <p>{item.phone || '-'}</p>
                                                {item.email && (
                                                    <p className="mt-0.5 max-w-xs truncate text-xs text-muted">
                                                        {item.email}
                                                    </p>
                                                )}
                                                {item.address && (
                                                    <p className="mt-0.5 max-w-xs truncate text-xs text-muted">
                                                        {item.address}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={`w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${
                                                            item.is_active
                                                                ? 'border-green-200 bg-green-50 text-green-700'
                                                                : 'border-line bg-surface-muted text-muted'
                                                        }`}
                                                    >
                                                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                    {item.has_account && (
                                                        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Punya akun
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex flex-wrap justify-end gap-2">
                                                    {item.has_account ? (
                                                        <button
                                                            onClick={() => handleResetPassword(item)}
                                                            title="Buat ulang password akun guru"
                                                            className="inline-flex items-center rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-surface"
                                                        >
                                                            <KeyRound className="mr-1.5 h-4 w-4" />
                                                            Reset Password
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => openAccountModal(item)}
                                                            title="Buatkan akun login untuk guru ini"
                                                            className="inline-flex items-center rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-surface"
                                                        >
                                                            <UserPlus className="mr-1.5 h-4 w-4" />
                                                            Buatkan Akun
                                                        </button>
                                                    )}
                                                    <Link
                                                        to={`/admin/guru/${item.id}/edit`}
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
                        <TablePagination {...pagination} />
                    </div>
                )}
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
                        Hapus data &ldquo;{deleting?.name}&rdquo; beserta fotonya?
                    </p>
                </div>
            </Modal>

            <Modal
                isOpen={showImportModal}
                onClose={closeImportModal}
                title="Import Data Guru"
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
                            <li>Unduh Template untuk menambah guru, atau Export Excel untuk mengedit data yang ada.</li>
                            <li>Sistem mencocokkan guru lewat email, atau nama dan jenis kelamin bila email kosong. Guru baru dibuat otomatis.</li>
                            <li>Urutan guru baru mengikuti posisi baris dari atas ke bawah, setelah data yang sudah ada.</li>
                            <li>Nama Lengkap dan Jenis Kelamin wajib diisi. Foto dan akun login diatur terpisah.</li>
                        </ol>
                    </div>
                    <div>
                        <label htmlFor="teacher-import-file" className="mb-2 block text-sm font-medium text-body">
                            Berkas Excel (.xlsx, .xls) atau CSV, maksimal 5MB
                        </label>
                        <input
                            id="teacher-import-file"
                            ref={importInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(event) => {
                                setImportFile(event.target.files?.[0] ?? null);
                                setImportMessage('');
                                setImportErrors([]);
                            }}
                            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-body file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-strong"
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
                                    {importErrors.map((message, index) => <li key={index}>{message}</li>)}
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
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Belum punya template? Unduh di sini
                    </button>
                </div>
            </Modal>

            {/* Modal buatkan akun guru */}
            <Modal
                isOpen={Boolean(accountTarget)}
                onClose={() => setAccountTarget(null)}
                title="Buatkan Akun Guru"
                type="default"
                confirmText="Buatkan Akun"
                cancelText="Batal"
                onConfirm={handleCreateAccount}
                isLoading={isSavingAccount}
            >
                <div className="space-y-4 py-2">
                    <div className="rounded-lg bg-surface-muted p-4">
                        <p className="text-sm text-muted">Guru</p>
                        <p className="font-medium text-body">{accountTarget?.name}</p>
                        {accountTarget?.position && (
                            <p className="text-sm text-muted">{accountTarget.position}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            Email Pribadi Guru <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={accountEmail}
                            onChange={(event) => setAccountEmail(event.target.value)}
                            placeholder="Contoh: ahmad@gmail.com"
                            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-2 text-xs text-muted">
                            Email ini dipakai untuk login. Password awal dibuat otomatis dan
                            ditampilkan sekali — guru wajib menggantinya saat login pertama.
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Modal kredensial akun */}
            <Modal
                isOpen={Boolean(credentials)}
                onClose={() => setCredentials(null)}
                title="Akun Guru"
                type="default"
                confirmText="Sudah Saya Catat"
                cancelText=""
                onConfirm={() => setCredentials(null)}
                isLoading={false}
            >
                <div className="space-y-4 py-2">
                    <p className="text-sm text-muted">{credentials?.message}</p>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-amber-700">
                            Sampaikan ke {credentials?.name}
                        </p>
                        <p className="mt-2 text-sm text-amber-800">
                            Email: <span className="font-semibold">{credentials?.email}</span>
                        </p>
                        <p className="text-sm text-amber-800">
                            {credentials?.isReset ? 'Password baru' : 'Password awal'}:{' '}
                            <span className="font-mono text-base font-bold tracking-wider">
                                {credentials?.password}
                            </span>
                        </p>
                        <p className="mt-2 text-xs text-amber-700">
                            Password ini hanya tampil sekarang. Guru wajib menggantinya setelah
                            login pertama.
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
