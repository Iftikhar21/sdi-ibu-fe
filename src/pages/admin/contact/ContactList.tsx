import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Contact } from '../../../types/contact';
import { contactService } from '../../../services/contactServices';
import {
    PlusCircle,
    Edit2,
    Trash2,
    Loader2,
    AlertCircle,
    Building,
    Phone,
    Mail,
    MapPin,
    Globe,
    Eye,
    Map,
    ExternalLink
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function ContactList() {
    const toast = useToast();
    const [data, setData] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Contact | null>(null);
    const fetchData = async () => {
        try {
            const res = await contactService.getAll();
            setData(res);
        } catch (error: any) {
            if (error.response?.status !== 404) {
                console.error('Error fetching data:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (item: Contact) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;

        setDeletingId(selectedItem.id);
        try {
            await contactService.delete(selectedItem.id);
            toast.success('Informasi kontak berhasil dihapus');
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Gagal menghapus informasi kontak', getApiErrorMessage(error, 'silakan coba lagi'));
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

    // Fungsi untuk mengekstrak src dari iframe
    const extractMapSrc = (iframe: string): string => {
        if (!iframe) return '';
        const match = iframe.match(/src="([^"]+)"/);
        return match ? match[1] : iframe;
    };

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kelola Kontak">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Kelola Kontak SDI Ibu
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            {canAddNew
                                ? 'Tambahkan informasi kontak organisasi'
                                : 'Kelola informasi kontak organisasi'}
                        </p>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="font-medium text-2xl sm:text-3xl text-blue-600">{data.length}/1</p>
                        <p className="text-xs sm:text-sm text-body">
                            {data.length === 1 ? 'Kontak Aktif' : 'Belum Ada'}
                        </p>
                    </div>
                </div>

                <div className="mx-auto">
                    {/* Action Bar */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            {canAddNew ? (
                                <Link
                                    to="/admin/contacts/create"
                                    className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Tambah Kontak
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-muted text-muted font-medium text-sm rounded-lg">
                                    <Eye className="w-4 h-4" />
                                    Hanya Dapat 1 Kontak
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                        {loading ? (
                            <div className="py-12 text-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                                <p className="text-muted">Memuat data kontak...</p>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="py-12 text-center">
                                <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-body mb-2">
                                    Belum ada Informasi Kontak
                                </h3>
                                <p className="text-muted max-w-md mx-auto mb-6">
                                    Mulai dengan menambahkan informasi kontak organisasi Anda.
                                </p>
                                <Link
                                    to="/admin/contacts/create"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Tambah Kontak Pertama
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-line">
                                {data.map((item) => (
                                    <div key={item.id} className="p-6 hover:bg-surface-muted transition-colors duration-150">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            {/* Logo */}
                                            <div className="lg:w-48 flex-shrink-0">
                                                <div className="aspect-square rounded-lg overflow-hidden bg-surface-muted border border-line">
                                                    {item.logo_url ? (
                                                        <img
                                                            src={item.logo_url}
                                                            alt="Logo Organisasi"
                                                            className="w-full h-full object-contain p-4"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-line">
                                                            <Building className="w-12 h-12 text-muted" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-body mb-3">
                                                            Informasi Kontak Organisasi
                                                        </h3>

                                                        {/* Contact Details */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                            {/* Alamat */}
                                                            <div className="flex items-start">
                                                                <MapPin className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-body">Alamat</p>
                                                                    <p className="text-sm text-muted">
                                                                        {item.alamat || 'Belum diisi'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Telepon */}
                                                            <div className="flex items-start">
                                                                <Phone className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-body">Telepon</p>
                                                                    <p className="text-sm text-muted">
                                                                        {item.telepon || 'Belum diisi'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Email */}
                                                            <div className="flex items-start">
                                                                <Mail className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-body">Email</p>
                                                                    <p className="text-sm text-muted">
                                                                        {item.email || 'Belum diisi'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Social Media */}
                                                            <div className="flex items-start">
                                                                <Globe className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-body">Media Sosial</p>
                                                                    <p className="text-sm text-muted">
                                                                        {item.socials?.length || 0} platform
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Deskripsi */}
                                                        {item.deskripsi && (
                                                            <div className="mb-3">
                                                                <p className="text-sm text-muted line-clamp-2">
                                                                    {item.deskripsi}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Metadata */}
                                                <div className="flex items-center text-sm text-muted">
                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                        ID: {item.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Map Section - TAMBAHAN BARU */}
                                        {item.map_embed && (
                                            <div className="mt-6 pt-4 border-t border-line">
                                                <div className="flex items-center mb-4">
                                                    <Map className="w-5 h-5 text-blue-600 mr-2" />
                                                    <h3 className="text-md font-semibold text-body">
                                                        Lokasi Peta
                                                    </h3>
                                                </div>

                                                {/* Map Container */}
                                                <iframe
                                                    src={item.map_embed}
                                                    className="w-full h-64 border-0"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    allowFullScreen
                                                />
                                            </div>
                                        )}

                                        {/* Social Media Details */}
                                        {item.socials && item.socials.length > 0 && (
                                            <div className="mt-6 pt-4 border-t border-line">
                                                <div className="flex items-center mb-4">
                                                    <Globe className="w-5 h-5 text-blue-600 mr-2" />
                                                    <h3 className="text-md font-semibold text-body">
                                                        Media Sosial
                                                    </h3>
                                                </div>

                                                <div className="space-y-2">
                                                    {item.socials.map((social, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-surface-muted rounded-lg">
                                                            <div className="flex items-center">
                                                                <Globe className="w-4 h-4 text-muted mr-3" />
                                                                <div>
                                                                    <p className="font-medium text-body">{social.platform}</p>
                                                                    <p className="text-sm text-muted truncate max-w-xs">
                                                                        {social.url}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <a
                                                                href={social.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-line">
                                            <Link
                                                to={`/admin/contacts/${item.id}/edit`}
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

                    {/* Footer Note */}
                    {data.length > 0 && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Catatan Penting</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Hanya dapat memiliki 1 informasi kontak aktif. Untuk menambahkan kontak baru,
                                        hapus terlebih dahulu kontak yang sudah ada.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
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
                    <p className="text-body">
                        Apakah Anda yakin ingin menghapus informasi kontak ini?
                    </p>
                    <p className="text-sm text-muted mt-2">
                        Tindakan ini tidak dapat dibatalkan. Setelah dihapus, Anda dapat menambahkan kontak baru.
                    </p>
                </div>
            </Modal>
        </>
    );
}
