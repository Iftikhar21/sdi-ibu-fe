import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    ArrowLeft,
    CalendarDays,
    GraduationCap,
    History,
    Loader2,
    Mail,
    MapPin,
    Pencil,
    Phone,
    User,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import NumericInput from '../../../components/common/NumericInput';
import TablePagination from '../../../components/common/TablePagination';
import { useTablePagination } from '../../../components/common/useTablePagination';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { studentService } from '../../../services/studentServices';
import type { Student } from '../../../types/student';

const formatDate = (value?: string | null) => {
    if (!value) return '-';

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID');
};

const statusStyles: Record<string, string> = {
    active: 'border-green-200 bg-green-50 text-green-700',
    inactive: 'border-line bg-surface-muted text-muted',
    graduated: 'border-blue-200 bg-blue-50 text-blue-700',
};

export default function StudentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [form, setForm] = useState<{ nis: string; status: Student['status'] }>({
        nis: '',
        status: 'active',
    });
    const [isSaving, setIsSaving] = useState(false);
    const histori = student?.class_histories ?? [];
    const { pageItems, pagination } = useTablePagination(histori);

    const fetchStudent = async () => {
        if (!id) return;

        try {
            setStudent(await studentService.getById(Number(id)));
        } catch (error) {
            console.error('Error fetching student:', error);
            toast.error('Gagal memuat data siswa', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const openEdit = () => {
        if (!student) return;

        setForm({ nis: student.nis ?? '', status: student.status });
        setShowEditModal(true);
    };

    const confirmEdit = async () => {
        if (!student) return;

        setIsSaving(true);
        try {
            await studentService.update(student.id, {
                nis: form.nis.trim() ? form.nis.trim() : null,
                status: form.status,
            });

            toast.success('Data siswa berhasil diperbarui');
            setShowEditModal(false);
            fetchStudent();
        } catch (error) {
            console.error('Error updating student:', error);
            toast.error('Gagal memperbarui data siswa', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Detail Siswa">
                <div className="py-16 text-center">
                    <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-muted">Memuat data siswa...</p>
                </div>
            </Layout>
        );
    }

    if (!student) {
        return (
            <Layout title="Detail Siswa">
                <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                    <User className="mx-auto mb-4 h-12 w-12 text-muted" />
                    <h3 className="mb-2 text-lg font-medium text-body">Siswa tidak ditemukan</h3>
                    <button
                        onClick={() => navigate('/admin/siswa')}
                        className="mt-4 inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar Siswa
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Helmet>
                <title>{student.full_name} | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Detail Siswa">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand/20">
                            <GraduationCap className="h-7 w-7 text-brand" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-body sm:text-2xl">
                                {student.full_name}
                            </h1>
                            <p className="mt-1 text-sm text-muted">
                                NIS: {student.nis ?? 'Belum diisi'}
                            </p>
                            <span
                                className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                                    statusStyles[student.status] ?? statusStyles.inactive
                                }`}
                            >
                                {student.status_label ?? student.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={openEdit}
                            className="inline-flex items-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong"
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Ubah Data
                        </button>
                        <Link
                            to="/admin/siswa"
                            className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-xl border border-line bg-surface p-6 shadow-sm lg:col-span-2">
                        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-body">
                            <User className="h-5 w-5 text-brand" />
                            Biodata
                        </h2>
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-muted">
                                    Jenis Kelamin
                                </dt>
                                <dd className="mt-1 text-sm text-body">
                                    {student.gender === 'L'
                                        ? 'Laki-laki'
                                        : student.gender === 'P'
                                          ? 'Perempuan'
                                          : '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-muted">
                                    Tempat, Tanggal Lahir
                                </dt>
                                <dd className="mt-1 text-sm text-body">
                                    {student.birth_place ?? '-'}
                                    {student.birth_date ? `, ${formatDate(student.birth_date)}` : ''}
                                </dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-xs uppercase tracking-wide text-muted">
                                    Alamat
                                </dt>
                                <dd className="mt-1 flex items-start gap-2 text-sm text-body">
                                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted" />
                                    {student.address ?? '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-muted">Email</dt>
                                <dd className="mt-1 flex items-center gap-2 text-sm text-body">
                                    <Mail className="h-4 w-4 text-muted" />
                                    {student.registration?.contact_email ?? '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-muted">
                                    No. Telepon
                                </dt>
                                <dd className="mt-1 flex items-center gap-2 text-sm text-body">
                                    <Phone className="h-4 w-4 text-muted" />
                                    {student.registration?.phone ?? '-'}
                                </dd>
                            </div>
                        </dl>

                        {student.registration && (
                            <div className="mt-6 border-t border-line pt-4">
                                <Link
                                    to={`/admin/registrations/${student.registration_id}`}
                                    className="text-sm font-medium text-brand hover:underline"
                                >
                                    Lihat riwayat pendaftaran (No. {student.registration_id})
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                            <p className="text-sm text-muted">Tahun Masuk</p>
                            <p className="mt-1 flex items-center gap-2 text-lg font-bold text-body">
                                <CalendarDays className="h-5 w-5 text-brand" />
                                {student.admission_year?.name ?? '-'}
                            </p>
                        </div>
                        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                            <p className="text-sm text-muted">Kelas Saat Ini</p>
                            {student.classroom_label ? (
                                <p className="mt-2">
                                    <span className="inline-flex items-center rounded-full bg-brand/20 px-3 py-1 text-sm font-semibold text-brand">
                                        {student.classroom_label}
                                    </span>
                                </p>
                            ) : (
                                <p className="mt-1 text-sm font-medium text-muted">
                                    Belum ditempatkan
                                </p>
                            )}
                            <Link
                                to="/admin/registrations"
                                className="mt-3 inline-block text-xs font-medium text-brand hover:underline"
                            >
                                Atur penempatan kelas di menu Pendaftaran
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                    <div className="flex items-center gap-2 border-b border-line px-6 py-4">
                        <History className="h-5 w-5 text-brand" />
                        <h2 className="text-base font-semibold text-body">Riwayat Kelas</h2>
                    </div>

                    {histori.length === 0 ? (
                        <p className="px-6 py-10 text-center text-sm text-muted">
                            Siswa ini belum pernah ditempatkan ke kelas.
                        </p>
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
                                            Kelas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Ditempatkan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Selesai
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {pageItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 text-sm text-body">
                                                {item.academic_year?.name ??
                                                    item.classroom?.academic_year?.name ??
                                                    '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-body">
                                                {item.classroom?.display_name ??
                                                    `${item.classroom?.grade_level ?? ''}${
                                                        item.classroom?.name ?? ''
                                                    }`}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.is_active ? (
                                                    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-medium text-muted">
                                                        Selesai
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted">
                                                {formatDate(item.assigned_at)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted">
                                                {formatDate(item.unassigned_at)}
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
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Ubah Data Siswa"
                type="default"
                confirmText="Simpan"
                cancelText="Batal"
                onConfirm={confirmEdit}
                isLoading={isSaving}
            >
                <div className="space-y-4 py-2">
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
