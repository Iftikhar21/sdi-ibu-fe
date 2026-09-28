import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import EducationValueForm, { type EducationValueFormValues } from './EducationValueForm';
import { educationValueService } from '../../../services/schoolProfileServices';

export default function EducationValueCreate() {
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<EducationValueFormValues | null>(null);

    const confirmSubmit = async () => {
        if (!formData) return;

        setIsSubmitting(true);
        try {
            await educationValueService.create({
                title: formData.title,
                description: formData.description,
                items: formData.items,
                sort_order: formData.sort_order,
                is_active: formData.is_active,
            });
            toast.success('Nilai pendidikan berhasil ditambahkan');
            navigate('/admin/nilai-pendidikan');
        } catch (error) {
            console.error('Error creating education value:', error);
            toast.error('Gagal menambahkan nilai pendidikan', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Tambah Nilai Pendidikan | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Tambah Nilai Pendidikan">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Tambah Nilai Pendidikan
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Isi judul, deskripsi, lalu tambahkan item nilai beserta penjelasannya
                        </p>
                    </div>
                    <Link
                        to="/admin/nilai-pendidikan"
                        className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Link>
                </div>

                <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <EducationValueForm
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
                        Tambahkan nilai &ldquo;{formData?.title}&rdquo; dengan {formData?.items.length ?? 0}{' '}
                        item?
                    </p>
                </div>
            </Modal>
        </>
    );
}
