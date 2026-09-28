import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProgramForm from './ProgramForm';
import { programService } from '../../../services/programServices';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function ProgramEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
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
                toast.error('Gagal memuat data program', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, toast]);

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
            toast.success('Program berhasil diperbarui');
            navigate('/admin/program');
        } catch (error) {
            console.error('Error updating program:', error);
            toast.error('Gagal memperbarui program', getApiErrorMessage(error, 'silakan coba lagi'));
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
            <Layout title="Edit Program">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Edit Program
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Perbarui detail program organisasi Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/program')}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-body bg-surface border border-line rounded-lg hover:bg-surface-muted transition-colors duration-200"
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
                            <p className="text-muted">Memuat data program...</p>
                        </div>
                    ) : (
                        <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
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
                    <p className="text-body">Apakah Anda yakin ingin menyimpan perubahan pada program ini?</p>
                    <p className="text-sm text-muted mt-2">
                        Perubahan yang sudah disimpan tidak dapat dikembalikan.
                    </p>
                </div>
            </Modal>
        </>
    );
}
