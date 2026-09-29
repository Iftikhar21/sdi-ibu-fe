import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contactService } from '../../../services/contactServices';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import ContactForm from './ContactForm';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function ContactEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [initialData, setInitialData] = useState<{
        logo?: string;
        logo_url?: string;
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
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<{
        logo?: File | null;
        remove_logo?: boolean;
        deskripsi?: string;
        alamat?: string;
        telepon?: string;
        email?: string;
        map_embed?: string;
        socials?: Array<{ platform: string; url: string }>;
    }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await contactService.getById(Number(id));
                console.log('API Response:', res);
                console.log('Socials from API:', res.socials);
                console.log('Socials length:', res.socials?.length || 0);

                setInitialData({
                    logo: res.logo,
                    logo_url: res.logo_url,
                    deskripsi: res.deskripsi,
                    alamat: res.alamat,
                    telepon: res.telepon,
                    email: res.email,
                    map_embed: res.map_embed,
                    socials: res.socials || [] // Pastikan ini array
                });
            } catch (error) {
                console.error('Error fetching contact:', error);
                toast.error('Gagal memuat data kontak', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, toast]);

    // Perbaiki handleSubmit di ContactEdit
    const handleSubmit = async (data: {
        logo?: File | null;
        remove_logo?: boolean;
        deskripsi?: string;
        alamat?: string;
        telepon?: string;
        email?: string;
        map_embed?: string;
        socials?: Array<{ platform: string; url: string }>;
    }) => {
        console.log('=== CONTACT EDIT: handleSubmit called ===');
        console.log('Data received from ContactForm:', data);
        console.log('Socials data:', data.socials);
        console.log('Socials count:', data.socials?.length || 0);

        setIsSubmitting(true);
        try {
            console.log('Updating with data:', data);
            await contactService.update(Number(id), data);
            toast.success('Informasi kontak berhasil diperbarui');
            navigate('/admin/contacts');
        } catch (error) {
            console.error('Error updating contact:', error);

            // Tampilkan error yang lebih spesifik
            toast.error(
                'Gagal memperbarui informasi kontak',
                getApiErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            await contactService.update(Number(id), formData);
            // Redirect ke list dengan parameter success
            toast.success('Informasi kontak berhasil diperbarui');
            navigate('/admin/contacts');
        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('Gagal memperbarui informasi kontak', getApiErrorMessage(error, 'silakan coba lagi'));
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
            <Layout title="Edit Kontak">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Edit Kontak
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Perbarui informasi kontak organisasi Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/contacts')}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-body bg-surface border border-line rounded-lg hover:bg-surface-muted transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-muted">Memuat data kontak...</p>
                        </div>
                    ) : (
                        <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                            <div className="p-6">
                                <ContactForm
                                    key={JSON.stringify(initialData)}
                                    title="Edit Kontak"
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
                    <p className="text-body">Apakah Anda yakin ingin menyimpan perubahan pada informasi kontak ini?</p>
                    <p className="text-sm text-muted mt-2">
                        Perubahan yang sudah disimpan tidak dapat dikembalikan.
                    </p>
                </div>
            </Modal>
        </>
    );
}
