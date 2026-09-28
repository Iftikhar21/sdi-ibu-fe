import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import PrincipalForm, { type PrincipalFormValues } from './PrincipalForm';
import { principalService } from '../../../services/schoolProfileServices';

interface InitialState {
    values: PrincipalFormValues;
    photoUrl: string | null;
}

export default function PrincipalEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [initialData, setInitialData] = useState<InitialState | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<PrincipalFormValues | null>(null);
    const [photo, setPhoto] = useState<File | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const principal = await principalService.getById(Number(id));

                setInitialData({
                    values: {
                        name: principal.name,
                        position: principal.position ?? 'Kepala Sekolah',
                        employee_number: principal.employee_number ?? '',
                        greeting: principal.greeting ?? '',
                        education_history:
                            principal.education_history.length > 0
                                ? [...principal.education_history]
                                : [''],
                        started_at: principal.started_at ?? '',
                        ended_at: principal.ended_at ?? '',
                        sort_order: principal.sort_order,
                        is_active: principal.is_active,
                    },
                    photoUrl: principal.photo_url ?? null,
                });
            } catch (error) {
                console.error('Error fetching principal:', error);
                toast.error('Gagal memuat data kepala sekolah', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, toast]);

    const confirmSubmit = async () => {
        if (!formData) return;

        setIsSubmitting(true);
        try {
            await principalService.update(Number(id), { ...formData, photo });
            toast.success('Data kepala sekolah berhasil diperbarui');
            navigate('/admin/kepala-sekolah');
        } catch (error) {
            console.error('Error updating principal:', error);
            toast.error('Gagal memperbarui data', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Edit Kepala Sekolah | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Edit Kepala Sekolah">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Edit Kepala Sekolah
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Perbarui profil, sambutan, dan riwayat pendidikan
                        </p>
                    </div>
                    <Link
                        to="/admin/kepala-sekolah"
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
                        <PrincipalForm
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
                    <p className="py-12 text-center text-muted">
                        Data kepala sekolah tidak ditemukan.
                    </p>
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
                        Simpan perubahan pada data &ldquo;{formData?.name}&rdquo;?
                    </p>
                </div>
            </Modal>
        </>
    );
}
