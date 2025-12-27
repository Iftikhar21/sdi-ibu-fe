import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProgramForm from './ProgramForm';
import { programService } from '../../../services/programServices';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';

export default function ProgramEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState<{
        title: string;
        description: string;
        thumbnail?: string;
        status: 'draft' | 'published';
    }>({
        title: '',
        description: '',
        status: 'draft'
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<{
        title?: string;
        description?: string;
        thumbnail?: File | null;
        status?: 'draft' | 'published';
    }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await programService.getById(Number(id));
                setInitialData({
                    title: res.title,
                    description: res.description,
                    thumbnail: res.thumbnail_url,
                    status: res.status
                });
            } catch (error) {
                console.error('Error fetching program:', error);
                alert('Gagal memuat data program');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (data: {
        title?: string;
        description?: string;
        thumbnail?: File | null;
        status?: 'draft' | 'published';
    }) => {
        setFormData(data);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            await programService.update(Number(id), formData);
            // Redirect ke list dengan parameter success
            navigate('/admin/program?success=true&message=Program berhasil diperbarui');
        } catch (error) {
            console.error('Error updating program:', error);
            alert('Gagal memperbarui program');
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Layout title="Edit Program">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                            Edit Program
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Perbarui detail program organisasi Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/program')}
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
                            <p className="text-gray-600">Memuat data program...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <ProgramForm
                                    title="Edit Program"
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
                    <p className="text-gray-700">Apakah Anda yakin ingin menyimpan perubahan pada program ini?</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Perubahan yang sudah disimpan tidak dapat dikembalikan.
                    </p>
                </div>
            </Modal>
        </>
    );
}