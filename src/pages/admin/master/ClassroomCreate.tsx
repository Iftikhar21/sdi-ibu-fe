import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import ClassroomForm, { type ClassroomFormValues } from './ClassroomForm';
import { classroomService } from '../../../services/classroomServices';

export default function ClassroomCreate() {
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<ClassroomFormValues | null>(null);

    const confirmSubmit = async () => {
        if (!formData) return;

        setIsSubmitting(true);
        try {
            await classroomService.create(formData);
            toast.success('Kelas berhasil ditambahkan');
            navigate('/admin/kelas');
        } catch (error) {
            console.error('Error creating classroom:', error);
            toast.error('Gagal menambahkan kelas', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Tambah Kelas | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Tambah Kelas">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">Tambah Kelas</h1>
                        <p className="text-sm text-muted sm:text-base">
                            Pilih tahun ajaran, tingkat, nama kelas, dan kuotanya
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

                <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <ClassroomForm
                        onSubmit={(data) => {
                            setFormData(data);
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
                        Tambahkan kelas {formData?.grade_level} {formData?.name} dengan kuota{' '}
                        {formData?.quota}?
                    </p>
                </div>
            </Modal>
        </>
    );
}
