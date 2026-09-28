import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, School } from 'lucide-react';
import MainLayout from '../../../components/layout/landing/MainLayout';
import ProfilePageHero from '../../../components/landing/ProfilePageHero';
import { aboutSchoolService } from '../../../services/schoolProfileServices';
import type { AboutSchool as AboutSchoolType } from '../../../types/schoolProfile';

export default function AboutSchoolPage() {
    const [items, setItems] = useState<AboutSchoolType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setItems(await aboutSchoolService.getPublic());
            } catch (error) {
                console.error('Error fetching about school:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <MainLayout>
            <Helmet>
                <title>Tentang Sekolah IBU | SDI Ikhlas Bakti Umat</title>
                <meta
                    name="description"
                    content="Mengenal lebih dekat Sekolah IBU (Ikhlas Bakti Umat): profil, komitmen, dan lingkungan belajar."
                />
            </Helmet>

            <ProfilePageHero
                badge="Profil Sekolah"
                title="Tentang Sekolah IBU"
                description="Mengenal lebih dekat Sekolah IBU (Ikhlas Bakti Umat) dan komitmen kami dalam mendidik generasi beriman serta berakhlak mulia."
                icon={School}
            />

            <div className="container mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : items.length === 0 ? (
                    <p className="py-20 text-center text-muted">
                        Informasi tentang sekolah belum ditambahkan.
                    </p>
                ) : (
                    <div className="space-y-16">
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2"
                            >
                                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                                    <div className="overflow-hidden rounded-2xl shadow-lg">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                loading="lazy"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex aspect-video items-center justify-center bg-surface-muted">
                                                <School className="h-12 w-12 text-muted" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                                    <h2 className="mb-4 text-2xl font-bold text-body md:text-3xl">
                                        {item.title}
                                    </h2>
                                    <p className="whitespace-pre-line leading-relaxed text-muted">
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
