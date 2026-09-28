import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { userService } from '../../../services/manageUserServices';
import UserForm from './ManageUserForm';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function UserEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await userService.getById(Number(id));
                setUserData({
                    name: res.name,
                    email: res.email,
                    role: res.role.role_name
                });
            } catch (error) {
                console.error('Error fetching user:', error);
                toast.error('Gagal memuat data user', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, toast]);

    const handleSubmit = async (data: any) => {
        setFormData(data);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmModal(false);
        setIsSubmitting(true);

        try {
            await userService.update(Number(id), formData);
            toast.success('User berhasil diperbarui');
            navigate('/admin/kelola-pengguna');
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Gagal memperbarui user', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Edit User">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Edit User
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Perbarui data user
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/kelola-pengguna')}
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
                            <p className="text-muted">Memuat data user...</p>
                        </div>
                    ) : (
                        <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                            <div className="p-6">
                                <UserForm
                                    title="Edit User"
                                    initialData={userData}
                                    onSubmit={handleSubmit}
                                    loading={isSubmitting}
                                    isEdit={true}
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
                    <p className="text-body">Apakah Anda yakin ingin menyimpan perubahan pada user ini?</p>
                    <div className="mt-3 text-sm text-muted space-y-1">
                        <p><strong>Nama:</strong> {formData?.name}</p>
                        <p><strong>Email:</strong> {formData?.email}</p>
                        <p><strong>Role:</strong> {formData?.role}</p>
                        {formData?.password && (
                            <p><strong>Password:</strong> Akan diubah</p>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
}
