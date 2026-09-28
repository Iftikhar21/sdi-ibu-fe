import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaqForm from './FaqForm';
import { faqService } from '../../../services/faqServices';
import { ArrowLeft } from 'lucide-react';
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

export default function FaqCreate() {
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<FormValues>({
        question: '',
        answer: '',
        sort_order: 0,
        is_active: true,
    });

    const handleSubmit = (data: FormValues) => {
        setFormData(data);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            await faqService.create(formData);
            toast.success('FAQ berhasil ditambahkan');
            navigate('/admin/faq');
        } catch (error) {
            console.error('Error creating FAQ:', error);
            toast.error('Gagal menambahkan FAQ', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Tambah FAQ | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Tambah FAQ">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Tambah FAQ Baru
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Tuliskan pertanyaan yang sering ditanyakan beserta jawabannya
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

                <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                    <div className="p-6">
                        <FaqForm onSubmit={handleSubmit} loading={isSubmitting} />
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
                    <p className="text-body">Apakah Anda yakin ingin menambahkan FAQ ini?</p>
                </div>
            </Modal>
        </>
    );
}
