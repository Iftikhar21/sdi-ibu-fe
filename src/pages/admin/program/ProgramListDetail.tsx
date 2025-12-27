import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Program } from '../../../types/program';
import { programService } from '../../../services/programServices';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Calendar,
    Clock,
    Image as ImageIcon,
    Globe,
    FileText,
    Tag,
    Edit2,
    Trash2,
    Loader2,
    AlertCircle,
    Plus
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';

export default function ProgramDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [program, setProgram] = useState<Program | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                const data = await programService.getById(Number(id));
                setProgram(data);
            } catch (err) {
                console.error('Error fetching program:', err);
                setError('Gagal memuat detail program');
            } finally {
                setLoading(false);
            }
        };

        fetchProgram();
    }, [id]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await programService.delete(Number(id));
            navigate('/admin/program?success=true&message=Program berhasil dihapus');
        } catch (err) {
            console.error('Error deleting program:', err);
            alert('Gagal menghapus program');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Layout title="Memuat Program...">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Memuat detail program...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !program) {
        return (
            <Layout title="Program Tidak Ditemukan">
                <div className="flex flex-col items-center justify-center min-h-screen px-4">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Program Tidak Ditemukan</h1>
                    <p className="text-gray-600 mb-6 text-center">
                        {error || 'Program yang Anda cari tidak ditemukan atau telah dihapus.'}
                    </p>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 inline mr-2" />
                            Kembali
                        </button>
                        <Link
                            to="/admin/program"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Lihat Semua Program
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title={program.title}>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <div className="flex items-center mb-2">
                            <button
                                onClick={() => navigate('/admin/program')}
                                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mr-4 transition-colors duration-200"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Kembali ke Daftar
                            </button>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">{program.title}</h1>
                        <div className="flex items-center mt-2 space-x-4">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${program.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {program.status === 'published' ? (
                                    <>
                                        <Eye className="w-4 h-4 mr-1" />
                                        Published
                                    </>
                                ) : (
                                    <>
                                        <EyeOff className="w-4 h-4 mr-1" />
                                        Draft
                                    </>
                                )}
                            </div>
                            <div className="text-sm text-gray-500">
                                <Tag className="w-4 h-4 inline mr-1" />
                                {program.slug}
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <Link
                            to={`/admin/program/${id}/edit`}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors duration-200"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Program
                        </Link>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-200"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Content */}
                    <div className="lg:col-span-2">
                        {/* Thumbnail */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                                    Thumbnail Program
                                </h2>
                            </div>
                            <div className="p-4">
                                {program.thumbnail && !imageError ? (
                                    <div className="relative">
                                        <img
                                            src={program.thumbnail_url}
                                            alt={program.title}
                                            className="w-full h-auto max-h-96 object-cover rounded-lg shadow-sm"
                                            onError={() => setImageError(true)}
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center p-8">
                                        <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                                        <p className="text-gray-500">Tidak ada thumbnail</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                    Deskripsi Program
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="prose max-w-none">
                                    {program.description.split('\n').map((paragraph, index) => (
                                        <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Metadata */}
                    <div className="space-y-6">
                        {/* Program Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <Globe className="w-5 h-5 mr-2 text-blue-600" />
                                    Informasi Program
                                </h2>
                            </div>
                            <div className="p-4">
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                                            <Tag className="w-4 h-4 mr-2" />
                                            Slug
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {program.slug}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                                            <Globe className="w-4 h-4 mr-2" />
                                            Status
                                        </dt>
                                        <dd className="mt-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${program.status === 'published'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {program.status === 'published' ? (
                                                    <>
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        Published
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="w-3 h-3 mr-1" />
                                                        Draft
                                                    </>
                                                )}
                                            </span>
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Timeline Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                    Timeline
                                </h2>
                            </div>
                            <div className="p-4">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center text-sm text-gray-500 mb-1">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Dibuat Pada
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatDate(program.created_at)}
                                        </div>
                                    </div>

                                    {program.updated_at && program.updated_at !== program.created_at && (
                                        <div>
                                            <div className="flex items-center text-sm text-gray-500 mb-1">
                                                <Clock className="w-4 h-4 mr-2" />
                                                Terakhir Diperbarui
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatDate(program.updated_at)}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="text-xs text-gray-500">
                                            ID Program: <span className="font-mono text-gray-700">{program.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-800">Aksi Cepat</h2>
                            </div>
                            <div className="p-4">
                                <div className="space-y-3">
                                    <Link
                                        to={`/admin/program/${id}/edit`}
                                        className="block w-full text-center px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors duration-200"
                                    >
                                        <Edit2 className="w-4 h-4 inline mr-2" />
                                        Edit Program Ini
                                    </Link>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="block w-full text-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                    >
                                        <Trash2 className="w-4 h-4 inline mr-2" />
                                        Hapus Program Ini
                                    </button>
                                    <Link
                                        to="/admin/program/create"
                                        className="block w-full text-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                                    >
                                        <Plus className="w-4 h-4 inline mr-2" />
                                        Buat Program Baru
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus"
                type="danger"
                confirmText="Ya, Hapus Program"
                cancelText="Batal"
                onConfirm={handleDelete}
                isLoading={deleting}
            >
                <div className="py-2">
                    <p className="text-gray-700">
                        Apakah Anda yakin ingin menghapus program "<strong>{program.title}</strong>"?
                    </p>
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">
                            ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data program termasuk thumbnail akan dihapus permanen.
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
}