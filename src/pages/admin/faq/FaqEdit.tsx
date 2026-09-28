import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FaqForm from './FaqForm';
import { faqService } from '../../../services/faqServices';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../context/toast';

type FormValues = {
    question: string;
    answer: string;
    sort_order: number;
    is_active: boolean;
};

export default function FaqEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [initialData, setInitialData] = useState<FormValues>({
        question: '',
        answer: '',
        sort_order: 0,
        is_active: true,
    });
    const [formData, setFormData] = useState<FormValues>(initialData);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await faqService.getById(Number(id));
                setInitialData({
                    question: res.question || '',
                    answer: res.answer || '',
                    sort_order: res.sort_order ?? 0,
                    is_active: res.is_active ?? true,
                });
            } catch (error) {
                console.error('Error fetching FAQ:', error);
                toast.error('Gagal memuat data FAQ', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, toast]);

    const handleSubmit = (data: FormValues) => {
        setFormData(data);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            await faqService.update(Number(id), formData);
            toast.success('FAQ berhasil diperbarui');
            navigate('/admin/faq');
        } catch (error) {
            console.error('Error updating FAQ:', error);
            toast.error('Gagal memperbarui FAQ', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Edit FAQ | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Edit FAQ">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Edit FAQ
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Perbarui pertanyaan dan jawaban FAQ
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/faq')}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-body bg-surface border border-line rounded-lg hover:bg-surface-muted transition-colors duration-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-muted">Memuat data FAQ...</p>
                    </div>
                ) : (
                    <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                        <div className="p-6">
                            <FaqForm
                                initialData={initialData}
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
                    <p className="text-body">Apakah Anda yakin ingin menyimpan perubahan pada FAQ ini?</p>
                </div>
            </Modal>
        </>
    );
}
