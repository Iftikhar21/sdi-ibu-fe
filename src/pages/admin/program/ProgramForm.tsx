import { useState, useRef, useEffect } from 'react';
import { Save, Loader2, Upload, Eye, EyeOff, X, Image as ImageIcon } from 'lucide-react';

interface Props {
    title: string;
    initialData?: {
        title: string;
        description: string;
        thumbnail?: string; // ← INI URL
        status: 'draft' | 'published';
    };
    onSubmit: (data: {
        title?: string;
        description?: string;
        thumbnail?: File | null;
        status?: 'draft' | 'published';
    }) => void;
    loading?: boolean;
}

export default function ProgramForm({
    title,
    initialData = {
        title: '',
        description: '',
        status: 'draft'
    },
    onSubmit,
    loading,
}: Props) {
    const [titleInput, setTitleInput] = useState(initialData.title);
    const [description, setDescription] = useState(initialData.description);
    const [status, setStatus] = useState<'draft' | 'published'>(initialData.status);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        initialData.thumbnail ?? null
    );
    useEffect(() => {
        if (initialData.thumbnail) {
            setThumbnailPreview(initialData.thumbnail);
        }
    }, [initialData.thumbnail]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_SIZE = 2 * 1024 * 1024; // 2MB

        if (file.size > MAX_SIZE) {
            alert('Ukuran thumbnail maksimal 2MB');
            e.target.value = ''; // reset input file
            return;
        }

        setThumbnail(file);
        const previewUrl = URL.createObjectURL(file);
        setThumbnailPreview(previewUrl);
    };

    const removeThumbnail = () => {
        setThumbnail(null);
        setThumbnailPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!titleInput.trim()) {
            alert('Judul program wajib diisi');
            return;
        }

        if (!description.trim()) {
            alert('Deskripsi program wajib diisi');
            return;
        }

        const formData: any = {};

        // Hanya kirim field yang berubah atau berbeda dari initial
        if (titleInput !== initialData.title) {
            formData.title = titleInput;
        }
        if (description !== initialData.description) {
            formData.description = description;
        }
        if (status !== initialData.status) {
            formData.status = status;
        }
        if (thumbnail) {
            formData.thumbnail = thumbnail;
        } else if (thumbnail === null && initialData.thumbnail) {
            // Jika user menghapus thumbnail yang sudah ada
            formData.thumbnail = null;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Program <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-400"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="Masukkan judul program"
                    required
                />
            </div>

            {/* Thumbnail */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail
                </label>
                <div className="space-y-4">
                    {thumbnailPreview ? (
                        <div className="relative">
                            <div className="aspect-video max-w-md rounded-lg overflow-hidden bg-gray-100">
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={removeThumbnail}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="aspect-video max-w-md rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                            <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                            <p className="text-sm text-gray-500 mb-2">Upload thumbnail program</p>
                            <p className="text-xs text-gray-400 mb-3">Ukuran maksimal 2MB</p>
                            <label className="cursor-pointer">
                                <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Pilih File
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Program <span className="text-red-500">*</span>
                </label>
                <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-sm hover:border-gray-400"
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Masukkan deskripsi lengkap program"
                    required
                />
                <div className="mt-2 text-xs text-gray-500">
                    Karakter: {description.length}
                </div>
            </div>

            {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                </label>
                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="status"
                            value="draft"
                            checked={status === 'draft'}
                            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 flex items-center text-gray-700">
                            <EyeOff className="w-4 h-4 mr-1" />
                            Draft
                        </span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="status"
                            value="published"
                            checked={status === 'published'}
                            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 flex items-center text-gray-700">
                            <Eye className="w-4 h-4 mr-1" />
                            Published
                        </span>
                    </label>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading || !titleInput.trim() || !description.trim()}
                    className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Simpan
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}