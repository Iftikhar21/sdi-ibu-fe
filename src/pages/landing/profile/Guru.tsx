import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { GraduationCap, Loader2, User, Users } from 'lucide-react';
import MainLayout from '../../../components/layout/landing/MainLayout';
import ProfilePageHero from '../../../components/landing/ProfilePageHero';
import { teacherService } from '../../../services/schoolProfileServices';
import type { Teacher } from '../../../types/schoolProfile';

export default function GuruPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setTeachers(await teacherService.getPublic());
            } catch (error) {
                console.error('Error fetching teachers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <MainLayout>
            <Helmet>
                <title>Guru & Tenaga Kependidikan | SDI Ikhlas Bakti Umat</title>
                <meta
                    name="description"
                    content="Daftar guru dan tenaga kependidikan Sekolah IBU (Ikhlas Bakti Umat)."
                />
            </Helmet>

            <ProfilePageHero
                badge="Profil Sekolah"
                title="Guru & Tenaga Kependidikan"
                description="Tim pengajar yang mendampingi ananda dalam belajar dan tumbuh di Sekolah IBU."
                icon={Users}
            />

            <div className="container mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : teachers.length === 0 ? (
                    <p className="py-20 text-center text-muted">
                        Data guru dan tenaga kependidikan belum ditambahkan.
                    </p>
                ) : (
                    <>
                        <p className="mb-10 text-center text-muted">
                            {teachers.length} guru dan tenaga kependidikan
                        </p>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {teachers.map((teacher) => (
                                <div
                                    key={teacher.id}
                                    className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg transition-transform duration-300 hover:-translate-y-1"
                                >
                                    <div className="aspect-[3/4] bg-surface-muted">
                                        {teacher.photo_url ? (
                                            <img
                                                src={teacher.photo_url}
                                                alt={teacher.name}
                                                loading="lazy"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <User className="h-16 w-16 text-muted" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 text-center">
                                        <h2 className="font-semibold text-body">
                                            {teacher.name}
                                        </h2>

                                        {teacher.position && (
                                            <p className="mt-1 text-sm font-medium text-brand">
                                                {teacher.position}
                                            </p>
                                        )}

                                        {teacher.last_education && (
                                            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs text-muted">
                                                <GraduationCap className="h-3.5 w-3.5 text-muted" />
                                                {teacher.last_education}
                                            </p>
                                        )}
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
