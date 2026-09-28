import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Award, CalendarDays, Edit2, ImageOff, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { activityService } from '../../../services/activityServices';
import { getActivityTypeLabel, type Activity, type ActivityType } from '../../../types/activity';

export default function ActivityList() {
    const { type = 'prestasi' } = useParams<{ type: string }>();
    const activityType = type as ActivityType;
    const label = getActivityTypeLabel(activityType);
    const Icon = activityType === 'agenda' ? CalendarDays : Award;

    const toast = useToast();
    const [items, setItems] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState<Activity | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = async () => {
        try {
            setItems(await activityService.getAll(activityType));
        } catch (error) {
            console.error('Error fetching activities:', error);
            toast.error(`Gagal memuat data ${label}`, getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activityType]);

    const confirmDelete = async () => {
        if (!deleting) return;

        setIsDeleting(true);
        try {
            await activityService.delete(deleting.id);
            toast.success(`${label} berhasil dihapus`);
            fetchData();
            setShowDeleteModal(false);
            setDeleting(null);
        } catch (error) {
            console.error('Error deleting activity:', error);
            toast.error(`Gagal menghapus ${label}`, getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>{label} | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title={label}>
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                            <Icon className="h-6 w-6 text-brand" />
                            {label}
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Konten ini tampil pada section Kegiatan di halaman beranda
                        </p>
                    </div>
                    <Link
                        to={`/admin/kegiatan/${activityType}/create`}
                        className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah {label}
                    </Link>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-line bg-surface py-12 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat data...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-xl border border-line bg-surface px-4 py-12 text-center shadow-sm">
                        <Icon className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">Belum ada {label}</h3>
                        <p className="mx-auto mb-6 max-w-md text-muted">
                            Tambahkan foto, judul, dan deskripsi agar tampil di halaman beranda.
                        </p>
                        <Link
                            to={`/admin/kegiatan/${activityType}/create`}
                            className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Data Pertama
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm"
                            >
                                <div className="aspect-video bg-surface-muted">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <ImageOff className="h-8 w-8 text-muted" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-2 flex items-start justify-between gap-3">
                                        <h3 className="font-semibold text-body">{item.title}</h3>
                                        <span
                                            className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
                                                item.is_active
                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                    : 'border-line bg-surface-muted text-muted'
                                            }`}
                                        >
                                            {item.is_active ? 'Tampil' : 'Disembunyikan'}
                                        </span>
                                    </div>

                                    <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-line pt-4">
                                        <span className="text-xs text-muted">
                                            Urutan: {item.sort_order}
                                        </span>
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/admin/kegiatan/${activityType}/${item.id}/edit`}
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
                        Hapus {label.toLowerCase()} &ldquo;{deleting?.title}&rdquo; beserta fotonya?
                    </p>
                </div>
            </Modal>
        </>
    );
}
