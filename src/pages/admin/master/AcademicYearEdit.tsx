import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import AcademicYearForm, { type AcademicYearFormValues } from './AcademicYearForm';
import { academicYearService } from '../../../services/academicYearServices';

export default function AcademicYearEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [initialData, setInitialData] = useState<AcademicYearFormValues | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<AcademicYearFormValues | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const academicYear = await academicYearService.getById(Number(id));

                setInitialData({
                    name: academicYear.name,
                    start_date: academicYear.start_date?.slice(0, 10) ?? '',
                    end_date: academicYear.end_date?.slice(0, 10) ?? '',
                    is_active: academicYear.is_active,
                });
            } catch (error) {
                console.error('Error fetching academic year:', error);
                toast.error('Gagal memuat tahun ajaran', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, toast]);

    const confirmSubmit = async () => {
        if (!formData) return;

        setIsSubmitting(true);
        try {
            await academicYearService.update(Number(id), formData);
            toast.success('Tahun ajaran berhasil diperbarui');
            navigate('/admin/tahun-ajaran');
        } catch (error) {
            console.error('Error updating academic year:', error);
            toast.error('Gagal memperbarui tahun ajaran', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Edit Tahun Ajaran | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Edit Tahun Ajaran">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Edit Tahun Ajaran
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Perbarui periode dan status aktif tahun ajaran
                        </p>
                    </div>
                    <Link
                        to="/admin/tahun-ajaran"
                        className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Link>
                </div>

                {loading ? (
                    <div className="py-12 text-center">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat data...</p>
                    </div>
                ) : initialData ? (
                    <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                        <AcademicYearForm
                            initialData={initialData}
                            onSubmit={(data) => {
                                setFormData(data);
                                setShowConfirmModal(true);
                            }}
                            loading={isSubmitting}
                        />
                    </div>
                ) : (
                    <p className="py-12 text-center text-muted">Tahun ajaran tidak ditemukan.</p>
                )}
            </Layout>

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
                    <p className="text-body">
                        Simpan perubahan tahun ajaran &ldquo;{formData?.name}&rdquo;?
                    </p>
                    {formData?.is_active && (
                        <p className="mt-2 text-sm text-amber-700">
                            Tahun ajaran aktif sebelumnya akan otomatis menjadi tidak aktif.
                        </p>
                    )}
                </div>
            </Modal>
        </>
    );
}
