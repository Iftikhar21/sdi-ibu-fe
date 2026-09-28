import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import AcademicYearForm, { type AcademicYearFormValues } from './AcademicYearForm';
import { academicYearService } from '../../../services/academicYearServices';

export default function AcademicYearCreate() {
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<AcademicYearFormValues | null>(null);

    const confirmSubmit = async () => {
        if (!formData) return;

        setIsSubmitting(true);
        try {
            await academicYearService.create(formData);
            toast.success('Tahun ajaran berhasil ditambahkan');
            navigate('/admin/tahun-ajaran');
        } catch (error) {
            console.error('Error creating academic year:', error);
            toast.error('Gagal menambahkan tahun ajaran', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Tambah Tahun Ajaran | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Tambah Tahun Ajaran">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Tambah Tahun Ajaran
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Tentukan periode tahun ajaran dan status aktifnya
                        </p>
                    </div>
                    <Link
                        to="/admin/tahun-ajaran"
                        className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Link>
                </div>

                <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <AcademicYearForm
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
                        Tambahkan tahun ajaran &ldquo;{formData?.name}&rdquo;?
                    </p>
                    {formData?.is_active && (
                        <p className="mt-2 text-sm text-amber-700">
                            Tahun ajaran aktif sebelumnya akan otomatis menjadi tidak aktif.
                        </p>
                    )}
                </div>
            </Modal>
        </>
    );
}
