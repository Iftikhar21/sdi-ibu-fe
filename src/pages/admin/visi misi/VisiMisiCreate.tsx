import { useNavigate } from 'react-router-dom';
import VisiMisiForm from './VisiMisiForm';
import { visionMisionService } from '../../../services/visionMisionServices';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function VisiMisiCreate() {
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<{ vision: string; missions: string[] }>({
        vision: '',
        missions: ['']
    });

    const handleSubmit = async (data: { vision: string; missions: string[] }) => {
        setFormData(data);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Filter out empty missions
            const missions = formData.missions.filter(mission => mission.trim() !== '');
            await visionMisionService.create({
                vision: formData.vision,
                missions
            });
            // Redirect ke list dengan parameter success
            toast.success('Visi & Misi berhasil ditambahkan');
            navigate('/admin/visi-misi');
        } catch (error) {
            console.error('Error creating vision & mission:', error);
            toast.error('Gagal menambahkan Visi & Misi', getApiErrorMessage(error, 'silakan coba lagi'));
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
            <Layout title="Tambah Visi & Misi">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Tambah Visi & Misi Baru
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Isi visi dan misi organisasi Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/visi-misi')}
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
                            <VisiMisiForm
                                title="Tambah Visi & Misi"
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
                    <p className="text-body">Apakah Anda yakin ingin menambahkan visi & misi baru?</p>
                </div>
            </Modal>
        </>
    );
}
