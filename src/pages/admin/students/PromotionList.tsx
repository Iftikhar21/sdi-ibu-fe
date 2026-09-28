import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, Layers, Loader2, TrendingUp, Users } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import Modal from '../../../components/common/Modal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import PaginatedTableSection from '../../../components/common/PaginatedTableSection';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { promotionService, type PromotionData } from '../../../services/promotionServices';

export default function PromotionList() {
    const toast = useToast();

    const [data, setData] = useState<PromotionData | null>(null);
    const [loading, setLoading] = useState(false);
    const [fromYearId, setFromYearId] = useState<number | null>(null);
    const [toYearId, setToYearId] = useState<number | null>(null);
    const [fromClassFilter, setFromClassFilter] = useState<number | 'all'>('all');

    // Kelas tujuan per kelas asal (key: id kelas asal)
    const [groupTargets, setGroupTargets] = useState<Record<number, number | null>>({});
    // Siswa yang tidak ikut diproses (mis. tinggal kelas)
    const [excluded, setExcluded] = useState<number[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Muat daftar tahun ajaran, lalu tentukan default asal & tujuan
    const loadYears = async () => {
        setLoading(true);
        try {
            const result = await promotionService.getCandidates();
            const years = result.academic_years;
            const aktif = years.find((year) => year.is_active) ?? years[0] ?? null;

            // years diurutkan dari yang terbaru, jadi tahun berikutnya ada setelahnya
            const indexAktif = aktif ? years.findIndex((year) => year.id === aktif.id) : -1;
            const berikutnya = indexAktif >= 0 ? years[indexAktif + 1] : undefined;

            setFromYearId(aktif?.id ?? null);
            setToYearId(berikutnya?.id ?? null);
        } catch (error) {
            console.error('Error fetching academic years:', error);
            toast.error('Gagal memuat tahun ajaran', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    const loadCandidates = async (from: number, to: number) => {
        setLoading(true);
        try {
            const result = await promotionService.getCandidates(from, to);

            setData(result);
            setExcluded([]);
            setFromClassFilter('all');

            // Default: setiap kelas asal diarahkan ke kelas usulan
            const targets: Record<number, number | null> = {};

            result.rows.forEach((row) => {
                if (!(row.from_classroom_id in targets)) {
                    targets[row.from_classroom_id] = row.suggested_classroom_id;
                }
            });

            setGroupTargets(targets);
        } catch (error) {
            console.error('Error fetching promotion candidates:', error);
            toast.error('Gagal memuat data siswa', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadYears();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (fromYearId && toYearId) {
            loadCandidates(fromYearId, toYearId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromYearId, toYearId]);

    const allRows = useMemo(() => data?.rows ?? [], [data]);

    const groups = useMemo(() => {
        const map = new Map<
            number,
            { id: number; label: string; gradeLevel: number; students: typeof allRows }
        >();

        allRows
            .filter((row) => fromClassFilter === 'all' || row.from_classroom_id === fromClassFilter)
            .forEach((row) => {
                if (!map.has(row.from_classroom_id)) {
                    map.set(row.from_classroom_id, {
                        id: row.from_classroom_id,
                        label: row.from_classroom_label,
                        gradeLevel: row.from_grade_level,
                        students: [],
                    });
                }

                map.get(row.from_classroom_id)!.students.push(row);
            });

        return [...map.values()];
    }, [allRows, fromClassFilter]);

    const classroomById = useMemo(
        () => new Map((data?.classrooms ?? []).map((classroom) => [classroom.id, classroom])),
        [data]
    );

    /** Pilihan kelas tujuan untuk satu kelas asal: wajib tepat satu tingkat di atasnya. */
    const targetOptionsFor = (gradeLevel: number) =>
        (data?.classrooms ?? [])
            .filter((classroom) => classroom.grade_level === gradeLevel + 1)
            .map((classroom) => ({
                value: classroom.id,
                label: classroom.display_name,
                description:
                    classroom.available <= 0
                        ? `Kuota ${classroom.quota} — penuh`
                        : `Kuota ${classroom.quota} • terisi ${classroom.filled} • tersedia ${classroom.available}`,
            }));

    const groupInfo = (groupId: number, students: typeof allRows) => {
        const targetId = groupTargets[groupId] ?? null;
        const target = targetId ? classroomById.get(targetId) : undefined;
        const dipilih = students.filter((row) => !excluded.includes(row.student_id)).length;
        const tersedia = target?.available ?? 0;

        return {
            target,
            dipilih,
            tersedia,
            melebihiKuota: Boolean(target) && dipilih > tersedia,
        };
    };

    const totalDipilih = groups.reduce((total, group) => {
        const { dipilih } = groupInfo(group.id, group.students);

        return total + dipilih;
    }, 0);

    const adaKelebihanKuota = groups.some(
        (group) => groupInfo(group.id, group.students).melebihiKuota
    );

    const toggleStudent = (studentId: number) => {
        setExcluded((current) =>
            current.includes(studentId)
                ? current.filter((id) => id !== studentId)
                : [...current, studentId]
        );
    };

    const toggleGroup = (studentIds: number[]) => {
        setExcluded((current) => {
            const semuaIkut = studentIds.every((id) => !current.includes(id));

            return semuaIkut
                ? [...new Set([...current, ...studentIds])]
                : current.filter((id) => !studentIds.includes(id));
        });
    };

    const handleProcess = async () => {
        if (!fromYearId || !toYearId || totalDipilih === 0) return;

        const promotions = groups.flatMap((group) => {
            const targetId = groupTargets[group.id];

            if (!targetId) return [];

            return group.students
                .filter((row) => !excluded.includes(row.student_id))
                .map((row) => ({ student_id: row.student_id, classroom_id: targetId }));
        });

        setIsProcessing(true);
        try {
            const result = await promotionService.promote(fromYearId, toYearId, promotions);

            toast.success('Kenaikan kelas berhasil', result.message);
            setShowConfirm(false);
            loadCandidates(fromYearId, toYearId);
        } catch (error) {
            console.error('Error promoting students:', error);

            const errors = (error as { response?: { data?: { errors?: unknown } } })?.response?.data
                ?.errors;

            toast.error(
                'Gagal memproses kenaikan kelas',
                Array.isArray(errors) && errors.length > 0
                    ? (errors as string[]).join(' ')
                    : getApiErrorMessage(error, 'silakan coba lagi')
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const belumPunyaKelasTujuan = groups.filter(
        (group) => !groupTargets[group.id] && targetOptionsFor(group.gradeLevel).length === 0
    ).length;

    return (
        <>
            <Helmet>
                <title>Kenaikan Kelas | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Kenaikan Kelas">
                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-body sm:text-2xl">
                        <TrendingUp className="h-6 w-6 text-brand" />
                        Kenaikan Kelas
                    </h1>
                    <p className="text-sm text-muted sm:text-base">
                        Naikkan siswa ke kelas pada tahun ajaran berikutnya. Siswa naik tepat satu
                        tingkat, dan riwayat kelas tahun sebelumnya tetap tersimpan.
                    </p>
                </div>

                <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Tahun Ajaran Asal
                            </label>
                            <SearchableSelect
                                options={(data?.academic_years ?? []).map((year) => ({
                                    value: year.id,
                                    label: year.name,
                                    description: year.is_active ? 'Aktif' : undefined,
                                }))}
                                value={fromYearId}
                                onChange={(value) => setFromYearId(Number(value))}
                                placeholder="Pilih tahun ajaran asal"
                                searchPlaceholder="Cari tahun ajaran..."
                                emptyMessage="Belum ada Master Tahun Ajaran"
                                ariaLabel="Tahun ajaran asal"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Tahun Ajaran Tujuan
                            </label>
                            <SearchableSelect
                                options={(data?.academic_years ?? [])
                                    .filter((year) => year.id !== fromYearId)
                                    .map((year) => ({ value: year.id, label: year.name }))}
                                value={toYearId}
                                onChange={(value) => setToYearId(Number(value))}
                                placeholder="Pilih tahun ajaran tujuan"
                                searchPlaceholder="Cari tahun ajaran..."
                                emptyMessage="Belum ada tahun ajaran lain"
                                ariaLabel="Tahun ajaran tujuan"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Kelas Asal
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'Semua Kelas' },
                                    ...(data?.from_classrooms ?? []).map((classroom) => ({
                                        value: classroom.id,
                                        label: classroom.display_name,
                                        description: `Tingkat ${classroom.grade_level}`,
                                    })),
                                ]}
                                value={fromClassFilter}
                                onChange={(value) =>
                                    setFromClassFilter(value === 'all' ? 'all' : Number(value))
                                }
                                searchPlaceholder="Cari kelas..."
                                emptyMessage="Belum ada kelas dengan siswa"
                                ariaLabel="Kelas asal"
                            />
                        </div>
                    </div>
                </div>

                {loading && !data ? (
                    <div className="rounded-xl border border-line bg-surface py-16 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-muted">Memuat data siswa...</p>
                    </div>
                ) : !fromYearId || !toYearId ? (
                    <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Pilih tahun ajaran asal dan tujuan
                        </h3>
                        <p className="mx-auto max-w-lg text-muted">
                            Kenaikan kelas membutuhkan dua tahun ajaran yang berbeda. Tambahkan tahun
                            ajaran berikutnya di Master Data → Tahun Ajaran bila belum ada.
                        </p>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
                        <Users className="mx-auto mb-4 h-12 w-12 text-muted" />
                        <h3 className="mb-2 text-lg font-medium text-body">
                            Tidak ada siswa yang perlu dinaikkan
                        </h3>
                        <p className="mx-auto max-w-lg text-muted">
                            Siswa muncul di sini bila punya kelas aktif pada tahun ajaran asal, belum
                            punya kelas pada tahun ajaran tujuan, dan belum dinyatakan lulus. Siswa
                            tingkat 6 diproses lewat menu Kelulusan.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {belumPunyaKelasTujuan > 0 && (
                            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5">
                                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
                                <p className="text-sm text-amber-700">
                                    {belumPunyaKelasTujuan} kelas asal belum punya kelas tujuan karena
                                    kelas tingkat berikutnya belum dibuat pada tahun ajaran tujuan.
                                    Tambahkan dulu di Master Data → Kelas.
                                </p>
                            </div>
                        )}

                        {groups.map((group) => {
                            const { target, dipilih, tersedia, melebihiKuota } = groupInfo(
                                group.id,
                                group.students
                            );
                            const studentIds = group.students.map((row) => row.student_id);
                            const semuaIkut = studentIds.every((id) => !excluded.includes(id));
                            const options = targetOptionsFor(group.gradeLevel);

                            return (
                                <div
                                    key={group.id}
                                    className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm"
                                >
                                    {/* Kelas asal + kelas tujuan */}
                                    <div className="flex flex-col gap-4 border-b border-line bg-surface-muted px-6 py-4 lg:flex-row lg:items-end lg:justify-between">
                                        <div className="flex items-center gap-3">
                                            <Layers className="h-5 w-5 text-brand" />
                                            <div>
                                                <p className="text-sm text-muted">Kelas Asal</p>
                                                <p className="text-lg font-bold text-body">
                                                    {group.label}
                                                </p>
                                            </div>
                                            <span className="ml-2 rounded-full bg-brand/20 px-3 py-1 text-xs font-semibold text-brand">
                                                {group.students.length} siswa
                                            </span>
                                        </div>

                                        <div className="w-full lg:w-72">
                                            <label className="mb-2 block text-sm font-medium text-body">
                                                Kelas Tujuan (tingkat {group.gradeLevel + 1})
                                            </label>
                                            <SearchableSelect
                                                options={options}
                                                value={groupTargets[group.id] ?? null}
                                                onChange={(value) =>
                                                    setGroupTargets((current) => ({
                                                        ...current,
                                                        [group.id]: Number(value),
                                                    }))
                                                }
                                                placeholder="Pilih kelas tujuan"
                                                searchPlaceholder="Cari kelas..."
                                                emptyMessage={`Belum ada kelas tingkat ${
                                                    group.gradeLevel + 1
                                                } di tahun ajaran tujuan`}
                                                compact
                                                ariaLabel={`Kelas tujuan untuk ${group.label}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Ringkasan kuota kelas tujuan */}
                                    <div className="grid grid-cols-2 gap-4 border-b border-line px-6 py-4 md:grid-cols-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted">
                                                Kuota
                                            </p>
                                            <p className="mt-1 text-lg font-bold text-body">
                                                {target?.quota ?? '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted">
                                                Terisi
                                            </p>
                                            <p className="mt-1 text-lg font-bold text-body">
                                                {target?.filled ?? '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted">
                                                Tersedia
                                            </p>
                                            <p className="mt-1 text-lg font-bold text-body">
                                                {target?.available ?? '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted">
                                                Dipilih
                                            </p>
                                            <p
                                                className={`mt-1 text-lg font-bold ${
                                                    melebihiKuota ? 'text-red-500' : 'text-body'
                                                }`}
                                            >
                                                {dipilih}
                                            </p>
                                        </div>
                                    </div>

                                    {melebihiKuota && (
                                        <p className="border-b border-line bg-red-50 px-6 py-2 text-sm text-red-700">
                                            {dipilih} siswa dipilih, tetapi sisa kuota kelas{' '}
                                            {target?.display_name} hanya {tersedia}. Kurangi jumlah
                                            siswa atau pilih kelas lain.
                                        </p>
                                    )}

                                    {!groupTargets[group.id] && options.length === 0 && (
                                        <p className="border-b border-line bg-amber-50 px-6 py-2 text-sm text-amber-700">
                                            Kelas tingkat {group.gradeLevel + 1} belum ada pada tahun
                                            ajaran tujuan, jadi kelas ini belum bisa diproses.
                                        </p>
                                    )}

                                    {/* Tabel siswa */}
                                    <PaginatedTableSection rows={group.students}>
                                    {(visibleStudents) => (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-line">
                                            <thead className="bg-surface">
                                                <tr>
                                                    <th className="w-12 px-6 py-3 text-left">
                                                        <input
                                                            type="checkbox"
                                                            checked={semuaIkut}
                                                            onChange={() => toggleGroup(studentIds)}
                                                            aria-label={`Pilih semua siswa ${group.label}`}
                                                            className="h-4 w-4 rounded border-line text-brand focus:ring-blue-500"
                                                        />
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                        NIS
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Nama
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Kelas Asal
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-line">
                                                {visibleStudents.map((row) => (
                                                    <tr
                                                        key={row.student_id}
                                                        className="hover:bg-surface-muted"
                                                    >
                                                        <td className="px-6 py-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    !excluded.includes(row.student_id)
                                                                }
                                                                onChange={() =>
                                                                    toggleStudent(row.student_id)
                                                                }
                                                                aria-label={`Pilih ${row.full_name}`}
                                                                className="h-4 w-4 rounded border-line text-brand focus:ring-blue-500"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-body">
                                                            {row.nis ?? (
                                                                <span className="text-xs text-muted">
                                                                    Belum diisi
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-3 text-sm font-medium text-body">
                                                            {row.full_name}
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-muted">
                                                            {row.from_classroom_label}
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                                                {row.status_label ?? 'Aktif'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 text-right">
                                                            <Link
                                                                to={`/admin/siswa/${row.student_id}`}
                                                                className="text-xs font-medium text-brand hover:underline"
                                                            >
                                                                Detail
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    )}
                                    </PaginatedTableSection>
                                </div>
                            );
                        })}

                        {/* Aksi proses */}
                        <div className="flex flex-col justify-between gap-4 rounded-xl border border-line bg-surface p-6 shadow-sm md:flex-row md:items-center">
                            <div>
                                <p className="text-sm text-muted">
                                    Dipilih{' '}
                                    <span className="font-semibold text-body">{totalDipilih}</span>{' '}
                                    siswa untuk dinaikkan ke tahun ajaran{' '}
                                    {data?.to_academic_year?.name}
                                </p>
                                {adaKelebihanKuota && (
                                    <p className="mt-1 text-sm text-red-700">
                                        Perbaiki dulu kelas tujuan yang melebihi kuota.
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowConfirm(true)}
                                disabled={
                                    totalDipilih === 0 || adaKelebihanKuota || isProcessing
                                }
                                className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Proses Kenaikan
                                {totalDipilih > 0 && ` (${totalDipilih})`}
                            </button>
                        </div>
                    </div>
                )}
            </Layout>

            <Modal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                title="Konfirmasi Kenaikan Kelas"
                type="warning"
                confirmText="Ya, Naikkan"
                cancelText="Batal"
                onConfirm={handleProcess}
                isLoading={isProcessing}
            >
                <div className="space-y-3 py-2">
                    <ul className="space-y-2 text-body">
                        {groups.map((group) => {
                            const { dipilih } = groupInfo(group.id, group.students);
                            const target = classroomById.get(groupTargets[group.id] ?? 0);

                            if (dipilih === 0 || !target) return null;

                            return (
                                <li key={group.id}>
                                    Anda akan menaikkan{' '}
                                    <span className="font-semibold">{dipilih} siswa</span> dari kelas{' '}
                                    <span className="font-semibold">{group.label}</span> ke kelas{' '}
                                    <span className="font-semibold">{target.display_name}</span> untuk
                                    Tahun Ajaran {data?.to_academic_year?.name}.
                                </li>
                            );
                        })}
                    </ul>
                    <p className="text-sm text-muted">
                        Lanjutkan? Riwayat kelas tahun ajaran asal tidak dihapus, hanya ditambah
                        penempatan baru pada tahun ajaran tujuan. Kuota kelas tujuan dicek ulang saat
                        proses.
                    </p>
                </div>
            </Modal>
        </>
    );
}
