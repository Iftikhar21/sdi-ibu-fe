import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NewsForm from './NewsForm';
import { newsService } from '../../../services/newsServices';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';

export default function NewsEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState<{
        title: string;
        content: string;
        thumbnail?: string;
        thumbnail_url?: string;
        photos?: Array<{ id: number; path: string; photo_url: string }>;
    }>({
        title: '',
        content: ''
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<{
        title?: string;
        content?: string;
        thumbnail?: File | null;
        photos?: File[];
        deleted_photos?: number[];
    }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await newsService.getById(Number(id));
                setInitialData({
                    title: res.title,
                    content: res.content,
                    thumbnail: res.thumbnail_url, // ✅ thumbnail = thumbnail_url
                    photos: res.photos?.map(photo => ({
                        id: photo.id,
                        url: photo.photo_url, // ✅ URL untuk preview
                    })) ?? [],
                });
            } catch (error) {
                console.error('Error fetching news:', error);
                alert('Gagal memuat data berita');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (data: {
        title?: string;
        content?: string;
        thumbnail?: File | null;
        photos?: File[];
        deleted_photos?: number[];
    }) => {
        setFormData(data);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            await newsService.update(Number(id), formData);
            navigate('/admin/news?success=true&message=Berita berhasil diperbarui');
        } catch (error) {
            console.error('Error updating news:', error);
            alert('Gagal memperbarui berita');
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
            <Layout title="Edit Berita">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                            Edit Berita
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Perbarui berita organisasi Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/news')}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </button>
                    </div>
                </div>

                <div className="mx-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Memuat data berita...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <NewsForm
                                    title="Edit Berita"
                                    isEdit={true}
                                    initialData={initialData}
                                    onSubmit={handleSubmit}
                                    loading={isSubmitting}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Layout>

            {/* Confirmation Modal */}
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
                    <p className="text-gray-700">Apakah Anda yakin ingin menyimpan perubahan pada berita ini?</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Perubahan yang sudah disimpan tidak dapat dikembalikan.
                    </p>
                </div>
            </Modal>
        </>
    );
}