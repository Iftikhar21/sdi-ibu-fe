import { useEffect, useRef, useState } from 'react';
import {
    Save,
    Loader2,
    X,
    Image as ImageIcon,
    ListOrdered,
    Images,
} from 'lucide-react';
import { useToast } from '../../../context/toast';
import { galleryCategoryService } from '../../../services/galleryCategoryServices';
import type { GalleryCategory, GalleryPhoto } from '../../../types/gallery';
import SearchableSelect from '../../../components/common/SearchableSelect';
import NumericInput from '../../../components/common/NumericInput';

export interface GalleryFormSubmit {
    gallery_category_id: number;
    title: string;
    description: string;
    photos: File[];
    deletedPhotoIds: number[];
    sort_order: number;
    is_active: boolean;
}

interface Props {
    initialData?: {
        gallery_category_id: number;
        title: string;
        description: string;
        photos: GalleryPhoto[];
        sort_order: number;
        is_active: boolean;
    };
    isEdit?: boolean;
    onSubmit: (data: GalleryFormSubmit) => void;
    loading?: boolean;
}

const maxPhotoSize = 5 * 1024 * 1024; // 5MB

export default function GalleryForm({ initialData, isEdit = false, onSubmit, loading }: Props) {
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [categories, setCategories] = useState<GalleryCategory[]>([]);
    const [categoryId, setCategoryId] = useState<number>(initialData?.gallery_category_id ?? 0);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [title, setTitle] = useState(initialData?.title ?? '');
    const [description, setDescription] = useState(initialData?.description ?? '');
    const [sortOrder, setSortOrder] = useState<number>(initialData?.sort_order ?? 0);
    const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

    const [existingPhotos, setExistingPhotos] = useState<GalleryPhoto[]>(initialData?.photos ?? []);
    const [deletedPhotoIds, setDeletedPhotoIds] = useState<number[]>([]);
    const [newPhotos, setNewPhotos] = useState<{ file: File; preview: string }[]>([]);

    const totalPhotos = existingPhotos.length + newPhotos.length;

    // Kategori diambil dari master kategori galeri (bisa ditambah admin)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await galleryCategoryService.getAll();

                setCategories(data);

                if (!initialData?.gallery_category_id) {
                    const firstActive = data.find((item) => item.is_active) ?? data[0];

                    if (firstActive) {
                        setCategoryId(firstActive.id);
                    }
                }
            } catch (error) {
                console.error('Error fetching gallery categories:', error);
                toast.error('Gagal memuat kategori galeri', 'Silakan muat ulang halaman.');
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        const accepted: { file: File; preview: string }[] = [];
        let rejectedSize = false;
        let rejectedType = false;

        files.forEach((file) => {
            if (!file.type.startsWith('image/')) {
                rejectedType = true;
                return;
            }

            if (file.size > maxPhotoSize) {
                rejectedSize = true;
                return;
            }

            accepted.push({ file, preview: URL.createObjectURL(file) });
        });

        if (rejectedType) {
            toast.warning('Beberapa file dilewati', 'Hanya berkas gambar yang dapat diunggah.');
        }

        if (rejectedSize) {
            toast.warning('Beberapa foto dilewati', 'Ukuran setiap foto maksimal 5MB.');
        }

        if (accepted.length > 0) {
            setNewPhotos((prev) => [...prev, ...accepted]);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeNewPhoto = (index: number) => {
        setNewPhotos((prev) => {
            URL.revokeObjectURL(prev[index].preview);

            return prev.filter((_, i) => i !== index);
        });
    };

    const removeExistingPhoto = (photo: GalleryPhoto) => {
        setExistingPhotos((prev) => prev.filter((item) => item.id !== photo.id));
        setDeletedPhotoIds((prev) => [...prev, photo.id]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.warning('Judul galeri wajib diisi');
            return;
        }

        if (!categoryId) {
            toast.warning('Kategori galeri wajib dipilih');
            return;
        }

        if (totalPhotos === 0) {
            toast.warning('Minimal satu foto harus dipilih');
            return;
        }

        onSubmit({
            gallery_category_id: categoryId,
            title: title.trim(),
            description: description.trim(),
            photos: newPhotos.map((item) => item.file),
            deletedPhotoIds,
            sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
            is_active: isActive,
        });
    };

    const isSubmitDisabled = loading || !title.trim() || totalPhotos === 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kategori */}
            <div>
                <label className="mb-2 block text-sm font-medium text-body">
                    Kategori <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                    options={categories.map((item) => ({
                        value: item.id,
                        label: item.name,
                        description: item.is_active ? undefined : 'Nonaktif',
                    }))}
                    value={categoryId > 0 ? categoryId : null}
                    onChange={(value) => setCategoryId(Number(value))}
                    placeholder="Pilih kategori"
                    searchPlaceholder="Cari kategori..."
                    emptyMessage="Kategori tidak ditemukan"
                    loading={loadingCategories}
                    ariaLabel="Kategori galeri"
                />
                <p className="mt-2 text-xs text-muted">
                    Kategori ini yang dipakai untuk filter di beranda. Kelola daftarnya di menu
                    Kategori Galeri.
                </p>
            </div>

            {/* Judul */}
            <div>
                <label className="mb-2 block text-sm font-medium text-body">
                    Judul Galeri <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    maxLength={255}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Outing Class Kelas 4 ke Kebun Raya"
                    className="w-full rounded-lg border border-line px-4 py-3 shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 text-xs text-muted">Karakter: {title.length} / 255</div>
            </div>

            {/* Deskripsi */}
            <div>
                <label className="mb-2 block text-sm font-medium text-body">
                    Deskripsi (opsional)
                </label>
                <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Keterangan singkat tentang kegiatan ini"
                    className="w-full resize-none rounded-lg border border-line px-4 py-3 shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Foto */}
            <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center">
                        <Images className="mr-2 h-5 w-5 text-blue-600" />
                        <label className="block text-sm font-semibold text-body">
                            Foto <span className="text-red-500">*</span>
                        </label>
                    </div>
                    <span className="text-xs text-muted">
                        {totalPhotos} foto dipilih • maksimal 5MB per foto
                    </span>
                </div>

                {(existingPhotos.length > 0 || newPhotos.length > 0) && (
                    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {existingPhotos.map((photo) => (
                            <div
                                key={`existing-${photo.id}`}
                                className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-muted"
                            >
                                <img
                                    src={photo.thumb_url ?? photo.image_url ?? ''}
                                    alt="Foto galeri"
                                    className="h-full w-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeExistingPhoto(photo)}
                                    title="Hapus foto ini"
                                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}

                        {newPhotos.map((photo, index) => (
                            <div
                                key={`new-${index}`}
                                className="relative aspect-square overflow-hidden rounded-lg border border-blue-200 bg-surface-muted"
                            >
                                <img
                                    src={photo.preview}
                                    alt="Foto baru"
                                    className="h-full w-full object-cover"
                                />
                                <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">
                                    Baru
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeNewPhoto(index)}
                                    title="Batal pilih foto ini"
                                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-surface-muted px-6 py-8 transition-colors hover:bg-surface-muted">
                    <ImageIcon className="mb-3 h-10 w-10 text-muted" />
                    <span className="mb-1 text-sm font-medium text-muted">
                        Klik untuk memilih foto
                    </span>
                    <span className="text-xs text-muted">
                        Bisa pilih beberapa foto sekaligus (jpg, jpeg, png, webp)
                    </span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFilesChange}
                        className="hidden"
                    />
                </label>

                {isEdit && (
                    <p className="mt-2 text-xs text-muted">
                        Menekan tombol silang pada foto lama akan menghapusnya saat disimpan.
                    </p>
                )}
            </div>

            {/* Urutan & Status */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <div className="mb-3 flex items-center">
                        <ListOrdered className="mr-2 h-5 w-5 text-amber-600" />
                        <label className="block text-sm font-semibold text-body">
                            Urutan Tampil
                        </label>
                    </div>
                    <NumericInput
                        value={sortOrder}
                        onChange={(value) => setSortOrder(Number(value) || 0)}
                        maxLength={4}
                        placeholder="0"
                        ariaLabel="Urutan tampil"
                        className="w-full rounded-lg border border-line px-4 py-2.5 shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="mt-2 text-xs text-muted">
                        Angka lebih kecil ditampilkan lebih dahulu di beranda.
                    </p>
                </div>

                <div>
                    <label className="mb-3 mt-0.5 block text-sm font-semibold text-body">
                        Status Tampil
                    </label>
                    <button
                        type="button"
                        onClick={() => setIsActive((prev) => !prev)}
                        className={`inline-flex items-center gap-3 rounded-lg border px-4 py-2.5 transition-colors duration-200 ${
                            isActive
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-line bg-surface-muted text-muted'
                        }`}
                    >
                        <span
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                                isActive ? 'bg-green-500' : 'bg-line'
                            }`}
                        >
                            <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-surface transition-transform duration-200 ${
                                    isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'
                                }`}
                            />
                        </span>
                        <span className="text-sm font-medium">
                            {isActive ? 'Ditampilkan di beranda' : 'Disembunyikan'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 border-t border-line pt-6">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-medium text-body transition-colors duration-200 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Simpan
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
