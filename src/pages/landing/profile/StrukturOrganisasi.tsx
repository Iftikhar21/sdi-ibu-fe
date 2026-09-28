import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, Network } from 'lucide-react';
import MainLayout from '../../../components/layout/landing/MainLayout';
import ProfilePageHero from '../../../components/landing/ProfilePageHero';
import { organizationStructureService } from '../../../services/schoolProfileServices';
import type { OrganizationStructure } from '../../../types/schoolProfile';

export default function StrukturOrganisasiPage() {
    const [items, setItems] = useState<OrganizationStructure[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setItems(await organizationStructureService.getPublic());
            } catch (error) {
                console.error('Error fetching organization structures:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <MainLayout>
            <Helmet>
                <title>Struktur Organisasi | SDI Ikhlas Bakti Umat</title>
                <meta
                    name="description"
                    content="Struktur organisasi Sekolah IBU (Ikhlas Bakti Umat)."
                />
            </Helmet>

            <ProfilePageHero
                badge="Profil Sekolah"
                title="Struktur Organisasi"
                description="Susunan pengurus dan penanggung jawab yang menjalankan kegiatan sekolah."
                icon={Network}
            />

            <div className="container mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : items.length === 0 ? (
                    <p className="py-20 text-center text-muted">
                        Data struktur organisasi belum ditambahkan.
                    </p>
                ) : (
                    <>
                        <p className="mb-10 text-center text-muted">
                            {items.length} orang dalam struktur organisasi sekolah
                        </p>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg transition-transform duration-300 hover:-translate-y-1"
                                >
                                    <div className="aspect-[3/4] bg-surface-muted">
                                        {item.photo_url ? (
                                            <img
                                                src={item.photo_url}
                                                alt={item.name}
                                                loading="lazy"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Network className="h-14 w-14 text-muted" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 text-center">
                                        <h2 className="font-semibold text-body">{item.name}</h2>
                                        <p className="mt-1 text-sm text-brand">{item.position}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    );
}
