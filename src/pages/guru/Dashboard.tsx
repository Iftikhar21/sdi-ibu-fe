import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    BookOpen,
    CalendarCheck,
    CalendarClock,
    FileText,
    GraduationCap,
    Loader2,
    UserCheck,
} from 'lucide-react';
import Layout from '../../components/layout/panel/MainLayout';
import { useToast } from '../../context/toast';
import { getApiErrorMessage } from '../../utils/apiError';
import { teacherService } from '../../services/schoolProfileServices';

type ProfilGuru = Awaited<ReturnType<typeof teacherService.getMyProfile>>;

export default function GuruDashboard() {
    const toast = useToast();
    const [profil, setProfil] = useState<ProfilGuru | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfil = async () => {
            try {
                setProfil(await teacherService.getMyProfile());
            } catch (error) {
                console.error('Error fetching teacher profile:', error);
                toast.error('Gagal memuat data guru', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };

        fetchProfil();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const menu = [
        {
            to: '/guru/absensi',
            label: 'Absensi',
            description: 'Isi kehadiran kelas yang Anda walikan',
            icon: CalendarCheck,
        },
        {
            to: '/guru/nilai',
            label: 'Input Nilai',
            description: 'Isi nilai mata pelajaran yang Anda ampu',
            icon: BookOpen,
        },
        {
            to: '/guru/jadwal',
            label: 'Jadwal Pelajaran',
            description: 'Lihat jadwal kelas Anda',
            icon: CalendarClock,
        },
        {
            to: '/guru/rapor',
            label: 'Rapor',
            description: 'Buka rapor siswa di kelas yang Anda walikan',
            icon: FileText,
        },
    ];

    return (
        <>
            <Helmet>
                <title>Dashboard Guru | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Dashboard Guru">
                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                        <UserCheck className="h-6 w-6 text-brand" />
                        Selamat datang{profil?.teacher.name ? `, ${profil.teacher.name}` : ''}
                    </h1>
                    <p className="text-sm text-muted sm:text-base">
                        Ringkasan penugasan Anda. Akses menu di bawah sesuai penugasan yang
                        diberikan admin.
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-line bg-surface py-16 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat data...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {menu.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="rounded-xl border border-line bg-surface p-6 shadow-sm transition-colors hover:bg-surface-muted"
                                >
                                    <span className="inline-flex rounded-full bg-brand/20 p-2.5">
                                        <item.icon className="h-5 w-5 text-brand" />
                                    </span>
                                    <p className="mt-3 font-semibold text-body">{item.label}</p>
                                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                                </Link>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                                <div className="flex items-center gap-2 border-b border-line px-6 py-4">
                                    <GraduationCap className="h-5 w-5 text-brand" />
                                    <h2 className="text-base font-semibold text-body">
                                        Wali Kelas
                                    </h2>
                                </div>

                                {(profil?.homerooms.length ?? 0) === 0 ? (
                                    <p className="px-6 py-10 text-center text-sm text-muted">
                                        Anda belum ditugaskan sebagai wali kelas.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-line">
                                        {profil?.homerooms.map((row) => (
                                            <li
                                                key={`${row.academic_year_id}-${row.classroom_id}`}
                                                className="flex items-center justify-between px-6 py-3"
                                            >
                                                <span className="text-sm font-medium text-body">
                                                    {row.classroom}
                                                </span>
                                                <span className="text-sm text-muted">
                                                    {row.academic_year}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                                <div className="flex items-center gap-2 border-b border-line px-6 py-4">
                                    <BookOpen className="h-5 w-5 text-brand" />
                                    <h2 className="text-base font-semibold text-body">
                                        Guru Pengampu
                                    </h2>
                                </div>

                                {(profil?.teachings.length ?? 0) === 0 ? (
                                    <p className="px-6 py-10 text-center text-sm text-muted">
                                        Anda belum ditugaskan mengampu mata pelajaran.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-line">
                                        {profil?.teachings.map((row) => (
                                            <li
                                                key={`${row.academic_year_id}-${row.classroom_id}-${row.subject_id}`}
                                                className="px-6 py-3"
                                            >
                                                <p className="text-sm font-medium text-body">
                                                    {row.subject}{' '}
                                                    <span className="text-muted">
                                                        ({row.subject_code})
                                                    </span>
                                                </p>
                                                <p className="text-xs text-muted">
                                                    Kelas {row.classroom} • {row.academic_year}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        </>
    );
}
