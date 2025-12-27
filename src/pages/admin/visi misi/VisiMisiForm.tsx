import { useState } from 'react';
import { Save, Loader2, Plus, Trash2, Eye, Target } from 'lucide-react';

interface Props {
    title: string;
    initialData?: {
        vision: string;
        missions: string[];
    };
    onSubmit: (data: { vision: string; missions: string[] }) => void;
    loading?: boolean;
}

export default function VisiMisiForm({
    title,
    initialData = { vision: '', missions: [''] },
    onSubmit,
    loading,
}: Props) {
    const [vision, setVision] = useState(initialData.vision);
    const [missions, setMissions] = useState<string[]>(
        initialData.missions.length > 0 ? initialData.missions : ['']
    );

    const handleMissionChange = (index: number, value: string) => {
        const newMissions = [...missions];
        newMissions[index] = value;
        setMissions(newMissions);
    };

    const addMission = () => {
        setMissions([...missions, '']);
    };

    const removeMission = (index: number) => {
        if (missions.length > 1) {
            const newMissions = missions.filter((_, i) => i !== index);
            setMissions(newMissions);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Filter out empty missions
        const validMissions = missions.filter(mission => mission.trim() !== '');

        if (!vision.trim() && validMissions.length === 0) {
            alert('Harap isi visi atau setidaknya satu misi');
            return;
        }

        onSubmit({ vision, missions: validMissions });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Visi Section */}
            <div>
                <div className="flex items-center mb-3">
                    <Eye className="w-5 h-5 text-blue-600 mr-2" />
                    <label className="block text-lg font-semibold text-gray-800">
                        Visi
                    </label>
                </div>
                <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-sm hover:border-gray-400"
                    rows={4}
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    placeholder="Masukkan visi organisasi di sini..."
                />
                <div className="mt-2 text-xs text-gray-500">
                    Karakter: {vision.length}
                </div>
            </div>

            {/* Misi Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <Target className="w-5 h-5 text-green-600 mr-2" />
                        <label className="block text-lg font-semibold text-gray-800">
                            Misi
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={addMission}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah Misi
                    </button>
                </div>

                <div className="space-y-3">
                    {missions.map((mission, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 text-sm font-semibold rounded-full mt-2">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none shadow-sm hover:border-gray-400"
                                    rows={2}
                                    value={mission}
                                    onChange={(e) => handleMissionChange(index, e.target.value)}
                                    placeholder={`Misi ${index + 1}`}
                                />
                            </div>
                            {missions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeMission(index)}
                                    className="mt-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-2 text-xs text-gray-500">
                    Total misi: {missions.filter(m => m.trim() !== '').length}
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
                    disabled={loading || (!vision.trim() && missions.every(m => !m.trim()))}
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