import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import SejarahForm from './SejarahForm';
import { historyService } from '../../../services/historyServices';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function SejarahEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formContent, setFormContent] = useState('');

    // Cek apakah ada message dari redirect sebelumnya
    const message = new URLSearchParams(location.search).get('message');
    const success = new URLSearchParams(location.search).get('success') === 'true';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await historyService.getById(Number(id));
                setContent(res.content);
            } catch (error) {
                console.error('Error fetching history:', error);
                toast.error('Gagal memuat data sejarah', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, toast]);

    const handleSubmit = async (value: string) => {
        setFormContent(value);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        console.log('Confirm submit clicked', { id, formContent });

        setShowConfirmModal(false); // ✅ tutup modal dulu
        setIsSubmitting(true);

        try {
            await historyService.update(Number(id), {
                content: formContent,
            });

            toast.success('Sejarah berhasil diperbarui');
            navigate('/admin/sejarah');
        } catch (error) {
            console.error('Error updating history:', error);
            toast.error('Gagal memperbarui sejarah', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Edit Sejarah">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Edit Sejarah
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Perbarui konten sejarah dengan informasi terbaru
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/sejarah')}
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
                            <p className="text-muted">Memuat data sejarah...</p>
                        </div>
                    ) : (
                        <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                            <div className="p-6">
                                <SejarahForm
                                    title="Edit Sejarah"
                                    initialValue={content}
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
                    <p className="text-body">Apakah Anda yakin ingin menyimpan perubahan pada sejarah ini?</p>
                </div>
            </Modal>
        </>
    );
}
