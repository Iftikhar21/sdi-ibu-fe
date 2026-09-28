import { useNavigate } from 'react-router-dom';
import NewsForm from './NewsForm';
import { newsService } from '../../../services/newsServices';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function NewsCreate() {
    const toast = useToast();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<{
        title: string;
        content: string;
        thumbnail?: File;
        photos?: File[];
    }>({
        title: '',
        content: '',
        photos: []
    });

    const handleSubmit = async (data: {
        title: string;
        content: string;
        thumbnail?: File;
        photos?: File[];
    }) => {
        setFormData(data);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            await newsService.create(formData);
            toast.success('Berita berhasil dibuat');
            navigate('/admin/news');
        } catch (error) {
            console.error('Error creating news:', error);
            toast.error('Gagal membuat berita', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Buat Berita Baru">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Buat Berita Baru
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Tulis berita terbaru untuk organisasi Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/news')}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-body bg-surface border border-line rounded-lg hover:bg-surface-muted transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </button>
                    </div>
                </div>

                <div className="mx-auto">
                    <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                        <div className="p-6">
                            <NewsForm
                                title="Buat Berita Baru"
                                isEdit={false}
                                onSubmit={handleSubmit}
                                loading={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            </Layout>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Konfirmasi Pembuatan"
                type="warning"
                confirmText="Ya, Buat Berita"
                cancelText="Batal"
                onConfirm={confirmSubmit}
                isLoading={isSubmitting}
            >
                <div className="py-2">
                    <p className="text-body">Apakah Anda yakin ingin membuat berita baru?</p>
                    <p className="text-sm text-muted mt-2">
                        Pastikan semua informasi dan foto sudah benar sebelum menyimpan.
                    </p>
                    {formData.photos && formData.photos.length > 0 && (
                        <p className="text-sm text-blue-600 mt-1">
                            Akan mengupload {formData.photos.length} foto.
                        </p>
                    )}
                </div>
            </Modal>
        </>
    );
}
