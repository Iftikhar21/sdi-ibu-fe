import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import ActivityForm, { type ActivityFormValues } from './ActivityForm';
import { activityService } from '../../../services/activityServices';
import { getActivityTypeLabel, type ActivityType } from '../../../types/activity';

export default function ActivityCreate() {
    const { type = 'prestasi' } = useParams<{ type: string }>();
    const activityType = type as ActivityType;
    const label = getActivityTypeLabel(activityType);

    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<ActivityFormValues | null>(null);
    const [photo, setPhoto] = useState<File | null>(null);

    const confirmSubmit = async () => {
        if (!formData) return;

        setIsSubmitting(true);
        try {
            await activityService.create({ ...formData, type: activityType, image: photo });
            toast.success(`${label} berhasil ditambahkan`);
            navigate(`/admin/kegiatan/${activityType}`);
        } catch (error) {
            console.error('Error creating activity:', error);
            toast.error(`Gagal menambahkan ${label}`, getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Tambah {label} | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title={`Tambah ${label}`}>
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Tambah {label}
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Isi foto, judul, dan deskripsi kegiatan
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

                <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <ActivityForm
                        type={activityType}
                        onSubmit={(data, selectedPhoto) => {
                            setFormData(data);
                            setPhoto(selectedPhoto);
                            setShowConfirmModal(true);
                        }}
                        loading={isSubmitting}
                    />
                </div>
            </Layout>

            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Konfirmasi Penambahan"
                type="warning"
                confirmText="Ya, Tambahkan"
                cancelText="Batal"
                onConfirm={confirmSubmit}
                isLoading={isSubmitting}
            >
                <div className="py-2">
                    <p className="text-body">
                        Tambahkan {label.toLowerCase()} &ldquo;{formData?.title}&rdquo;?
                    </p>
                </div>
            </Modal>
        </>
    );
}
