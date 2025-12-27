import { useNavigate } from 'react-router-dom';
import VisiMisiForm from './VisiMisiForm';
import { visionMisionService } from '../../../services/visionMisionServices';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import { useState } from 'react';
import Modal from '../../../components/common/Modal';

export default function VisiMisiCreate() {
    const navigate = useNavigate();
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
            navigate('/admin/visi-misi?success=true&message=Visi & Misi berhasil ditambahkan');
        } catch (error) {
            console.error('Error creating vision & mission:', error);
            alert('Gagal menambahkan Visi & Misi');
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Layout title="Tambah Visi & Misi">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                            Tambah Visi & Misi Baru
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Isi visi dan misi organisasi Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/visi-misi')}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </button>
                    </div>
                </div>

                <div className="mx-auto">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                    <p className="text-gray-700">Apakah Anda yakin ingin menambahkan visi & misi baru?</p>
                </div>
            </Modal>
        </>
    );
}