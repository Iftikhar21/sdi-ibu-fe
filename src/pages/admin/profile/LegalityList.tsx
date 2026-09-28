import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Edit2, ImageOff, Loader2, PlusCircle, ShieldCheck, Trash2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import PhotoPicker from '../../../components/common/PhotoPicker';
import NumericInput from '../../../components/common/NumericInput';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { legalityService } from '../../../services/schoolProfileServices';
import type { Legality } from '../../../types/schoolProfile';

interface FormState {
    title: string;
    description: string;
    sort_order: number;
    is_active: boolean;
}

const emptyForm: FormState = { title: '', description: '', sort_order: 0, is_active: true };

export default function LegalityList() {
    const toast = useToast();

    const [items, setItems] = useState<Legality[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editing, setEditing] = useState<Legality | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState<Legality | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = async () => {
        try {
            setItems(await legalityService.getAll());
        } catch (error) {
            console.error('Error fetching legalities:', error);
            toast.error('Gagal memuat data legalitas', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyForm, sort_order: items.length + 1 });
        setPhoto(null);
        setPhotoPreview(null);
        setShowFormModal(true);
    };

    const openEdit = (item: Legality) => {
        setEditing(item);
        setForm({
            title: item.title ?? '',
            description: item.description,
            sort_order: item.sort_order,
            is_active: item.is_active,
        });
        setPhoto(null);
        setPhotoPreview(item.image_url ?? null);
        setShowFormModal(true);
    };

    const submitForm = async () => {
        if (!form.description.trim()) {
            toast.warning('Deskripsi wajib diisi');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                sort_order: form.sort_order,
                is_active: form.is_active,
                image: photo,
            };

            if (editing) {
                await legalityService.update(editing.id, payload);
                toast.success('Data legalitas berhasil diperbarui');
            } else {
                await legalityService.create(payload);
                toast.success('Data legalitas berhasil ditambahkan');
            }

            setShowFormModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving legality:', error);
            toast.error(
                editing ? 'Gagal memperbarui data' : 'Gagal menambahkan data',
                getApiErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleting) return;

        setIsDeleting(true);
        try {
            await legalityService.delete(deleting.id);
            toast.success('Data legalitas berhasil dihapus');
            fetchData();
            setShowDeleteModal(false);
            setDeleting(null);
        } catch (error) {
            console.error('Error deleting legality:', error);
            toast.error('Gagal menghapus data', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Legalitas / NPSN | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Legalitas / NPSN">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Legalitas / NPSN
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Dokumen legalitas sekolah seperti NPSN, izin operasional, dan akreditasi
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Data
                    </button>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-line bg-surface py-12 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat data...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-xl border border-line bg-surface px-4 py-12 text-center shadow-sm">
                        <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Belum ada data legalitas
                        </h3>
                        <p className="mx-auto mb-6 max-w-md text-muted">
                            Tambahkan informasi legalitas seperti NPSN agar tampil di halaman profil.
                        </p>
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Data Pertama
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm"
                            >
                                <div className="aspect-[4/3] bg-surface-muted">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.title ?? 'Legalitas'}
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <ImageOff className="h-8 w-8 text-muted" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-2 flex items-start justify-between gap-3">
                                        <h3 className="font-semibold text-body">
                                            {item.title || 'Tanpa Judul'}
                                        </h3>
                                        <span
                                            className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
                                                item.is_active
                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                    : 'border-line bg-surface-muted text-muted'
                                            }`}
                                        >
                                            {item.is_active ? 'Tampil' : 'Disembunyikan'}
                                        </span>
                                    </div>

                                    <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-line pt-4">
                                        <span className="text-xs text-muted">
                                            Urutan: {item.sort_order}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
                                            >
                                                <Edit2 className="mr-1.5 h-4 w-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeleting(item);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                                            >
                                                <Trash2 className="mr-1.5 h-4 w-4" />
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Layout>

            <Modal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                title={editing ? 'Edit Legalitas' : 'Tambah Legalitas'}
                type="warning"
                confirmText="Simpan"
                cancelText="Batal"
                onConfirm={submitForm}
                isLoading={isSubmitting}
                size="lg"
            >
                <div className="space-y-5 py-2">
                    <PhotoPicker
                        label="Foto"
                        aspect="video"
                        preview={photoPreview}
                        onChange={(file) => {
                            setPhoto(file);
                            setPhotoPreview(URL.createObjectURL(file));
                        }}
                        onClear={() => {
                            setPhoto(null);
                            setPhotoPreview(null);
                        }}
                    />

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            Judul (opsional)
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(event) =>
                                setForm((previous) => ({ ...previous, title: event.target.value }))
                            }
                            placeholder="Contoh: NPSN"
                            className="w-full rounded-lg border border-line px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            Deskripsi <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={form.description}
                            onChange={(event) =>
                                setForm((previous) => ({
                                    ...previous,
                                    description: event.target.value,
                                }))
                            }
                            placeholder="Contoh: NPSN: 20104041"
                            className="w-full resize-none rounded-lg border border-line px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Urutan Tampil
                            </label>
                            <NumericInput
                                value={form.sort_order}
                                onChange={(value) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        sort_order: Number(value) || 0,
                                    }))
                                }
                                maxLength={4}
                                placeholder="0"
                                ariaLabel="Urutan tampil"
                                className="w-full rounded-lg border border-line px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <label className="flex cursor-pointer items-center gap-3 self-end pb-2">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(event) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        is_active: event.target.checked,
                                    }))
                                }
                                className="h-4 w-4 rounded border-line text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-body">Tampilkan di website</span>
                        </label>
                    </div>
                </div>
            </Modal>

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
                        Hapus data legalitas &ldquo;{deleting?.title || deleting?.description}&rdquo;?
                    </p>
                </div>
            </Modal>
        </>
    );
}
