import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GalleryForm, { type GalleryFormSubmit } from './GalleryForm';
import { galleryService } from '../../../services/galleryServices';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function GalleryCreate() {
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<GalleryFormSubmit | null>(null);

    const handleSubmit = (data: GalleryFormSubmit) => {
        setFormData(data);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        if (!formData) return;

        setIsSubmitting(true);
        try {
            await galleryService.create({
                gallery_category_id: formData.gallery_category_id,
                title: formData.title,
                description: formData.description,
                photos: formData.photos,
                sort_order: formData.sort_order,
                is_active: formData.is_active,
            });
            toast.success('Album galeri berhasil ditambahkan');
            navigate('/admin/gallery');
        } catch (error) {
            console.error('Error creating gallery:', error);
            toast.error('Gagal menambahkan galeri', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Tambah Galeri | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Tambah Galeri">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Tambah Album Galeri
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Pilih kategori, isi judul, lalu unggah beberapa foto sekaligus
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/gallery')}
                        className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-body transition-colors duration-200 hover:bg-surface-muted"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                    <div className="p-6">
                        <GalleryForm onSubmit={handleSubmit} loading={isSubmitting} />
                    </div>
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
                        Tambahkan album galeri ini dengan {formData?.photos.length ?? 0} foto?
                    </p>
                </div>
            </Modal>
        </>
    );
}
