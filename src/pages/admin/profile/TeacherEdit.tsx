import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import TeacherForm, { type TeacherFormValues } from './TeacherForm';
import { teacherService } from '../../../services/schoolProfileServices';

interface InitialState {
    values: TeacherFormValues;
    photoUrl: string | null;
}

export default function TeacherEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [initialData, setInitialData] = useState<InitialState | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<TeacherFormValues | null>(null);
    const [photo, setPhoto] = useState<File | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const teacher = await teacherService.getById(Number(id));

                setInitialData({
                    values: {
                        name: teacher.name,
                        email: teacher.email ?? '',
                        gender: teacher.gender,
                        last_education: teacher.last_education ?? '',
                        position: teacher.position ?? '',
                        phone: teacher.phone ?? '',
                        address: teacher.address ?? '',
                        sort_order: teacher.sort_order,
                        is_active: teacher.is_active,
                    },
                    photoUrl: teacher.photo_url ?? null,
                });
            } catch (error) {
                console.error('Error fetching teacher:', error);
                toast.error('Gagal memuat data guru', getApiErrorMessage(error, 'silakan coba lagi'));
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
            await teacherService.update(Number(id), { ...formData, photo });
            toast.success('Data guru berhasil diperbarui');
            navigate('/admin/guru');
        } catch (error) {
            console.error('Error updating teacher:', error);
            toast.error('Gagal memperbarui data guru', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Edit Guru | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Edit Guru">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Edit Data Guru
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Perbarui data pengajar beserta fotonya
                        </p>
                    </div>
                    <Link
                        to="/admin/guru"
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
                        <TeacherForm
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
                    <p className="py-12 text-center text-muted">Data guru tidak ditemukan.</p>
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
