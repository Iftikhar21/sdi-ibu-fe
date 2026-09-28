import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Edit2, GraduationCap, Loader2, PlusCircle, Trash2, User } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { principalService } from '../../../services/schoolProfileServices';
import type { Principal } from '../../../types/schoolProfile';

export default function PrincipalList() {
    const toast = useToast();

    const [items, setItems] = useState<Principal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState<Principal | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = async () => {
        try {
            setItems(await principalService.getAll());
        } catch (error) {
            console.error('Error fetching principals:', error);
            toast.error('Gagal memuat data kepala sekolah', getApiErrorMessage(error, 'silakan coba lagi'));
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
            await principalService.delete(deleting.id);
            toast.success('Data kepala sekolah berhasil dihapus');
            fetchData();
            setShowDeleteModal(false);
            setDeleting(null);
        } catch (error) {
            console.error('Error deleting principal:', error);
            toast.error('Gagal menghapus data', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsDeleting(false);
        }
    };

    const formatPeriod = (item: Principal) => {
        if (!item.started_at && !item.ended_at) return null;

        return `${item.started_at || '-'} – ${item.ended_at || 'sekarang'}`;
    };

    return (
        <>
            <Helmet>
                <title>Kepala Sekolah | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kepala Sekolah">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Kepala Sekolah
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Profil kepala sekolah beserta sambutan dan riwayat pendidikannya
                        </p>
                    </div>
                    <Link
                        to="/admin/kepala-sekolah/create"
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Data
                    </Link>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-line bg-surface py-12 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat data...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-xl border border-line bg-surface px-4 py-12 text-center shadow-sm">
                        <User className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Belum ada data kepala sekolah
                        </h3>
                        <p className="mx-auto mb-6 max-w-md text-muted">
                            Tambahkan profil kepala sekolah agar tampil di halaman profil.
                        </p>
                        <Link
                            to="/admin/kepala-sekolah/create"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Data Pertama
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-5 rounded-xl border border-line bg-surface p-6 shadow-sm"
                            >
                                <div className="h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                                    {item.photo_url ? (
                                        <img
                                            src={item.photo_url}
                                            alt={item.name}
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <User className="h-8 w-8 text-muted" />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold text-body">{item.name}</h3>
                                        <span
                                            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                                item.is_active
                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                    : 'border-line bg-surface-muted text-muted'
                                            }`}
                                        >
                                            {item.is_active ? 'Menjabat' : 'Arsip'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-brand">{item.position}</p>

                                    <div className="mt-2 space-y-0.5 text-xs text-muted">
                                        {item.employee_number && <p>NIP/NUPTK: {item.employee_number}</p>}
                                        {formatPeriod(item) && <p>Menjabat: {formatPeriod(item)}</p>}
                                    </div>

                                    {item.education_history.length > 0 && (
                                        <ul className="mt-3 space-y-1">
                                            {item.education_history.map((history) => (
                                                <li
                                                    key={history}
                                                    className="flex items-start gap-1.5 text-xs text-muted"
                                                >
                                                    <GraduationCap className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted" />
                                                    {history}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            to={`/admin/kepala-sekolah/${item.id}/edit`}
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
                                </div>
                            </div>
                        ))}
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
        </>
    );
}
