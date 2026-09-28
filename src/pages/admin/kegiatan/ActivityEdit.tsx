import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import ActivityForm, { type ActivityFormValues } from './ActivityForm';
import { activityService } from '../../../services/activityServices';
import { getActivityTypeLabel, type ActivityType } from '../../../types/activity';

interface InitialState {
    values: ActivityFormValues;
    photoUrl: string | null;
}

export default function ActivityEdit() {
    const { type = 'prestasi', id } = useParams<{ type: string; id: string }>();
    const activityType = type as ActivityType;
    const label = getActivityTypeLabel(activityType);

    const navigate = useNavigate();
    const toast = useToast();
    const [initialData, setInitialData] = useState<InitialState | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<ActivityFormValues | null>(null);
    const [photo, setPhoto] = useState<File | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const activity = await activityService.getById(Number(id));

                setInitialData({
                    values: {
                        title: activity.title,
                        description: activity.description,
                        sort_order: activity.sort_order,
                        is_active: activity.is_active,
                    },
                    photoUrl: activity.image_url ?? null,
                });
            } catch (error) {
                console.error('Error fetching activity:', error);
                toast.error(`Gagal memuat data ${label}`, getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, label, toast]);

    const confirmSubmit = async () => {
        if (!formData) return;

        setIsSubmitting(true);
        try {
            await activityService.update(Number(id), { ...formData, image: photo });
            toast.success(`${label} berhasil diperbarui`);
            navigate(`/admin/kegiatan/${activityType}`);
        } catch (error) {
            console.error('Error updating activity:', error);
            toast.error(`Gagal memperbarui ${label}`, getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Edit {label} | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title={`Edit ${label}`}>
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">Edit {label}</h1>
                        <p className="text-sm text-muted sm:text-base">
                            Perbarui foto, judul, dan deskripsi kegiatan
                        </p>
                    </div>
                    <Link
                        to={`/admin/kegiatan/${activityType}`}
                        className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Link>
                </div>

                {loading ? (
                    <div className="py-12 text-center">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat data...</p>
                    </div>
                ) : initialData ? (
                    <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                        <ActivityForm
                            type={activityType}
                            initialData={initialData.values}
                            initialPhotoUrl={initialData.photoUrl}
                            onSubmit={(data, selectedPhoto) => {
                                setFormData(data);
                                setPhoto(selectedPhoto);
                                setShowConfirmModal(true);
                            }}
                            loading={isSubmitting}
                        />
                    </div>
                ) : (
                    <p className="py-12 text-center text-muted">Data tidak ditemukan.</p>
                )}
            </Layout>

            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Konfirmasi Perubahan"
                type="warning"
                confirmText="Ya, Simpan Perubahan"
                cancelText="Batal"
                onConfirm={confirmSubmit}
                isLoading={isSubmitting}
            >
                <div className="py-2">
                    <p className="text-body">
                        Simpan perubahan pada &ldquo;{formData?.title}&rdquo;?
                    </p>
                </div>
            </Modal>
        </>
    );
}
