import { useNavigate } from 'react-router-dom';
import { contactService } from '../../../services/contactServices';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import ContactForm from './ContactForm';
import { Helmet } from 'react-helmet-async';

export default function ContactCreate() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<{
        logo?: File;
        deskripsi?: string;
        alamat?: string;
        telepon?: string;
        email?: string;
        map_embed?: string;
        socials?: Array<{ platform: string; url: string }>;
    }>({
        deskripsi: '',
        alamat: '',
        telepon: '',
        email: '',
        map_embed: '',
        socials: []
    });

    const handleSubmit = async (data: {
        logo?: File;
        deskripsi?: string;
        alamat?: string;
        telepon?: string;
        email?: string;
        map_embed?: string;
        socials?: Array<{ platform: string; url: string }>;
    }) => {
        setFormData(data);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            await contactService.create(formData);
            // Redirect ke list dengan parameter success
            navigate('/admin/contacts?success=true&message=Informasi kontak berhasil ditambahkan');
        } catch (error) {
            console.error('Error creating contact:', error);
            alert('Gagal menambahkan informasi kontak');
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
            <Layout title="Tambah Kontak Baru">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                            Tambah Kontak Baru
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Isi informasi kontak organisasi Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/contact')}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6">
                            <ContactForm
                                title="Tambah Kontak"
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
                    <p className="text-gray-700">Apakah Anda yakin ingin menambahkan informasi kontak baru?</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Hanya dapat memiliki 1 informasi kontak aktif. Pastikan isi sudah benar.
                    </p>
                </div>
            </Modal>
        </>
    );
}