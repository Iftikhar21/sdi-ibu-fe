import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import ClassroomForm, { type ClassroomFormValues } from './ClassroomForm';
import { classroomService } from '../../../services/classroomServices';

export default function ClassroomEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [initialData, setInitialData] = useState<ClassroomFormValues | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<ClassroomFormValues | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const classroom = await classroomService.getById(Number(id));

                setInitialData({
                    academic_year_id: classroom.academic_year_id,
                    grade_level: classroom.grade_level,
                    name: classroom.name,
                    quota: classroom.quota,
                    is_active: classroom.is_active,
                });
            } catch (error) {
                console.error('Error fetching classroom:', error);
                toast.error('Gagal memuat data kelas', getApiErrorMessage(error, 'silakan coba lagi'));
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
            await classroomService.update(Number(id), formData);
            toast.success('Kelas berhasil diperbarui');
            navigate('/admin/kelas');
        } catch (error) {
            console.error('Error updating classroom:', error);
            toast.error('Gagal memperbarui kelas', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Edit Kelas | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Edit Kelas">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">Edit Kelas</h1>
                        <p className="text-sm text-muted sm:text-base">
                            Perbarui tahun ajaran, tingkat, nama kelas, atau kuota
                        </p>
                    </div>
                    <Link
                        to="/admin/kelas"
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
                        <ClassroomForm
                            initialData={initialData}
                            onSubmit={(data) => {
                                setFormData(data);
                                setShowConfirmModal(true);
                            }}
                            loading={isSubmitting}
                        />
                    </div>
                ) : (
                    <p className="py-12 text-center text-muted">Data kelas tidak ditemukan.</p>
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
                        Simpan perubahan kelas {formData?.grade_level}
                        {formData?.name}?
                    </p>
                </div>
            </Modal>
        </>
    );
}
