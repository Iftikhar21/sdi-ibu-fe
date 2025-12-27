import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';

interface Props {
    title: string;
    initialValue?: string;
    onSubmit: (content: string) => void;
    loading?: boolean;
}

export default function SejarahForm({
    title,
    initialValue = '',
    onSubmit,
    loading,
}: Props) {
    const [content, setContent] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            alert('Konten tidak boleh kosong');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(content);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konten Sejarah
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                    <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-sm hover:border-gray-400"
                        rows={12}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Masukkan konten sejarah di sini..."
                        required
                    />
                    <div className="mt-2 text-xs text-gray-500">
                        Karakter: {content.length}
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading || isSubmitting || !content.trim()}
                    className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {loading || isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Simpan Perubahan
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}