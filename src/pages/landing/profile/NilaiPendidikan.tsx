import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, Sparkles } from 'lucide-react';
import MainLayout from '../../../components/layout/landing/MainLayout';
import ProfilePageHero from '../../../components/landing/ProfilePageHero';
import { educationValueService } from '../../../services/schoolProfileServices';
import type { EducationValue } from '../../../types/schoolProfile';

export default function NilaiPendidikanPage() {
    const [values, setValues] = useState<EducationValue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setValues(await educationValueService.getPublic());
            } catch (error) {
                console.error('Error fetching education values:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <MainLayout>
            <Helmet>
                <title>Nilai Pendidikan | SDI Ikhlas Bakti Umat</title>
                <meta
                    name="description"
                    content="Nilai-nilai pendidikan yang ditanamkan di Sekolah IBU: iman, adab, ilmu, dan amal."
                />
            </Helmet>

            <ProfilePageHero
                badge="Profil Sekolah"
                title="Nilai Pendidikan"
                description="Nilai-nilai yang kami tanamkan dalam keseharian belajar di Sekolah IBU."
                icon={Sparkles}
            />

            <div className="container mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : values.length === 0 ? (
                    <p className="py-20 text-center text-muted">
                        Nilai pendidikan belum ditambahkan.
                    </p>
                ) : (
                    <div className="space-y-14">
                        {values.map((value) => (
                            <div key={value.id}>
                                <div className="mx-auto mb-10 max-w-3xl text-center">
                                    <h2 className="mb-3 text-3xl font-bold text-body md:text-4xl">
                                        {value.title}
                                    </h2>
                                    {value.description && (
                                        <p className="leading-relaxed text-muted">
                                            {value.description}
                                        </p>
                                    )}
                                </div>

                                {value.items.length > 0 && (
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {value.items.map((item) => (
                                            <div
                                                key={item.id ?? item.title}
                                                className="rounded-2xl border border-line bg-surface p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1"
                                            >
                                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                                                    <Sparkles className="h-6 w-6 text-brand" />
                                                </div>
                                                <h3 className="mb-2 text-xl font-bold text-brand">
                                                    {item.title}
                                                </h3>
                                                <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                                                    {item.description || 'Belum ada deskripsi.'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
