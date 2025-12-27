import { useNavigate } from 'react-router-dom';
import ProgramForm from './ProgramForm';
import { programService } from '../../../services/programServices';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';

export default function ProgramCreate() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        thumbnail?: File;
        status: 'draft' | 'published';
    }>({
        title: '',
        description: '',
        status: 'draft'
    });

    const handleSubmit = async (data: {
        title: string;
        description: string;
        thumbnail?: File;
        status: 'draft' | 'published';
    }) => {
        setFormData(data);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            await programService.create(formData);
            // Redirect ke list dengan parameter success
            navigate('/admin/program?success=true&message=Program berhasil ditambahkan');
        } catch (error) {
            console.error('Error creating program:', error);
            alert('Gagal menambahkan program');
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
            <Layout title="Tambah Program Baru">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                            Tambah Program Baru
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Isi detail program organisasi Anda
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6">
                            <ProgramForm
                                title="Tambah Program"
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
                    <p className="text-gray-700">Apakah Anda yakin ingin menambahkan program baru?</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Pastikan semua informasi sudah benar sebelum menyimpan.
                    </p>
                </div>
            </Modal>
        </>
    );
}