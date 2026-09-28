import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { GraduationCap, Loader2, Quote, User } from 'lucide-react';
import MainLayout from '../../../components/layout/landing/MainLayout';
import ProfilePageHero from '../../../components/landing/ProfilePageHero';
import { principalService } from '../../../services/schoolProfileServices';
import type { Principal } from '../../../types/schoolProfile';

export default function KepalaSekolahPage() {
    const [principals, setPrincipals] = useState<Principal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setPrincipals(await principalService.getPublic());
            } catch (error) {
                console.error('Error fetching principals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Data aktif ditampilkan sebagai kepala sekolah saat ini
    const current = principals.find((item) => item.is_active) ?? principals[0] ?? null;
    const others = principals.filter((item) => item.id !== current?.id);

    const formatPeriod = (item: Principal) => {
        if (!item.started_at && !item.ended_at) return null;

        return `${item.started_at || '-'} – ${item.ended_at || 'sekarang'}`;
    };

    return (
        <MainLayout>
            <Helmet>
                <title>Kepala Sekolah | SDI Ikhlas Bakti Umat</title>
                <meta
                    name="description"
                    content="Profil kepala sekolah Sekolah IBU (Ikhlas Bakti Umat) beserta sambutan dan riwayat pendidikannya."
                />
            </Helmet>

            <ProfilePageHero
                badge="Profil Sekolah"
                title="Kepala Sekolah"
                description="Mengenal sosok yang memimpin dan membimbing Sekolah IBU."
                icon={User}
            />

            <div className="container mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : !current ? (
                    <p className="py-20 text-center text-muted">
                        Data kepala sekolah belum ditambahkan.
                    </p>
                ) : (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                            {/* Foto & identitas */}
                            <div className="lg:col-span-1">
                                <div className="overflow-hidden rounded-2xl bg-surface shadow-lg">
                                    <div className="aspect-[3/4] bg-surface-muted">
                                        {current.photo_url ? (
                                            <img
                                                src={current.photo_url}
                                                alt={current.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <User className="h-16 w-16 text-muted" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 text-center">
                                        <h2 className="text-xl font-bold text-body">
                                            {current.name}
                                        </h2>
                                        <p className="mt-1 font-medium text-brand">
                                            {current.position}
                                        </p>

                                        <div className="mt-4 space-y-1 text-sm text-muted">
                                            {current.employee_number && (
                                                <p>NIP/NUPTK: {current.employee_number}</p>
                                            )}
                                            {formatPeriod(current) && (
                                                <p>Menjabat: {formatPeriod(current)}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sambutan & riwayat */}
                            <div className="space-y-8 lg:col-span-2">
                                {current.greeting && (
                                    <div className="rounded-2xl border border-line bg-surface p-8 shadow-lg">
                                        <Quote className="mb-4 h-8 w-8 text-brand/30" />
                                        <p className="whitespace-pre-line leading-relaxed text-muted">
                                            {current.greeting}
                                        </p>
                                        <p className="mt-6 font-semibold text-body">
                                            — {current.name}
                                        </p>
                                    </div>
                                )}

                                {current.education_history.length > 0 && (
                                    <div className="rounded-2xl border border-line bg-surface p-8 shadow-lg">
                                        <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-body">
                                            <GraduationCap className="h-5 w-5 text-brand" />
                                            Riwayat Pendidikan
                                        </h3>
                                        <ul className="space-y-3">
                                            {current.education_history.map((history, index) => (
                                                <li key={history} className="flex items-start gap-3">
                                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-muted">{history}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Kepala sekolah periode sebelumnya */}
                        {others.length > 0 && (
                            <div>
                                <h3 className="mb-6 text-xl font-bold text-body">
                                    Kepala Sekolah Sebelumnya
                                </h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {others.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-line bg-surface p-5 text-center shadow-sm"
                                        >
                                            <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-surface-muted">
                                                {item.photo_url ? (
                                                    <img
                                                        src={item.photo_url}
                                                        alt={item.name}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <User className="h-8 w-8 text-muted" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-semibold text-body">{item.name}</p>
                                            <p className="mt-1 text-sm text-muted">
                                                {formatPeriod(item) ?? item.position}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
