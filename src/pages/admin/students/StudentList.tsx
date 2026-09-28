import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit2,
    GraduationCap,
    Loader2,
    Search,
    Users,
    UserX,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import NumericInput from '../../../components/common/NumericInput';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { studentService } from '../../../services/studentServices';
import type { Student } from '../../../types/student';

const itemsPerPage = 10;

const statusStyles: Record<string, string> = {
    active: 'border-green-200 bg-green-50 text-green-700',
    inactive: 'border-line bg-surface-muted text-muted',
    graduated: 'border-blue-200 bg-blue-50 text-blue-700',
};

export default function StudentList() {
    const toast = useToast();

    const [items, setItems] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | Student['status']>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editing, setEditing] = useState<Student | null>(null);
    const [form, setForm] = useState<{ nis: string; status: Student['status'] }>({
        nis: '',
        status: 'active',
    });
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        try {
            setItems(await studentService.getAll());
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Gagal memuat data siswa', getApiErrorMessage(error, 'silakan coba lagi'));
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
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            const matchesSearch =
                keyword === '' ||
                item.full_name.toLowerCase().includes(keyword) ||
                (item.nis ?? '').toLowerCase().includes(keyword);

            return matchesStatus && matchesSearch;
        });
    }, [items, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const openEdit = (student: Student) => {
        setEditing(student);
        setForm({ nis: student.nis ?? '', status: student.status });
        setShowEditModal(true);
    };

    const confirmEdit = async () => {
        if (!editing) return;

        setIsSaving(true);
        try {
            await studentService.update(editing.id, {
                nis: form.nis.trim() ? form.nis.trim() : null,
                status: form.status,
            });

            toast.success('Data siswa berhasil diperbarui');
            setShowEditModal(false);
            setEditing(null);
            fetchData();
        } catch (error) {
            console.error('Error updating student:', error);
            toast.error('Gagal memperbarui data siswa', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsSaving(false);
        }
    };

    const totalActive = items.filter((item) => item.status === 'active').length;
    const totalBelumDitempatkan = items.filter((item) => !item.classroom_label).length;

    return (
        <>
            <Helmet>
                <title>Siswa | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Siswa">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                            <GraduationCap className="h-6 w-6 text-brand" />
                            Data Siswa
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Siswa yang sudah diterima beserta kelas dan riwayatnya
                        </p>
                    </div>
                    <Link
                        to="/admin/registrations"
                        className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                    >
                        <Users className="mr-2 h-4 w-4" />
                        Lihat Pendaftaran
                    </Link>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
                        <p className="text-sm text-muted">Total Siswa</p>
                        <p className="mt-1 text-2xl font-bold text-body">{items.length}</p>
                    </div>
                    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
                        <p className="text-sm text-muted">Siswa Aktif</p>
                        <p className="mt-1 text-2xl font-bold text-body">{totalActive}</p>
                    </div>
                    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
                        <p className="text-sm text-muted">Belum Ditempatkan</p>
                        <p className="mt-1 text-2xl font-bold text-body">{totalBelumDitempatkan}</p>
                    </div>
                </div>

                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                            <label className="mb-2 block text-sm font-medium text-body">Status</label>
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'Semua Status' },
                                    { value: 'active', label: 'Aktif' },
                                    { value: 'inactive', label: 'Tidak Aktif' },
                                    { value: 'graduated', label: 'Lulus' },
                                ]}
                                value={statusFilter}
                                onChange={(value) =>
                                    setStatusFilter(value as 'all' | Student['status'])
                                }
                                searchPlaceholder="Cari status..."
                                ariaLabel="Filter status siswa"
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
                            <UserX className="mx-auto mb-4 h-12 w-12 text-muted" />
                            <h3 className="mb-2 text-lg font-medium text-body">
                                {items.length === 0 ? 'Belum ada siswa' : 'Siswa tidak ditemukan'}
                            </h3>
                            <p className="mx-auto mb-6 max-w-md text-muted">
                                {items.length === 0
                                    ? 'Siswa terbentuk otomatis saat pendaftaran berstatus Diterima.'
                                    : 'Tidak ada siswa yang sesuai dengan filter.'}
                            </p>
                            <Link
                                to="/admin/registrations"
                                className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
                            >
                                <Users className="mr-2 h-4 w-4" />
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
                                                NIS
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Nama
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Tahun Masuk
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                Kelas Saat Ini
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
                                                <td className="px-6 py-4 text-sm text-body">
                                                    {item.nis ?? (
                                                        <span className="text-xs text-muted">
                                                            Belum diisi
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-body">
                                                        {item.full_name}
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        {item.gender === 'L'
                                                            ? 'Laki-laki'
                                                            : item.gender === 'P'
                                                              ? 'Perempuan'
                                                              : '-'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted">
                                                    {item.admission_year?.name ?? '-'}
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
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                                                            statusStyles[item.status] ??
                                                            statusStyles.inactive
                                                        }`}
                                                    >
                                                        {item.status_label ?? item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <Link
                                                            to={`/admin/siswa/${item.id}`}
                                                            className="inline-flex items-center rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-surface"
                                                        >
                                                            Detail
                                                        </Link>
                                                        <button
                                                            onClick={() => openEdit(item)}
                                                            className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
                                                        >
                                                            <Edit2 className="mr-1.5 h-4 w-4" />
                                                            Edit
                                                        </button>
                                                    </div>
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
                                            {Math.min(startIndex + itemsPerPage, filteredItems.length)}
                                        </span>{' '}
                                        dari{' '}
                                        <span className="font-medium">{filteredItems.length}</span>{' '}
                                        siswa
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
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditing(null);
                }}
                title="Ubah Data Siswa"
                type="default"
                confirmText="Simpan"
                cancelText="Batal"
                onConfirm={confirmEdit}
                isLoading={isSaving}
            >
                <div className="space-y-4 py-2">
                    <div className="rounded-lg bg-surface-muted p-4">
                        <p className="font-medium text-body">{editing?.full_name}</p>
                        <p className="mt-1 text-sm text-muted">
                            Tahun masuk: {editing?.admission_year?.name ?? '-'}
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            NIS (Nomor Induk Siswa)
                        </label>
                        <NumericInput
                            value={form.nis}
                            onChange={(value) => setForm((previous) => ({ ...previous, nis: value }))}
                            placeholder="Kosongkan bila belum ditentukan sekolah"
                            ariaLabel="NIS siswa"
                        />
                        <p className="mt-2 text-xs text-muted">
                            NIS boleh dikosongkan. Bila diisi, tidak boleh sama dengan siswa lain.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">Status</label>
                        <SearchableSelect
                            options={[
                                { value: 'active', label: 'Aktif' },
                                { value: 'inactive', label: 'Tidak Aktif' },
                                { value: 'graduated', label: 'Lulus' },
                            ]}
                            value={form.status}
                            onChange={(value) =>
                                setForm((previous) => ({
                                    ...previous,
                                    status: value as Student['status'],
                                }))
                            }
                            searchPlaceholder="Cari status..."
                            ariaLabel="Status siswa"
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}
