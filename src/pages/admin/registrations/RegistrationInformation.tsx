import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CalendarClock, CircleDollarSign, ClipboardCheck, Loader2, Plus, Save, Trash2, Users } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import NumericInput from '../../../components/common/NumericInput';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import {
    registrationInformationService,
    type RegistrationFeeInput,
    type RegistrationRequirementInput,
} from '../../../services/registrationInformationServices';

const inputClass =
    'w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-body outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

export default function RegistrationInformation() {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [phase, setPhase] = useState<'closed' | 'account' | 'open'>('closed');
    const [phaseMessage, setPhaseMessage] = useState('');
    const [quota, setQuota] = useState(0);
    const [quotaDescription, setQuotaDescription] = useState('');
    const [registered, setRegistered] = useState(0);
    const [academicYear, setAcademicYear] = useState<string | null>(null);
    const [requirements, setRequirements] = useState<RegistrationRequirementInput[]>([]);
    const [fees, setFees] = useState<RegistrationFeeInput[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await registrationInformationService.getAdmin();
                setPhase(data.phase);
                setPhaseMessage(data.phase_message ?? '');
                setQuota(data.quota);
                setQuotaDescription(data.quota_description ?? '');
                setRegistered(data.registered);
                setAcademicYear(data.academic_year?.name ?? null);
                setRequirements(data.requirements);
                setFees(data.fees);
            } catch (error) {
                toast.error('Gagal memuat informasi pendaftaran', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const save = async () => {
        if (requirements.some((item) => !item.content.trim())) {
            toast.warning('Isi persyaratan tidak boleh kosong');
            return;
        }

        if (fees.some((item) => !item.program.trim())) {
            toast.warning('Nama program biaya tidak boleh kosong');
            return;
        }

        setSaving(true);
        try {
            const data = await registrationInformationService.update({
                phase,
                phase_message: phaseMessage.trim() || null,
                quota,
                quota_description: quotaDescription.trim() || null,
                requirements: requirements.map((item) => ({
                    content: item.content.trim(),
                    is_active: item.is_active,
                })),
                fees: fees.map((item) => ({
                    program: item.program.trim(),
                    amount: item.amount,
                    description: item.description?.trim() || null,
                    is_active: item.is_active,
                })),
            });
            setRequirements(data.requirements);
            setFees(data.fees);
            setRegistered(data.registered);
            toast.success('Informasi pendaftaran berhasil disimpan');
        } catch (error) {
            toast.error('Gagal menyimpan informasi pendaftaran', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Informasi Pendaftaran">
                <div className="rounded-xl border border-line bg-surface py-16 text-center">
                    <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-muted">Memuat informasi pendaftaran...</p>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Helmet>
                <title>Informasi Pendaftaran | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Informasi Pendaftaran">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="text-xl font-bold text-body sm:text-2xl">Informasi Pendaftaran</h1>
                        <p className="mt-1 text-sm text-muted">
                            Atur kuota, persyaratan, dan biaya yang tampil pada halaman pendaftaran.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={save}
                        disabled={saving}
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>

                <div className="space-y-6">
                    <section className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><CalendarClock className="h-5 w-5" /></div>
                            <div>
                                <h2 className="font-semibold text-body">Tahap Pendaftaran</h2>
                                <p className="text-sm text-muted">Pilih tampilan yang dilihat pengunjung pada halaman pendaftaran.</p>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-body">Status Halaman</label>
                                <select
                                    value={phase}
                                    onChange={(event) => setPhase(event.target.value as typeof phase)}
                                    className={`${inputClass} cursor-pointer`}
                                >
                                    <option value="closed">Belum Dibuka</option>
                                    <option value="account">Pembuatan Akun</option>
                                    <option value="open">Formulir Dibuka</option>
                                </select>
                                <p className="mt-2 text-xs leading-relaxed text-muted">
                                    {phase === 'closed' && 'Pengunjung hanya melihat pemberitahuan bahwa pendaftaran belum dibuka.'}
                                    {phase === 'account' && 'Pengunjung diarahkan membuat akun, sementara formulir masih disembunyikan.'}
                                    {phase === 'open' && 'Informasi PPDB dan formulir pendaftaran dapat diakses penuh.'}
                                </p>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-body">Pesan Tambahan</label>
                                <textarea
                                    value={phaseMessage}
                                    onChange={(event) => setPhaseMessage(event.target.value)}
                                    rows={4}
                                    maxLength={2000}
                                    placeholder="Kosongkan untuk menggunakan pesan bawaan sistem."
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Users className="h-5 w-5" /></div>
                            <div>
                                <h2 className="font-semibold text-body">Kuota Pendaftaran</h2>
                                <p className="text-sm text-muted">
                                    Tahun ajaran aktif: {academicYear ?? 'belum ditetapkan'} • pendaftar aktif: {registered}
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-body">Jumlah Kuota</label>
                                <NumericInput
                                    value={quota}
                                    onChange={(value) => setQuota(Number(value) || 0)}
                                    maxLength={6}
                                    ariaLabel="Jumlah kuota pendaftaran"
                                    className={inputClass}
                                />
                                <p className="mt-1 text-xs text-muted">Isi 0 jika kuota belum ditentukan.</p>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-body">Keterangan Kuota</label>
                                <textarea
                                    value={quotaDescription}
                                    onChange={(event) => setQuotaDescription(event.target.value)}
                                    rows={3}
                                    maxLength={1000}
                                    placeholder="Contoh: Kuota berlaku untuk calon siswa baru tahun ajaran aktif."
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600"><ClipboardCheck className="h-5 w-5" /></div>
                                <div>
                                    <h2 className="font-semibold text-body">Persyaratan</h2>
                                    <p className="text-sm text-muted">Urutan input menentukan urutan tampil di landing page.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRequirements((items) => [...items, { content: '', is_active: true }])}
                                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                            >
                                <Plus className="mr-1.5 h-4 w-4" /> Tambah Persyaratan
                            </button>
                        </div>
                        <div className="space-y-3">
                            {requirements.length === 0 && <p className="rounded-lg bg-surface-muted p-4 text-sm text-muted">Belum ada persyaratan.</p>}
                            {requirements.map((item, index) => (
                                <div key={item.id ?? `new-${index}`} className="flex flex-col gap-3 rounded-lg border border-line p-4 sm:flex-row sm:items-center">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{index + 1}</span>
                                    <input
                                        value={item.content}
                                        onChange={(event) => setRequirements((items) => items.map((entry, entryIndex) => entryIndex === index ? { ...entry, content: event.target.value } : entry))}
                                        maxLength={500}
                                        placeholder="Contoh: Fotokopi akta kelahiran"
                                        className={`${inputClass} flex-1`}
                                    />
                                    <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
                                        <input
                                            type="checkbox"
                                            checked={item.is_active}
                                            onChange={(event) => setRequirements((items) => items.map((entry, entryIndex) => entryIndex === index ? { ...entry, is_active: event.target.checked } : entry))}
                                            className="h-4 w-4 cursor-pointer rounded border-line text-blue-600"
                                        /> Tampil
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setRequirements((items) => items.filter((_, entryIndex) => entryIndex !== index))}
                                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
                                        aria-label={`Hapus persyaratan ${index + 1}`}
                                    ><Trash2 className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600"><CircleDollarSign className="h-5 w-5" /></div>
                                <div>
                                    <h2 className="font-semibold text-body">Program Biaya</h2>
                                    <p className="text-sm text-muted">Setiap program akan tampil sebagai kartu biaya.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFees((items) => [...items, { program: '', amount: 0, description: '', is_active: true }])}
                                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                            >
                                <Plus className="mr-1.5 h-4 w-4" /> Tambah Program
                            </button>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-2">
                            {fees.length === 0 && <p className="rounded-lg bg-surface-muted p-4 text-sm text-muted lg:col-span-2">Belum ada program biaya.</p>}
                            {fees.map((item, index) => (
                                <div key={item.id ?? `new-${index}`} className="rounded-xl border border-line p-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-body">Program {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFees((items) => items.filter((_, entryIndex) => entryIndex !== index))}
                                            className="cursor-pointer rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                            aria-label={`Hapus program biaya ${index + 1}`}
                                        ><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-body">Nama Program</label>
                                            <input
                                                value={item.program}
                                                onChange={(event) => setFees((items) => items.map((entry, entryIndex) => entryIndex === index ? { ...entry, program: event.target.value } : entry))}
                                                maxLength={255}
                                                placeholder="Contoh: Uang Pangkal"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-body">Nominal</label>
                                            <NumericInput
                                                value={item.amount}
                                                onChange={(value) => setFees((items) => items.map((entry, entryIndex) => entryIndex === index ? { ...entry, amount: Number(value) || 0 } : entry))}
                                                maxLength={12}
                                                placeholder="0"
                                                ariaLabel={`Nominal program ${index + 1}`}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-body">Keterangan</label>
                                            <textarea
                                                value={item.description ?? ''}
                                                onChange={(event) => setFees((items) => items.map((entry, entryIndex) => entryIndex === index ? { ...entry, description: event.target.value } : entry))}
                                                rows={2}
                                                maxLength={1000}
                                                placeholder="Keterangan program biaya"
                                                className={`${inputClass} resize-none`}
                                            />
                                        </div>
                                        <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
                                            <input
                                                type="checkbox"
                                                checked={item.is_active}
                                                onChange={(event) => setFees((items) => items.map((entry, entryIndex) => entryIndex === index ? { ...entry, is_active: event.target.checked } : entry))}
                                                className="h-4 w-4 cursor-pointer rounded border-line text-blue-600"
                                            /> Tampilkan di landing page
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </Layout>
        </>
    );
}
