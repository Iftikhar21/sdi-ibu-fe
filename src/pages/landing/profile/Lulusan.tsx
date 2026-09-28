import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { GraduationCap, Loader2 } from 'lucide-react';
import MainLayout from '../../../components/layout/landing/MainLayout';
import ProfilePageHero from '../../../components/landing/ProfilePageHero';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { graduationService } from '../../../services/graduationServices';
import type { PublicGraduatesResult } from '../../../types/graduation';

export default function LulusanPage() {
    const [data, setData] = useState<PublicGraduatesResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedYearId, setSelectedYearId] = useState<number | null>(null);

    const fetchData = async (academicYearId?: number) => {
        try {
            setLoading(true);

            const result = await graduationService.getPublic(academicYearId);

            setData(result);
            setSelectedYearId(result.academic_year?.id ?? null);
        } catch (error) {
            console.error('Error fetching graduates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const graduates = data?.graduates ?? [];

    return (
        <MainLayout>
            <Helmet>
                <title>Lulusan | SDI Ikhlas Bakti Umat</title>
                <meta
                    name="description"
                    content="Daftar lulusan Sekolah IBU (Ikhlas Bakti Umat) per tahun kelulusan."
                />
            </Helmet>

            <ProfilePageHero
                badge="Profil Sekolah"
                title="Lulusan"
                description="Ananda yang telah menyelesaikan pendidikan di Sekolah IBU, dikelompokkan per tahun kelulusan."
                icon={GraduationCap}
            />

            <div className="container mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (data?.years.length ?? 0) === 0 ? (
                    <p className="py-20 text-center text-muted">Data lulusan belum tersedia.</p>
                ) : (
                    <>
                        <div className="mb-10 flex flex-col items-center gap-6">
                            <div className="w-full max-w-xs">
                                <label className="mb-2 block text-center text-sm font-medium text-body">
                                    Tahun Kelulusan
                                </label>
                                <SearchableSelect
                                    options={(data?.years ?? []).map((year) => ({
                                        value: year.id,
                                        label: year.name,
                                        description: `${year.total ?? 0} lulusan`,
                                    }))}
                                    value={selectedYearId}
                                    onChange={(value) => fetchData(Number(value))}
                                    searchPlaceholder="Cari tahun kelulusan..."
                                    ariaLabel="Pilih tahun kelulusan"
                                />
                            </div>

                            <div className="rounded-2xl border border-line bg-surface px-8 py-5 text-center shadow-sm">
                                <p className="text-3xl font-bold text-brand">{data?.total ?? 0}</p>
                                <p className="mt-1 text-sm text-muted">
                                    Total Lulusan {data?.academic_year?.name ?? ''}
                                </p>
                            </div>
                        </div>

                        {graduates.length === 0 ? (
                            <p className="py-12 text-center text-muted">
                                Belum ada lulusan pada tahun ini.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {graduates.map((graduate) => (
                                    <div
                                        key={graduate.id ?? graduate.name}
                                        className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1"
                                    >
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand/20">
                                            <GraduationCap className="h-6 w-6 text-brand" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-body">
                                                {graduate.name}
                                            </p>
                                            <p className="text-sm text-muted">
                                                {graduate.last_class
                                                    ? `Kelas ${graduate.last_class}`
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}
