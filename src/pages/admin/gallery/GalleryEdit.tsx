import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GalleryForm, { type GalleryFormSubmit } from './GalleryForm';
import { galleryService } from '../../../services/galleryServices';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import type { GalleryPhoto } from '../../../types/gallery';

interface InitialData {
    gallery_category_id: number;
    title: string;
    description: string;
    photos: GalleryPhoto[];
    sort_order: number;
    is_active: boolean;
}

export default function GalleryEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [initialData, setInitialData] = useState<InitialData>({
        gallery_category_id: 0,
        title: '',
        description: '',
        photos: [],
        sort_order: 0,
        is_active: true,
    });
    const [formData, setFormData] = useState<GalleryFormSubmit | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await galleryService.getById(Number(id));

                setInitialData({
                    gallery_category_id: res.gallery_category_id ?? 0,
                    title: res.title || '',
                    description: res.description || '',
                    photos: res.photos ?? [],
                    sort_order: res.sort_order ?? 0,
                    is_active: res.is_active ?? true,
                });
            } catch (error) {
                console.error('Error fetching gallery:', error);
                toast.error('Gagal memuat data galeri', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, toast]);

    const handleSubmit = (data: GalleryFormSubmit) => {
        setFormData(data);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        if (!formData) return;

        setIsSubmitting(true);
        try {
            await galleryService.update(Number(id), {
                gallery_category_id: formData.gallery_category_id,
                title: formData.title,
                description: formData.description,
                photos: formData.photos,
                deleted_photo_ids: formData.deletedPhotoIds,
                sort_order: formData.sort_order,
                is_active: formData.is_active,
            });
            toast.success('Album galeri berhasil diperbarui');
            navigate('/admin/gallery');
        } catch (error) {
            console.error('Error updating gallery:', error);
            toast.error('Gagal memperbarui galeri', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Edit Galeri | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Edit Galeri">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Edit Album Galeri
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Perbarui informasi album, tambah foto baru, atau hapus foto lama
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

                {loading ? (
                    <div className="py-12 text-center">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat data galeri...</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                        <div className="p-6">
                            <GalleryForm
                                initialData={initialData}
                                isEdit
                                onSubmit={handleSubmit}
                                loading={isSubmitting}
                            />
                        </div>
                    </div>
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
                        Simpan perubahan pada album galeri ini
                        {formData && formData.deletedPhotoIds.length > 0
                            ? `? ${formData.deletedPhotoIds.length} foto akan dihapus permanen.`
                            : '?'}
                    </p>
                </div>
            </Modal>
        </>
    );
}
