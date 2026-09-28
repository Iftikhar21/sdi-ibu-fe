import { useState } from 'react';
import { Save, Loader2, HelpCircle, MessageSquareText, ListOrdered } from 'lucide-react';
import { useToast } from '../../../context/toast';
import NumericInput from '../../../components/common/NumericInput';

interface Props {
    initialData?: {
        question: string;
        answer: string;
        sort_order: number;
        is_active: boolean;
    };
    onSubmit: (data: {
        question: string;
        answer: string;
        sort_order: number;
        is_active: boolean;
    }) => void;
    loading?: boolean;
}

const defaultData = {
    question: '',
    answer: '',
    sort_order: 0,
    is_active: true,
};

export default function FaqForm({ initialData = defaultData, onSubmit, loading }: Props) {
    const toast = useToast();
    const [question, setQuestion] = useState(initialData.question);
    const [answer, setAnswer] = useState(initialData.answer);
    const [sortOrder, setSortOrder] = useState<number>(initialData.sort_order ?? 0);
    const [isActive, setIsActive] = useState(initialData.is_active ?? true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!question.trim()) {
            toast.warning('Pertanyaan wajib diisi');
            return;
        }

        if (!answer.trim()) {
            toast.warning('Jawaban wajib diisi');
            return;
        }

        onSubmit({
            question: question.trim(),
            answer: answer.trim(),
            sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
            is_active: isActive,
        });
    };

    const isValid = question.trim() !== '' && answer.trim() !== '';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pertanyaan */}
            <div>
                <div className="flex items-center mb-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <label className="block text-lg font-semibold text-body">
                        Pertanyaan
                    </label>
                </div>
                <textarea
                    className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-sm hover:border-gray-400"
                    rows={3}
                    maxLength={255}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Contoh: Bagaimana cara mendaftar di Sekolah IBU?"
                />
                <div className="mt-2 text-xs text-muted">
                    Karakter: {question.length} / 255
                </div>
            </div>

            {/* Jawaban */}
            <div>
                <div className="flex items-center mb-3">
                    <MessageSquareText className="w-5 h-5 text-green-600 mr-2" />
                    <label className="block text-lg font-semibold text-body">
                        Jawaban
                    </label>
                </div>
                <textarea
                    className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none shadow-sm hover:border-gray-400"
                    rows={6}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Tuliskan jawaban lengkap untuk pertanyaan tersebut..."
                />
                <div className="mt-2 text-xs text-muted">
                    Karakter: {answer.length}
                </div>
            </div>

            {/* Urutan & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="flex items-center mb-3">
                        <ListOrdered className="w-5 h-5 text-amber-600 mr-2" />
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
                        className="w-full px-4 py-2.5 border border-line rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 shadow-sm hover:border-gray-400"
                    />
                    <p className="mt-2 text-xs text-muted">
                        Angka lebih kecil akan ditampilkan lebih dahulu di beranda.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-body mb-3 mt-0.5">
                        Status Tampil
                    </label>
                    <button
                        type="button"
                        onClick={() => setIsActive((prev) => !prev)}
                        className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors duration-200 ${isActive
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-surface-muted border-line text-muted'
                            }`}
                    >
                        <span
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${isActive ? 'bg-green-500' : 'bg-line'
                                }`}
                        >
                            <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-surface transition-transform duration-200 ${isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'
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
            <div className="flex justify-end space-x-3 pt-6 border-t border-line">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-5 py-2.5 text-sm font-medium text-body bg-surface border border-line rounded-lg hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading || !isValid}
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
