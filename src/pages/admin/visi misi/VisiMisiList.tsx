import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { visionMisionService } from '../../../services/visionMisionServices';
import {
    PlusCircle,
    Edit2,
    Trash2,
    Loader2,
    AlertCircle,
    CheckCircle,
    Eye,
    Target,
    X
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import type { VisionMision } from '../../../types/visionMision';
import { Helmet } from 'react-helmet-async';

export default function VisiMisiList() {
    const [data, setData] = useState<VisionMision[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<VisionMision | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    const location = useLocation();
    const navigate = useNavigate();

    // Cek URL parameters untuk success message
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const message = params.get('message');
        const success = params.get('success') === 'true';

        if (success && message) {
            setSuccessMessage(message);

            // Hapus parameters dari URL
            navigate('/admin/visi-misi', { replace: true });

            // Auto-hide success message setelah 5 detik
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [location, navigate]);

    const fetchData = async () => {
        try {
            const res = await visionMisionService.getAll();
            setData(res);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (item: VisionMision) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;

        setDeletingId(selectedItem.id);
        try {
            await visionMisionService.delete(selectedItem.id);
            setSuccessMessage('Visi & Misi berhasil dihapus');
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Gagal menghapus Visi & Misi');
        } finally {
            setDeletingId(null);
            setSelectedItem(null);
            setShowDeleteModal(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const canAddNew = data.length === 0;

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kelola Visi & Misi">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                            Kelola Visi & Misi SDI Ibu
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            {canAddNew
                                ? 'Tambahkan visi dan misi organisasi Anda'
                                : 'Kelola visi dan misi organisasi Anda'}
                        </p>
                    </div>
                </div>

                {/* Success Message Banner */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                            <span className="text-green-800">{successMessage}</span>
                        </div>
                        <button
                            onClick={() => setSuccessMessage('')}
                            className="text-green-600 hover:text-green-800"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="mx-auto">
                    {/* Action Bar */}
                    <div className="flex justify-between items-center">
                        <div>
                            {canAddNew ? (
                                <Link
                                    to="/admin/visi-misi/create"
                                    className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Tambah Visi & Misi
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    {data.length > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Catatan Penting</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Hanya dapat memiliki 1 visi & misi aktif. Untuk menambahkan visi & misi baru,
                                        hapus terlebih dahulu yang sudah ada.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                        {loading ? (
                            <div className="py-12 text-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Memuat data visi & misi...</p>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="py-12 text-center">
                                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Belum ada Visi & Misi
                                </h3>
                                <p className="text-gray-600 max-w-md mx-auto mb-6">
                                    Mulai dengan menambahkan visi dan misi organisasi Anda.
                                </p>
                                <Link
                                    to="/admin/visi-misi/create"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Tambah Visi & Misi Pertama
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {data.map((item) => (
                                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Visi - Kiri */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                                    <Eye className="w-5 h-5 text-blue-600 mr-2" />
                                                    Visi
                                                </h3>
                                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                    <p className="text-gray-700">
                                                        {item.vision || 'Belum diisi'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Misi - Kanan */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                                    <Target className="w-5 h-5 text-green-600 mr-2" />
                                                    Misi
                                                </h3>
                                                {item.missions && item.missions.length > 0 ? (
                                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                        <ol className="space-y-3">
                                                            {item.missions.map((mission, index) => (
                                                                <li key={index} className="flex">
                                                                    <span className="text-green-600 font-medium mr-3">{index + 1}.</span>
                                                                    <span className="text-gray-700">{mission}</span>
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <p className="text-gray-500 italic">
                                                            Belum ada misi yang ditambahkan
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
                                            <Link
                                                to={`/admin/visi-misi/${item.id}/edit`}
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                                            >
                                                <Edit2 className="w-4 h-4 mr-2" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(item)}
                                                disabled={deletingId === item.id}
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                {deletingId === item.id ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                )}
                                                {deletingId === item.id ? 'Menghapus...' : 'Hapus'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Layout>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus"
                type="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={confirmDelete}
                isLoading={deletingId !== null}
            >
                <div className="py-2">
                    <p className="text-gray-700">
                        Apakah Anda yakin ingin menghapus visi & misi ini?
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Tindakan ini tidak dapat dibatalkan. Setelah dihapus, Anda dapat menambahkan visi & misi baru.
                    </p>
                </div>
            </Modal>
        </>
    );
}