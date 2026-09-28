import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import OrganizationForm, { type OrganizationFormValues } from './OrganizationForm';
import { organizationStructureService } from '../../../services/schoolProfileServices';
import type { OrganizationStructure } from '../../../types/schoolProfile';

export default function OrganizationEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const [item, setItem] = useState<OrganizationStructure | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState<OrganizationFormValues | null>(null);
    const [photo, setPhoto] = useState<File | null>(null);

    useEffect(() => {
        const fetchItem = async () => {
            if (!id) return;

            try {
                setItem(await organizationStructureService.getById(Number(id)));
            } catch (error) {
                console.error('Error fetching organization structure:', error);
                toast.error('Gagal memuat data', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const confirmSubmit = async () => {
        if (!formData || !id) return;

        setIsSubmitting(true);
        try {
            await organizationStructureService.update(Number(id), { ...formData, photo });
            toast.success('Data struktur organisasi berhasil diperbarui');
            navigate('/admin/struktur-organisasi');
        } catch (error) {
            console.error('Error updating organization structure:', error);
            toast.error('Gagal memperbarui data', getApiErrorMessage(error, 'silakan coba lagi'));
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Edit Struktur Organisasi | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Edit Struktur Organisasi">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Edit Struktur Organisasi
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Ubah nama, jabatan, urutan tampil, atau status tampil
                        </p>
                    </div>
                    <Link
                        to="/admin/struktur-organisasi"
                        className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Link>
                </div>

                <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                    {loading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-muted">Memuat data...</p>
                        </div>
                    ) : item ? (
                        <OrganizationForm
                            initialData={{
                                name: item.name,
                                position: item.position,
                                sort_order: item.sort_order,
                                is_active: item.is_active,
                            }}
                            initialPhotoUrl={item.photo_url ?? null}
                            onSubmit={(data, selectedPhoto) => {
                                setFormData(data);
                                setPhoto(selectedPhoto);
                                setShowConfirmModal(true);
                            }}
                            loading={isSubmitting}
                        />
                    ) : (
                        <p className="py-12 text-center text-muted">Data tidak ditemukan.</p>
                    )}
                </div>
            </Layout>

            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Konfirmasi Perubahan"
                type="warning"
                confirmText="Ya, Simpan"
                cancelText="Batal"
                onConfirm={confirmSubmit}
                isLoading={isSubmitting}
            >
                <div className="py-2">
                    <p className="text-body">
                        Simpan perubahan data{' '}
                        <span className="font-semibold">{formData?.name}</span>?
                    </p>
                </div>
            </Modal>
        </>
    );
}
