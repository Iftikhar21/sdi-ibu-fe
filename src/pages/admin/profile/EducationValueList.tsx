import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Edit2, Loader2, PlusCircle, Sparkles, Trash2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { educationValueService } from '../../../services/schoolProfileServices';
import type { EducationValue } from '../../../types/schoolProfile';

export default function EducationValueList() {
    const toast = useToast();

    const [values, setValues] = useState<EducationValue[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState<EducationValue | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = async () => {
        try {
            setValues(await educationValueService.getAll());
        } catch (error) {
            console.error('Error fetching education values:', error);
            toast.error('Gagal memuat nilai pendidikan', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const confirmDelete = async () => {
        if (!deleting) return;

        setIsDeleting(true);
        try {
            await educationValueService.delete(deleting.id);
            toast.success('Nilai pendidikan berhasil dihapus');
            fetchData();
            setShowDeleteModal(false);
            setDeleting(null);
        } catch (error) {
            console.error('Error deleting education value:', error);
            toast.error('Gagal menghapus nilai pendidikan', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Nilai Pendidikan | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Nilai Pendidikan">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Nilai Pendidikan
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Nilai yang ditanamkan di sekolah, misalnya Iman, Adab, Ilmu, dan Amal
                        </p>
                    </div>
                    <Link
                        to="/admin/nilai-pendidikan/create"
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Nilai
                    </Link>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-line bg-surface py-12 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat data...</p>
                    </div>
                ) : values.length === 0 ? (
                    <div className="rounded-xl border border-line bg-surface px-4 py-12 text-center shadow-sm">
                        <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Belum ada nilai pendidikan
                        </h3>
                        <p className="mx-auto mb-6 max-w-md text-muted">
                            Tambahkan nilai beserta rinciannya agar tampil di halaman profil.
                        </p>
                        <Link
                            to="/admin/nilai-pendidikan/create"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Nilai Pertama
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {values.map((value) => (
                            <div
                                key={value.id}
                                className="rounded-xl border border-line bg-surface p-6 shadow-sm"
                            >
                                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-body">
                                            {value.title}
                                        </h2>
                                        {value.description && (
                                            <p className="mt-1 text-sm text-muted">
                                                {value.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                                value.is_active
                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                    : 'border-line bg-surface-muted text-muted'
                                            }`}
                                        >
                                            {value.is_active ? 'Tampil' : 'Disembunyikan'}
                                        </span>
                                        <Link
                                            to={`/admin/nilai-pendidikan/${value.id}/edit`}
                                            className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
                                        >
                                            <Edit2 className="mr-1.5 h-4 w-4" />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setDeleting(value);
                                                setShowDeleteModal(true);
                                            }}
                                            className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                        >
                                            <Trash2 className="mr-1.5 h-4 w-4" />
                                            Hapus
                                        </button>
                                    </div>
                                </div>

                                {value.items.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {value.items.map((item) => (
                                            <div
                                                key={item.id ?? item.title}
                                                className="rounded-lg border border-line bg-surface-muted p-4"
                                            >
                                                <p className="mb-1 font-semibold text-brand">
                                                    {item.title}
                                                </p>
                                                <p className="text-sm text-muted">
                                                    {item.description || 'Tanpa deskripsi'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-muted">
                                        Belum ada item pada nilai ini
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Layout>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus"
                type="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={confirmDelete}
                isLoading={isDeleting}
            >
                <div className="py-2">
                    <p className="text-body">
                        Hapus nilai &ldquo;{deleting?.title}&rdquo; beserta {deleting?.items.length ?? 0}{' '}
                        item di dalamnya?
                    </p>
                </div>
            </Modal>
        </>
    );
}
