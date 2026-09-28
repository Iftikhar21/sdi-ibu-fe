import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ImageOff, Loader2, ShieldCheck } from 'lucide-react';
import MainLayout from '../../../components/layout/landing/MainLayout';
import ProfilePageHero from '../../../components/landing/ProfilePageHero';
import { legalityService } from '../../../services/schoolProfileServices';
import type { Legality } from '../../../types/schoolProfile';

export default function LegalitasPage() {
    const [items, setItems] = useState<Legality[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setItems(await legalityService.getPublic());
            } catch (error) {
                console.error('Error fetching legalities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <MainLayout>
            <Helmet>
                <title>Legalitas & NPSN | SDI Ikhlas Bakti Umat</title>
                <meta
                    name="description"
                    content="Informasi legalitas dan NPSN Sekolah IBU (Ikhlas Bakti Umat)."
                />
            </Helmet>

            <ProfilePageHero
                badge="Profil Sekolah"
                title="Legalitas & NPSN"
                description="Dokumen dan informasi resmi yang menaungi penyelenggaraan pendidikan di Sekolah IBU."
                icon={ShieldCheck}
            />

            <div className="container mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : items.length === 0 ? (
                    <p className="py-20 text-center text-muted">
                        Informasi legalitas belum ditambahkan.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg"
                            >
                                <div className="aspect-[4/3] bg-surface-muted">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.title ?? 'Legalitas'}
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <ImageOff className="h-10 w-10 text-muted" />
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    {item.title && (
                                        <h2 className="mb-2 text-lg font-bold text-body">
                                            {item.title}
                                        </h2>
                                    )}
                                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
