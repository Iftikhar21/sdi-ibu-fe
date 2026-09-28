import { useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useToast } from '../../../context/toast';
import NumericInput from '../../../components/common/NumericInput';

export interface EducationValueFormValues {
    title: string;
    description: string;
    items: { title: string; description: string }[];
    sort_order: number;
    is_active: boolean;
}

interface Props {
    initialData?: EducationValueFormValues;
    onSubmit: (data: EducationValueFormValues) => void;
    loading?: boolean;
}

const defaultValues: EducationValueFormValues = {
    title: '',
    description: '',
    items: [{ title: '', description: '' }],
    sort_order: 0,
    is_active: true,
};

export default function EducationValueForm({
    initialData = defaultValues,
    onSubmit,
    loading = false,
}: Props) {
    const toast = useToast();

    const [form, setForm] = useState<EducationValueFormValues>(initialData);

    const updateItem = (index: number, field: 'title' | 'description', value: string) => {
        setForm((previous) => {
            const items = [...previous.items];
            items[index] = { ...items[index], [field]: value };

            return { ...previous, items };
        });
    };

    const addItem = () => {
        setForm((previous) => ({
            ...previous,
            items: [...previous.items, { title: '', description: '' }],
        }));
    };

    const removeItem = (index: number) => {
        setForm((previous) => ({
            ...previous,
            items:
                previous.items.length > 1
                    ? previous.items.filter((_, itemIndex) => itemIndex !== index)
                    : [{ title: '', description: '' }],
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!form.title.trim()) {
            toast.warning('Judul nilai pendidikan wajib diisi');
            return;
        }

        const items = form.items
            .filter((item) => item.title.trim() !== '')
            .map((item) => ({
                title: item.title.trim(),
                description: item.description.trim(),
            }));

        if (items.length === 0) {
            toast.warning('Tambahkan minimal satu item', 'Misalnya: Iman, Adab, Ilmu, atau Amal.');
            return;
        }

        onSubmit({
            ...form,
            title: form.title.trim(),
            description: form.description.trim(),
            items,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="mb-2 block text-sm font-medium text-body">
                    Judul <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    maxLength={255}
                    value={form.title}
                    onChange={(event) =>
                        setForm((previous) => ({ ...previous, title: event.target.value }))
                    }
                    placeholder="Contoh: Nilai Pendidikan Sekolah IBU"
                    className="w-full rounded-lg border border-line px-4 py-3 shadow-sm transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-body">Deskripsi</label>
                <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                        setForm((previous) => ({ ...previous, description: event.target.value }))
                    }
                    placeholder="Penjelasan singkat mengenai nilai-nilai ini"
                    className="w-full resize-none rounded-lg border border-line px-4 py-3 shadow-sm transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Item nilai */}
            <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <label className="block text-sm font-semibold text-body">
                            Item Nilai <span className="text-red-500">*</span>
                        </label>
                        <p className="mt-1 text-xs text-muted">
                            {form.items.filter((item) => item.title.trim() !== '').length} item terisi •
                            baris tanpa judul otomatis diabaikan
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addItem}
                        className="inline-flex items-center rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Tambah Item
                    </button>
                </div>

                <div className="space-y-3">
                    {form.items.map((item, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-line bg-surface-muted p-4"
                        >
                            <div className="mb-3 flex items-center gap-3">
                                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                                    {index + 1}
                                </span>
                                <input
                                    type="text"
                                    maxLength={150}
                                    value={item.title}
                                    onChange={(event) => updateItem(index, 'title', event.target.value)}
                                    placeholder="Nama item, misal: Iman"
                                    className="flex-1 rounded-lg border border-line px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    title="Hapus item"
                                    aria-label={`Hapus item ${index + 1}`}
                                    className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <textarea
                                rows={3}
                                value={item.description}
                                onChange={(event) => updateItem(index, 'description', event.target.value)}
                                placeholder="Deskripsi item ini"
                                className="w-full resize-none rounded-lg border border-line px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                        className="w-full rounded-lg border border-line px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="mb-3 block text-sm font-medium text-body">
                        Status Tampil
                    </label>
                    <button
                        type="button"
                        onClick={() =>
                            setForm((previous) => ({ ...previous, is_active: !previous.is_active }))
                        }
                        className={`inline-flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                            form.is_active
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-line bg-surface-muted text-muted'
                        }`}
                    >
                        <span
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                form.is_active ? 'bg-green-500' : 'bg-line'
                            }`}
                        >
                            <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-surface transition-transform ${
                                    form.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]'
                                }`}
                            />
                        </span>
                        <span className="text-sm font-medium">
                            {form.is_active ? 'Ditampilkan di website' : 'Disembunyikan'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-line pt-6">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
