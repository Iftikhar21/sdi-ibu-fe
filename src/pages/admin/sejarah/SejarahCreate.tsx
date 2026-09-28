import { useNavigate } from 'react-router-dom';
import SejarahForm from './SejarahForm';
import { historyService } from '../../../services/historyServices';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function SejarahCreate() {
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formContent, setFormContent] = useState('');

    const handleSubmit = async (content: string) => {
        setFormContent(content);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            await historyService.create({ content: formContent });
            // Redirect ke list dengan parameter success
            toast.success('Sejarah berhasil ditambahkan');
            navigate('/admin/sejarah');
        } catch (error) {
            console.error('Error creating history:', error);
            toast.error('Gagal menambahkan sejarah', getApiErrorMessage(error, 'silakan coba lagi'));
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
            <Layout title="Tambah Sejarah Baru">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Tambah Sejarah Baru
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Isi konten sejarah yang ingin ditambahkan
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
                    <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                        <div className="p-6">
                            <SejarahForm
                                title="Tambah Sejarah"
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
                title="Konfirmasi Penambahan"
                type="warning"
                confirmText="Ya, Tambahkan"
                cancelText="Batal"
                onConfirm={confirmSubmit}
                isLoading={isSubmitting}
            >
                <div className="py-2">
                    <p className="text-body">Apakah Anda yakin ingin menambahkan sejarah baru?</p>
                </div>
            </Modal>
        </>
    );
}
