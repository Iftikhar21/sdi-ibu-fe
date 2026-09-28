import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import OrganizationForm, { type OrganizationFormValues } from './OrganizationForm';
import { organizationStructureService } from '../../../services/schoolProfileServices';

export default function OrganizationCreate() {
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<OrganizationFormValues | null>(null);
    const [photo, setPhoto] = useState<File | null>(null);

    const confirmSubmit = async () => {
        if (!formData) return;

        setIsSubmitting(true);
        try {
            await organizationStructureService.create({ ...formData, photo });
            toast.success('Data struktur organisasi berhasil ditambahkan');
            navigate('/admin/struktur-organisasi');
        } catch (error) {
            console.error('Error creating organization structure:', error);
            toast.error('Gagal menambahkan data', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Tambah Struktur Organisasi | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Tambah Struktur Organisasi">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Tambah Struktur Organisasi
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Nama, jabatan, dan foto (opsional)
                        </p>
                    </div>
                    <Link
                        to="/admin/struktur-organisasi"
                        className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Link>
                </div>

                <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <OrganizationForm
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
                        Tambahkan <span className="font-semibold">{formData?.name}</span> sebagai{' '}
                        {formData?.position}?
                    </p>
                </div>
            </Modal>
        </>
    );
}
