import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { userService } from '../../../services/manageUserServices';
import UserForm from './ManageUserForm';

export default function UserEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
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
                alert('Gagal memuat data user');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (data: any) => {
        setFormData(data);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmModal(false);
        setIsSubmitting(true);

        try {
            await userService.update(Number(id), formData);
            navigate('/admin/kelola-pengguna?success=true&message=User berhasil diperbarui');
        } catch (error: any) {
            console.error('Error updating user:', error);
            const errorMessage = error.response?.data?.message || 'Gagal memperbarui user';
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Layout title="Edit User">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                            Edit User
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Perbarui data user
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/kelola-pengguna')}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
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
                            <p className="text-gray-600">Memuat data user...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                    <p className="text-gray-700">Apakah Anda yakin ingin menyimpan perubahan pada user ini?</p>
                    <div className="mt-3 text-sm text-gray-600 space-y-1">
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