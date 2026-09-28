import { useState, useRef, useEffect } from 'react';
import { Save, Loader2, Upload, Image as ImageIcon, X, Plus, Trash2, FileText, Type } from 'lucide-react';

interface Props {
    title: string;
    isEdit?: boolean;
    initialData?: {
        title: string;
        content: string;
        thumbnail?: string;
        thumbnail_url?: string; // ✅ TAMBAH INI
        photos?: Array<{ id: number; url: string }>;
    };
    onSubmit: (data: {
        title?: string;
        content?: string;
        thumbnail?: File | null;
        photos?: File[];
        deleted_photos?: number[];
    }) => void;
    loading?: boolean;
}

export default function NewsForm({
    title,
    isEdit = false,
    initialData = {
        title: '',
        content: '',
        photos: []
    },
    onSubmit,
    loading,
}: Props) {
    const [titleInput, setTitleInput] = useState(initialData.title);
    const [content, setContent] = useState(initialData.content);

    // Thumbnail
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [removeThumbnailFlag, setRemoveThumbnailFlag] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        initialData.thumbnail_url ?? null
    );

    // Photos
    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [existingPhotos, setExistingPhotos] = useState(initialData.photos ?? []);
    const [photosToDelete, setPhotosToDelete] = useState<number[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

    const thumbnailRef = useRef<HTMLInputElement>(null);
    const photosRef = useRef<HTMLInputElement>(null);

    /* ---------------- THUMBNAIL ---------------- */

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));

        setRemoveThumbnailFlag(false); // 🔥 INI KUNCI
    };

    const removeThumbnail = () => {
        setThumbnail(null);
        setThumbnailPreview(null);
        setRemoveThumbnailFlag(true); // 🔥 PENTING
        if (thumbnailRef.current) thumbnailRef.current.value = '';
    };


    /* ---------------- PHOTOS ---------------- */

    const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setNewPhotos(prev => [...prev, ...files]);
        setPhotoPreviews(prev => [
            ...prev,
            ...files.map(f => URL.createObjectURL(f)),
        ]);
    };

    const removeNewPhoto = (index: number) => {
        const newPhotosCopy = [...newPhotos];
        newPhotosCopy.splice(index, 1);
        setNewPhotos(newPhotosCopy);

        const previewsCopy = [...photoPreviews];
        URL.revokeObjectURL(previewsCopy[index]); // Clean up memory
        previewsCopy.splice(index, 1);
        setPhotoPreviews(previewsCopy);
    };

    const removeExistingPhoto = (id: number) => {
        setPhotosToDelete(prev => [...prev, id]);
        setExistingPhotos(prev => prev.filter(p => p.id !== id));
    };

    /* ---------------- SUBMIT ---------------- */

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = {};

        if (titleInput !== initialData.title) payload.title = titleInput;
        if (content !== initialData.content) payload.content = content;

        // 🔥 PRIORITAS REMOVE
        if (removeThumbnailFlag) {
            payload.remove_thumbnail = true;
        }
        // 🔥 BARU UPLOAD FILE
        else if (thumbnail instanceof File) {
            payload.thumbnail = thumbnail;
        }

        if (newPhotos.length) payload.photos = newPhotos;
        if (photosToDelete.length) payload.deleted_photos = photosToDelete;

        onSubmit(payload);
    };

    /* ---------------- CLEANUP ---------------- */

    useEffect(() => {
        if (!isEdit || !initialData) return;

        setTitleInput(initialData.title ?? '');
        setContent(initialData.content ?? '');
        setThumbnailPreview(initialData.thumbnail ?? null);

        setExistingPhotos(initialData.photos ?? []);

        setNewPhotos([]);
        setPhotoPreviews([]);
        setPhotosToDelete([]);
        setRemoveThumbnailFlag(false);
        setThumbnail(null);
    }, [isEdit, initialData]);



    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form Header */}
            <div className="border-b border-line pb-4">
                <h2 className="text-2xl font-bold text-body">{title}</h2>
                <p className="text-muted mt-2">
                    Isi informasi berita dengan lengkap dan akurat
                </p>
            </div>

            {/* Title Input */}
            <div>
                <label className="block text-sm font-medium text-body mb-2">
                    <div className="flex items-center">
                        <Type className="w-4 h-4 mr-2 text-blue-600" />
                        Judul Berita <span className="text-red-500 ml-1">*</span>
                    </div>
                </label>
                <input
                    type="text"
                    value={titleInput}
                    onChange={e => setTitleInput(e.target.value)}
                    className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-400"
                    placeholder="Masukkan judul berita"
                    required
                />
                <div className="mt-1 text-xs text-muted">
                    Karakter: {titleInput.length}
                </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
                <label className="block text-sm font-medium text-body mb-2">
                    <div className="flex items-center">
                        <ImageIcon className="w-4 h-4 mr-2 text-blue-600" />
                        Thumbnail Berita
                    </div>
                </label>

                {thumbnailPreview ? (
                    <div className="relative max-w-md">
                        <div className="aspect-video rounded-lg overflow-hidden bg-surface-muted border border-line">
                            <img
                                src={thumbnailPreview}
                                alt="Thumbnail preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={removeThumbnail}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <label className="cursor-pointer">
                        <div className="aspect-video max-w-md rounded-lg border-2 border-dashed border-line flex flex-col items-center justify-center bg-surface-muted hover:bg-surface-muted transition-colors hover:border-blue-400">
                            <ImageIcon className="w-12 h-12 text-muted mb-3" />
                            <p className="text-sm font-medium text-muted mb-1">
                                Upload Thumbnail
                            </p>
                            <p className="text-xs text-muted mb-3">
                                Ukuran maksimal 2MB
                            </p>
                            <div className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                                <Upload className="w-4 h-4 mr-2" />
                                Pilih File
                            </div>
                            <input
                                ref={thumbnailRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleThumbnailChange}
                            />
                        </div>
                    </label>
                )}
            </div>

            {/* Photos Section */}
            <div>
                <label className="block text-sm font-medium text-body mb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <ImageIcon className="w-4 h-4 mr-2 text-green-600" />
                            Foto Lainnya (Opsional)
                        </div>
                        <span className="text-xs text-muted">
                            {existingPhotos.length + newPhotos.length} foto
                        </span>
                    </div>
                </label>

                {/* Existing Photos */}
                {existingPhotos.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-body mb-3">Foto yang Sudah Ada</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {existingPhotos.map(photo => (
                                <div key={photo.id} className="relative group">
                                    <div className="aspect-square rounded-lg overflow-hidden bg-surface-muted border border-line">
                                        <img
                                            src={photo.url}
                                            alt={`Existing photo ${photo.id}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeExistingPhoto(photo.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full 
               hover:bg-red-600 transition-colors shadow-sm"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                        <p className="text-xs text-white truncate">
                                            Foto {photo.id}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Photos Preview */}
                {photoPreviews.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-body mb-3">Foto Baru</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {photoPreviews.map((src, i) => (
                                <div key={i} className="relative">
                                    <div className="aspect-square rounded-lg overflow-hidden bg-surface-muted border border-line">
                                        <img
                                            src={src}
                                            alt={`New photo preview ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeNewPhoto(i)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                        <p className="text-xs text-white truncate">
                                            Baru {i + 1}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add More Photos Button */}
                <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-line rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                        <div className="flex flex-col items-center">
                            <div className="p-3 bg-blue-100 rounded-full mb-3">
                                <Plus className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-sm font-medium text-body mb-1">
                                Tambah Foto Lainnya
                            </p>
                            <p className="text-xs text-muted mb-3">
                                Upload beberapa foto sekaligus
                            </p>
                            <div className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors inline-flex items-center">
                                <Upload className="w-4 h-4 mr-2" />
                                Tambah Foto
                            </div>
                            <input
                                ref={photosRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotosChange}
                            />
                        </div>
                    </div>
                </label>
            </div>

            {/* Content Input */}
            <div>
                <label className="block text-sm font-medium text-body mb-2">
                    <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        Konten Berita <span className="text-red-500 ml-1">*</span>
                    </div>
                </label>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-sm hover:border-gray-400"
                    placeholder="Tulis konten berita lengkap di sini..."
                    required
                />
                <div className="flex justify-between items-center mt-1">
                    <div className="text-xs text-muted">
                        Karakter: {content.length}
                    </div>
                    <div className="text-xs text-muted">
                        Paragraf: {content.split('\n').filter(p => p.trim()).length}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-line">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-3 text-sm font-medium text-body bg-surface border border-line rounded-lg hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 shadow-sm"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading || !titleInput.trim() || !content.trim()}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Simpan Berita
                        </>
                    )}
                </button>
            </div>

            {/* Info Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start">
                    <ImageIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-1">
                            Tips Upload Foto
                        </h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Ukuran maksimal setiap foto: 2MB</li>
                            <li>• Format yang didukung: JPG, PNG, WebP</li>
                            <li>• Thumbnail akan ditampilkan di daftar berita</li>
                            <li>• Foto lainnya akan tampil di halaman detail berita</li>
                        </ul>
                    </div>
                </div>
            </div>
        </form>
    );
}