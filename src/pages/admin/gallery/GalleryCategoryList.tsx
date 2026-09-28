import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    ArrowDown,
    ArrowUp,
    CheckCircle2,
    Edit2,
    Loader2,
    PlusCircle,
    Save,
    Tags,
    Trash2,
    Undo2,
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import TablePagination from '../../../components/common/TablePagination';
import { useTablePagination } from '../../../components/common/useTablePagination';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { galleryCategoryService } from '../../../services/galleryCategoryServices';
import NumericInput from '../../../components/common/NumericInput';
import type { GalleryCategory } from '../../../types/gallery';

interface FormState {
    name: string;
    sort_order: number;
    is_active: boolean;
}

const emptyForm: FormState = { name: '', sort_order: 0, is_active: true };

export default function GalleryCategoryList() {
    const toast = useToast();

    const [categories, setCategories] = useState<GalleryCategory[]>([]);
    const [savedOrderIds, setSavedOrderIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editing, setEditing] = useState<GalleryCategory | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState<GalleryCategory | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { pageItems, pagination } = useTablePagination(categories);

    const fetchCategories = async () => {
        try {
            const data = await galleryCategoryService.getAll();
            setCategories(data);
            setSavedOrderIds(data.map((category) => category.id));
        } catch (error) {
            console.error('Error fetching gallery categories:', error);
            toast.error('Gagal memuat kategori galeri', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreateModal = () => {
        setEditing(null);
        setForm({
            ...emptyForm,
            sort_order: categories.length + 1,
        });
        setShowFormModal(true);
    };

    const orderChanged =
        categories.map((category) => category.id).join(',') !== savedOrderIds.join(',');

    const moveCategory = (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= categories.length) return;

        setCategories((previous) => {
            const next = [...previous];
            [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

            return next;
        });
    };

    const resetOrder = () => {
        setCategories((previous) =>
            [...previous].sort(
                (a, b) => savedOrderIds.indexOf(a.id) - savedOrderIds.indexOf(b.id)
            )
        );
    };

    const saveOrder = async () => {
        setIsSavingOrder(true);
        try {
            const updated = await galleryCategoryService.reorder(
                categories.map((category) => category.id)
            );

            setCategories(updated);
            setSavedOrderIds(updated.map((category) => category.id));
            toast.success('Urutan kategori berhasil disimpan');
        } catch (error) {
            console.error('Error saving category order:', error);
            toast.error('Gagal menyimpan urutan', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsSavingOrder(false);
        }
    };

    const openEditModal = (category: GalleryCategory) => {
        setEditing(category);
        setForm({
            name: category.name,
            sort_order: category.sort_order,
            is_active: category.is_active,
        });
        setShowFormModal(true);
    };

    const submitForm = async () => {
        if (!form.name.trim()) {
            toast.warning('Nama kategori wajib diisi');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editing) {
                await galleryCategoryService.update(editing.id, {
                    name: form.name.trim(),
                    sort_order: form.sort_order,
                    is_active: form.is_active,
                });
                toast.success('Kategori galeri berhasil diperbarui');
            } else {
                await galleryCategoryService.create({
                    name: form.name.trim(),
                    sort_order: form.sort_order,
                    is_active: form.is_active,
                });
                toast.success('Kategori galeri berhasil ditambahkan');
            }

            setShowFormModal(false);
            setEditing(null);
            fetchCategories();
        } catch (error) {
            console.error('Error saving gallery category:', error);
            toast.error(
                editing ? 'Gagal memperbarui kategori' : 'Gagal menambahkan kategori',
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
            await galleryCategoryService.delete(deleting.id);
            toast.success('Kategori galeri berhasil dihapus');
            fetchCategories();
            setShowDeleteModal(false);
            setDeleting(null);
        } catch (error) {
            console.error('Error deleting gallery category:', error);
            toast.error('Gagal menghapus kategori', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Kategori Galeri | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kategori Galeri">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Kategori Galeri
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Daftar kategori yang bisa dipilih saat menambah album galeri
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {orderChanged && (
                            <span className="text-sm font-medium text-amber-600">
                                Urutan belum disimpan
                            </span>
                        )}

                        <button
                            onClick={resetOrder}
                            disabled={!orderChanged || isSavingOrder}
                            className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-body transition-colors duration-200 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Undo2 className="mr-2 h-4 w-4" />
                            Batalkan
                        </button>

                        <button
                            onClick={saveOrder}
                            disabled={!orderChanged || isSavingOrder}
                            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSavingOrder ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {isSavingOrder ? 'Menyimpan...' : 'Simpan Urutan'}
                        </button>

                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Kategori
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                    {loading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-muted">Memuat kategori...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                            <Tags className="mx-auto mb-4 h-12 w-12 text-muted" />
                            <h3 className="mb-2 text-lg font-medium text-body">
                                Belum ada kategori
                            </h3>
                            <p className="mx-auto mb-6 max-w-md text-muted">
                                Tambahkan kategori agar album galeri bisa dikelompokkan.
                            </p>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Kategori Pertama
                            </button>
                        </div>
                    ) : (
                        <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-line">
                                <thead className="bg-surface-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Kategori
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Slug
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Jumlah Album
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line bg-surface">
                                    {pageItems.map((category) => (
                                        <tr key={category.id} className="hover:bg-surface-muted">
                                            <td className="px-6 py-4 text-sm font-medium text-body">
                                                {category.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted">
                                                {category.slug}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted">
                                                {category.galleries_count ?? 0} album
                                            </td>
                                            <td className="px-6 py-4">
                                                {category.is_active ? (
                                                    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-medium text-muted">
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    {/* Pengatur urutan */}
                                                    <div className="mr-1 flex items-center gap-1 rounded-lg border border-line bg-surface-muted p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveCategory(categories.indexOf(category), -1)}
                                                            disabled={categories[0]?.id === category.id || isSavingOrder}
                                                            title="Naikkan urutan"
                                                            aria-label={`Naikkan ${category.name}`}
                                                            className="rounded-md p-1.5 text-muted transition-colors enabled:hover:bg-blue-600 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                                        >
                                                            <ArrowUp className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveCategory(categories.indexOf(category), 1)}
                                                            disabled={
                                                                categories[categories.length - 1]?.id === category.id ||
                                                                isSavingOrder
                                                            }
                                                            title="Turunkan urutan"
                                                            aria-label={`Turunkan ${category.name}`}
                                                            className="rounded-md p-1.5 text-muted transition-colors enabled:hover:bg-blue-600 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                                        >
                                                            <ArrowDown className="h-5 w-5" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => openEditModal(category)}
                                                        className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
                                                    >
                                                        <Edit2 className="mr-1.5 h-4 w-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDeleting(category);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                                    >
                                                        <Trash2 className="mr-1.5 h-4 w-4" />
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <TablePagination {...pagination} />
                        </>
                    )}
                </div>
            </Layout>

            {/* Modal tambah/edit */}
            <Modal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                title={editing ? 'Edit Kategori' : 'Tambah Kategori'}
                type="warning"
                confirmText={editing ? 'Simpan Perubahan' : 'Tambahkan'}
                cancelText="Batal"
                onConfirm={submitForm}
                isLoading={isSubmitting}
            >
                <div className="space-y-4 py-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-body">
                            Nama Kategori <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={100}
                            value={form.name}
                            onChange={(event) =>
                                setForm((previous) => ({ ...previous, name: event.target.value }))
                            }
                            placeholder="Contoh: Kunjungan Industri"
                            className="w-full rounded-lg border border-line px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-muted">
                            Slug dibuat otomatis dari nama kategori.
                        </p>
                    </div>

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

                    <label className="flex cursor-pointer items-center gap-3">
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
                        <span className="text-sm text-body">
                            Tampilkan kategori ini di filter galeri
                        </span>
                    </label>
                </div>
            </Modal>

            {/* Modal hapus */}
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
                        Hapus kategori &ldquo;{deleting?.name}&rdquo;?
                    </p>
                    {(deleting?.galleries_count ?? 0) > 0 && (
                        <p className="mt-2 text-sm text-red-600">
                            Kategori ini masih dipakai oleh {deleting?.galleries_count} album, jadi
                            kemungkinan besar tidak bisa dihapus.
                        </p>
                    )}
                </div>
            </Modal>
        </>
    );
}
