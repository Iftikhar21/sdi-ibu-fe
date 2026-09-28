import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VisiMisiForm from './VisiMisiForm';
import { visionMisionService } from '../../../services/visionMisionServices';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function VisiMisiEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [initialData, setInitialData] = useState<{ vision: string; missions: string[] }>({
        vision: '',
        missions: ['']
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<{ vision: string; missions: string[] }>({
        vision: '',
        missions: ['']
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await visionMisionService.getById(Number(id));
                setInitialData({
                    vision: res.vision || '',
                    missions: res.missions && res.missions.length > 0 ? res.missions : ['']
                });
            } catch (error) {
                console.error('Error fetching vision & mission:', error);
                toast.error('Gagal memuat data visi & misi', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, toast]);

    const handleSubmit = async (data: { vision: string; missions: string[] }) => {
        setFormData(data);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Filter out empty missions
            const missions = formData.missions.filter(mission => mission.trim() !== '');
            await visionMisionService.update(Number(id), {
                vision: formData.vision,
                missions
            });
            // Redirect ke list dengan parameter success
            toast.success('Visi & Misi berhasil diperbarui');
            navigate('/admin/visi-misi');
        } catch (error) {
            console.error('Error updating vision & mission:', error);
            toast.error('Gagal memperbarui Visi & Misi', getApiErrorMessage(error, 'silakan coba lagi'));
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
            <Layout title="Edit Visi & Misi">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Edit Visi & Misi
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Perbarui visi dan misi organisasi Anda
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
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-muted">Memuat data visi & misi...</p>
                        </div>
                    ) : (
                        <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                            <div className="p-6">
                                <VisiMisiForm
                                    title="Edit Visi & Misi"
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
                    <p className="text-body">Apakah Anda yakin ingin menyimpan perubahan pada visi & misi ini?</p>
                </div>
            </Modal>
        </>
    );
}
