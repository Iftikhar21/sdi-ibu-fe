import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Upload, Camera, FileText, CheckCircle, Users, X, CircleDollarSign, ClipboardCheck, ListChecks, UserPlus, Send, ShieldCheck, CalendarClock, Landmark, Loader2, School } from 'lucide-react';
import MainLayout from "../../../components/layout/landing/MainLayout";
import { registrationService } from '../../../services/registrationServices';
import Modal from '../../../components/common/Modal';
import { Helmet } from 'react-helmet-async';
import NumericInput from '../../../components/common/NumericInput';
import DateInput from '../../../components/common/DateInput';
import { registrationInformationService, type RegistrationInformation } from '../../../services/registrationInformationServices';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../context/toast';

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const PendaftaranPage = () => {
    const location = useLocation();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState('');
    const [information, setInformation] = useState<RegistrationInformation | null>(null);
    const [informationLoading, setInformationLoading] = useState(true);
    const [successRegistration, setSuccessRegistration] = useState<{
        number: string;
        name: string;
        status: string;
    } | null>(null);

    // State untuk modal error
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');
    const [errorModalTitle, setErrorModalTitle] = useState('');

    const [formData, setFormData] = useState({
        full_name: '',
        nickname: '',
        gender: '',
        birth_place: '',
        birth_date: '',
        previous_school: '',
        father_name: '',
        mother_name: '',
        address: '',
        phone: '',
        contact_email: '',
    });

    const [files, setFiles] = useState({
        photo: null as File | null,
        birth_certificate: null as File | null,
        family_card: null as File | null,
        payment_proof: null as File | null,
        transfer_proof: null as File | null,
    });

    const [previews, setPreviews] = useState({
        photo: '',
        birth_certificate: '',
        family_card: '',
        payment_proof: '',
        transfer_proof: '',
    });

    useEffect(() => {
        registrationInformationService.getPublic()
            .then(setInformation)
            .catch((error) => console.error('Error fetching registration information:', error))
            .finally(() => setInformationLoading(false));
    }, []);

    useEffect(() => {
        if (informationLoading || !location.hash) return;

        const timer = window.setTimeout(() => {
            document.getElementById(location.hash.slice(1))?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }, 0);

        return () => window.clearTimeout(timer);
    }, [informationLoading, location.hash]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files: fileList } = e.target;
        if (!fileList || fileList.length === 0) return;

        const file = fileList[0];

        // Validasi ukuran file (max 10MB = 10485760 bytes)
        if (file.size > 10485760) {
            setErrors(prev => ({ ...prev, [name]: 'Ukuran file maksimal 10MB' }));
            return;
        }

        // Validasi tipe file untuk gambar
        if (name === 'photo' || name === 'birth_certificate' || name === 'family_card' || name === 'payment_proof') {
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, [name]: 'File harus berupa gambar' }));
                return;
            }
        }

        if (name === 'transfer_proof') {
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (!extension || !['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'].includes(extension)) {
                setErrors(prev => ({ ...prev, [name]: 'Format harus JPG, PNG, PDF, DOC, atau DOCX' }));
                return;
            }
        }

        setFiles(prev => ({ ...prev, [name]: file }));

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [name]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }

        // Clear error
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validasi data pribadi
        if (!formData.full_name.trim()) newErrors.full_name = 'Nama lengkap wajib diisi';
        if (!formData.nickname.trim()) newErrors.nickname = 'Nama panggilan wajib diisi';
        if (!formData.gender) newErrors.gender = 'Jenis kelamin wajib dipilih';
        if (!formData.birth_place.trim()) newErrors.birth_place = 'Tempat lahir wajib diisi';
        if (!formData.birth_date) newErrors.birth_date = 'Tanggal lahir wajib diisi';
        if (!formData.previous_school.trim()) newErrors.previous_school = 'Asal sekolah wajib diisi';

        // Validasi data orang tua
        if (!formData.father_name.trim()) newErrors.father_name = 'Nama ayah wajib diisi';
        if (!formData.mother_name.trim()) newErrors.mother_name = 'Nama ibu wajib diisi';
        if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
        if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
        if (!formData.contact_email.trim()) {
            newErrors.contact_email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
            newErrors.contact_email = 'Format email tidak valid';
        }

        // Validasi file
        if (!files.photo) newErrors.photo = 'Foto wajib diunggah';
        if (!files.birth_certificate) newErrors.birth_certificate = 'Akte kelahiran wajib diunggah';
        if (!files.family_card) newErrors.family_card = 'Kartu keluarga wajib diunggah';
        if (!files.payment_proof) newErrors.payment_proof = 'Bukti pembayaran wajib diunggah';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const showError = (title: string, message: string) => {
        setErrorModalTitle(title);
        setErrorModalMessage(message);
        setShowErrorModal(true);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            // Scroll to first error
            const firstError = Object.keys(errors)[0];
            const element = document.getElementsByName(firstError)[0];
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();

            // Append text data
            Object.entries(formData).forEach(([key, value]) => {
                formDataToSend.append(key, value);
            });

            // Append files
            Object.entries(files).forEach(([key, file]) => {
                if (file) {
                    formDataToSend.append(key, file);
                }
            });

            const response = await registrationService.create(formDataToSend);

            const nomorPendaftaran = response?.registration_number ?? '';
            const namaPendaftar = formData.full_name;

            // Reset form
            handleReset();

            // Show success message
            setSuccessRegistration({
                number: nomorPendaftaran,
                name: namaPendaftar,
                status: response?.status ?? 'submitted'
            });
            setSuccessMessage(
                `Pendaftaran untuk ${namaPendaftar} berhasil dikirim! Simpan nomor pendaftaran di bawah untuk memantau status.`
            );
            toast.success(
                'Pendaftaran berhasil dikirim',
                nomorPendaftaran
                    ? `Nomor pendaftaran: ${nomorPendaftaran}`
                    : `Data ${namaPendaftar} berhasil diterima.`
            );

        } catch (error: unknown) {
            console.error('Error submitting registration:', error);
            showError(
                'Gagal Mengirim Pendaftaran',
                getApiErrorMessage(error, 'Gagal mengirim pendaftaran. Silakan coba lagi.')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({
            full_name: '',
            nickname: '',
            gender: '',
            birth_place: '',
            birth_date: '',
            previous_school: '',
            father_name: '',
            mother_name: '',
            address: '',
            phone: '',
            contact_email: '',
        });

        setFiles({
            photo: null,
            birth_certificate: null,
            family_card: null,
            payment_proof: null,
            transfer_proof: null,
        });

        setPreviews({
            photo: '',
            birth_certificate: '',
            family_card: '',
            payment_proof: '',
            transfer_proof: '',
        });

        setErrors({});
    };

    return (
        <>
            <MainLayout>
                <Helmet>
                    {/* TITLE */}
                    <title>SPMB | SDI Ikhlas Bakti Umat</title>

                    {/* META DESCRIPTION */}
                    <meta
                        name="description"
                        content="Pendaftaran Peserta Didik Baru SDI Ikhlas Bakti Umat. Daftarkan anak Anda melalui formulir online resmi dengan proses mudah dan aman."
                    />

                    {/* KEYWORDS */}
                    <meta
                        name="keywords"
                        content="Pendaftaran SDI, PPDB SDI Ikhlas Bakti Umat, Pendaftaran Sekolah Dasar Islam, PPDB SDI"
                    />

                    {/* ROBOTS */}
                    <meta name="robots" content="index, follow" />

                    {/* OPEN GRAPH */}
                    <meta
                        property="og:title"
                        content="Pendaftaran Peserta Didik Baru | SDI Ikhlas Bakti Umat"
                    />
                    <meta
                        property="og:description"
                        content="Formulir pendaftaran online resmi SDI Ikhlas Bakti Umat untuk calon peserta didik baru."
                    />
                    <meta property="og:type" content="website" />
                    <meta property="og:url" content={window.location.href} />

                    {/* OG IMAGE */}
                    <meta
                        property="og:image"
                        content="https://www.sdiibu.com/og/pendaftaran.jpg"
                    />
                </Helmet>

                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 py-16 overflow-hidden dark:from-brand-strong dark:via-brand dark:to-brand-strong">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center text-white">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                SPMB SDI Ikhlas Bakti Umat
                            </h1>
                            <p className="text-blue-100 text-lg">
                                Informasi Sistem Penerimaan Murid Baru dan formulir pendaftaran daring.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success Message Banner */}
                {successMessage && (
                    <div className="container mx-auto px-4 pt-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                                    <div>
                                        <span className="text-green-800">{successMessage}</span>
                                        {successRegistration?.number && (
                                            <div className="mt-2">
                                                <span className="block text-xs uppercase tracking-wide text-green-700">
                                                    Nomor Pendaftaran
                                                </span>
                                                <span className="block text-lg font-bold tracking-wide text-green-900">
                                                    {successRegistration.number}
                                                </span>
                                                <span className="block text-xs text-green-700">
                                                    Status: Dikirim — pantau di menu Pendaftaran
                                                    Saya pada dashboard.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSuccessMessage('');
                                        setSuccessRegistration(null);
                                    }}
                                    className="text-green-600 hover:text-green-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {informationLoading ? (
                    <section className="bg-surface-muted py-24">
                        <div className="text-center">
                            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-sm text-muted">Memuat status pendaftaran...</p>
                        </div>
                    </section>
                ) : (
                    <>
                    {information?.phase !== 'open' && (
                    <section id="formulir" className="scroll-mt-24 bg-surface-muted py-16 md:py-24">
                        <div className="container mx-auto px-4">
                            <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-surface p-8 text-center shadow-lg md:p-12">
                                <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${information?.phase === 'account' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {information?.phase === 'account'
                                        ? <UserPlus className="h-10 w-10" />
                                        : <CalendarClock className="h-10 w-10" />}
                                </div>
                                <span className={`inline-flex rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${information?.phase === 'account' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {information?.phase === 'account' ? 'Tahap Pembuatan Akun' : 'Belum Dibuka'}
                                </span>
                                <h2 className="mt-4 text-2xl font-bold text-body md:text-3xl">
                                    {information?.phase === 'account'
                                        ? 'Silakan Buat Akun Terlebih Dahulu'
                                        : 'Pendaftaran Belum Dibuka'}
                                </h2>
                                <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted">
                                    {information?.phase_message || (information?.phase === 'account'
                                        ? 'Pembuatan akun calon orang tua murid sudah dibuka. Buat akun sekarang agar siap ketika formulir pendaftaran mulai tersedia.'
                                        : 'Pendaftaran peserta didik baru SDI Ikhlas Bakti Umat belum dibuka. Silakan pantau kembali halaman ini untuk informasi berikutnya.')}
                                </p>
                                {information?.phase === 'account' ? (
                                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                        <Link
                                            to="/register"
                                            className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            <UserPlus className="mr-2 h-5 w-5" /> Buat Akun
                                        </Link>
                                        <Link
                                            to="/login"
                                            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-100"
                                        >
                                            Sudah Punya Akun? Masuk
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="mt-8 text-sm font-medium text-amber-700">
                                        Pantau halaman ini secara berkala untuk jadwal pembukaan pendaftaran.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                    )}
                {/* Informasi PPDB */}
                <section id="kuota-kelas" className="scroll-mt-24 bg-surface-muted py-12">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-6xl">
                            <div className="mb-8 text-center">
                                <span className="inline-flex rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                    Informasi SPMB
                                </span>
                                <h2 className="mt-3 text-2xl font-bold text-body md:text-3xl">
                                    Informasi Sebelum Mendaftar
                                </h2>
                                <p className="mx-auto mt-2 max-w-2xl text-sm text-muted md:text-base">
                                    Periksa kuota, persyaratan, dan biaya sebelum melengkapi formulir.
                                </p>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-3">
                                <article className="rounded-2xl border border-blue-200 bg-surface p-6 shadow-sm">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Users className="h-6 w-6" /></div>
                                        <div>
                                            <h3 className="font-semibold text-body">Kuota Tersedia</h3>
                                            <p className="text-xs text-muted">Tahun ajaran {information?.academic_year?.name ?? 'aktif'}</p>
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {information?.available === null || information?.available === undefined
                                            ? 'Belum ditentukan'
                                            : `${information.available} pendaftar`}
                                    </p>
                                    {information && information.quota > 0 && (
                                        <>
                                            <p className="mt-1 text-sm text-muted">
                                                {information.registered} pendaftar dari total {information.quota} kuota
                                            </p>
                                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
                                                <div
                                                    className="h-full rounded-full bg-blue-600 transition-all"
                                                    style={{ width: `${Math.min(100, (information.registered / information.quota) * 100)}%` }}
                                                />
                                            </div>
                                        </>
                                    )}
                                    {information?.quota_description && (
                                        <p className="mt-4 text-sm leading-relaxed text-muted">{information.quota_description}</p>
                                    )}
                                </article>

                                <article id="persyaratan" className="scroll-mt-24 rounded-2xl border border-emerald-200 bg-surface p-6 shadow-sm lg:col-span-2">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600"><ClipboardCheck className="h-6 w-6" /></div>
                                        <div>
                                            <h3 className="font-semibold text-body">Persyaratan Pendaftaran</h3>
                                            <p className="text-xs text-muted">Siapkan dokumen berikut sebelum mengisi formulir</p>
                                        </div>
                                    </div>
                                    {information?.requirements.length ? (
                                        <ul className="grid gap-3 sm:grid-cols-2">
                                            {information.requirements.map((item, index) => (
                                                <li key={item.id ?? index} className="flex items-start gap-3 rounded-lg bg-emerald-50/60 p-3 text-sm text-body">
                                                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                                    <span>{item.content}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted">Persyaratan akan diinformasikan oleh admin sekolah.</p>
                                    )}
                                </article>
                            </div>

                            <div className="mt-6 rounded-2xl border border-indigo-200 bg-surface p-6 shadow-sm">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><School className="h-6 w-6" /></div>
                                    <div>
                                        <h3 className="font-semibold text-body">Kuota Masing-masing Kelas</h3>
                                        <p className="text-xs text-muted">
                                            Kapasitas dan ketersediaan berdasarkan penempatan siswa tahun ajaran {information?.academic_year?.name ?? 'aktif'}
                                        </p>
                                    </div>
                                </div>
                                {information?.class_quotas?.length ? (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {information.class_quotas.map((classroom) => {
                                            const filledPercentage = classroom.quota > 0
                                                ? Math.min(100, (classroom.filled / classroom.quota) * 100)
                                                : 0;

                                            return (
                                                <article key={classroom.id} className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">Kelas</p>
                                                            <h4 className="mt-1 text-xl font-bold text-body">{classroom.name}</h4>
                                                        </div>
                                                        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                                                            {classroom.available} tersedia
                                                        </span>
                                                    </div>
                                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-indigo-100">
                                                        <div
                                                            className="h-full rounded-full bg-indigo-600"
                                                            style={{ width: `${filledPercentage}%` }}
                                                        />
                                                    </div>
                                                    <div className="mt-3 flex items-center justify-between text-sm text-muted">
                                                        <span>{classroom.filled} siswa terisi</span>
                                                        <span>Kuota {classroom.quota}</span>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted">Kuota kelas belum tersedia untuk tahun ajaran aktif.</p>
                                )}
                            </div>

                            <div id="biaya" className="scroll-mt-24 mt-6 rounded-2xl border border-amber-200 bg-surface p-6 shadow-sm">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="rounded-xl bg-amber-50 p-3 text-amber-600"><CircleDollarSign className="h-6 w-6" /></div>
                                    <div>
                                        <h3 className="font-semibold text-body">Biaya Pendaftaran</h3>
                                        <p className="text-xs text-muted">Rincian biaya berdasarkan program</p>
                                    </div>
                                </div>
                                {information?.fees.length ? (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {information.fees.map((fee, index) => (
                                            <div key={fee.id ?? index} className="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
                                                <p className="text-sm font-semibold text-body">{fee.program}</p>
                                                <p className="mt-2 text-xl font-bold text-amber-700">{formatRupiah(fee.amount)}</p>
                                                {fee.description && <p className="mt-2 text-sm leading-relaxed text-muted">{fee.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted">Rincian biaya akan diinformasikan oleh admin sekolah.</p>
                                )}
                                {information?.payment_bank && information.payment_account_number && information.payment_account_name && (
                                    <div className="mt-6 rounded-xl border border-cyan-200 bg-cyan-50/60 p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-cyan-100 p-2.5 text-cyan-700">
                                                <Landmark className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-body">Tujuan Pembayaran</h4>
                                                <p className="mt-1 text-xs text-muted">Transfer biaya pendaftaran ke rekening resmi berikut.</p>
                                                <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                                                    <div>
                                                        <dt className="text-xs font-medium uppercase tracking-wide text-muted">Bank</dt>
                                                        <dd className="mt-1 font-semibold text-body">{information.payment_bank}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs font-medium uppercase tracking-wide text-muted">Nomor Rekening</dt>
                                                        <dd className="mt-1 break-all font-mono text-lg font-bold text-cyan-800">{information.payment_account_number}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs font-medium uppercase tracking-wide text-muted">Atas Nama</dt>
                                                        <dd className="mt-1 font-semibold text-body">{information.payment_account_name}</dd>
                                                    </div>
                                                </dl>
                                                <p className="mt-4 text-xs text-cyan-800">Pastikan nama penerima sesuai sebelum melakukan transfer.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div id="alur" className="scroll-mt-24 mt-10">
                                <div className="mb-6 text-center">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><ListChecks className="h-6 w-6" /></div>
                                    <h3 className="text-xl font-bold text-body">Alur Pendaftaran</h3>
                                    <p className="mt-1 text-sm text-muted">Empat langkah untuk menyelesaikan pendaftaran siswa baru.</p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-4">
                                    {[
                                        { icon: UserPlus, title: 'Buat Akun', text: 'Daftar atau masuk menggunakan akun orang tua.' },
                                        { icon: FileText, title: 'Lengkapi Formulir', text: 'Isi data calon murid dan unggah dokumen.' },
                                        { icon: Send, title: 'Kirim Pendaftaran', text: 'Periksa kembali data lalu kirim formulir.' },
                                        { icon: ShieldCheck, title: 'Verifikasi Admin', text: 'Pantau status pendaftaran melalui dashboard.' },
                                    ].map((step, index) => (
                                        <div key={step.title} className="relative rounded-xl border border-line bg-surface p-5 text-center shadow-sm">
                                            <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{index + 1}</span>
                                            <step.icon className="mx-auto mb-3 h-7 w-7 text-blue-600" />
                                            <h4 className="font-semibold text-body">{step.title}</h4>
                                            <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Form Section */}
                {information?.phase === 'open' && (
                <div id="formulir" className="scroll-mt-24 container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Informasi Penting */}
                        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                            <div className="flex items-start gap-4">
                                <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Informasi Multi Pendaftaran</h3>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Satu akun dapat digunakan untuk mendaftarkan semua anak dalam keluarga</li>
                                        <li>• Setiap pendaftaran diperlakukan secara terpisah</li>
                                        <li>• Status masing-masing anak dapat dipantau di dashboard</li>
                                        <li>• File maksimal 10MB per dokumen</li>
                                        <li>• Format file yang diterima: JPG, PNG, JPEG</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface rounded-2xl shadow-lg p-8 md:p-12">
                            {/* Badge */}
                            <div className="inline-block bg-blue-100 text-blue-600 px-5 py-2 rounded-full text-sm font-medium mb-8">
                                Form Pendaftaran
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Data Calon Murid */}
                                <div className="mb-10">
                                    <h2 className="text-2xl font-bold text-body mb-6 pb-3 border-b-2 border-line">
                                        Data Calon Murid
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Nama Lengkap */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-2">
                                                Nama Lengkap <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                placeholder="Masukkan nama lengkap sesuai akte"
                                                className={`w-full px-4 py-3 bg-surface-muted border ${errors.full_name ? 'border-red-300' : 'border-line'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-all`}
                                                required
                                            />
                                            {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
                                        </div>

                                        {/* Nama Panggilan */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-2">
                                                Nama Panggilan <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="nickname"
                                                value={formData.nickname}
                                                onChange={handleChange}
                                                placeholder="Nama yang biasa dipanggil"
                                                className={`w-full px-4 py-3 bg-surface-muted border ${errors.nickname ? 'border-red-300' : 'border-line'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-all`}
                                                required
                                            />
                                            {errors.nickname && <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>}
                                        </div>

                                        {/* Jenis Kelamin */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-2">
                                                Jenis Kelamin <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 bg-surface-muted border ${errors.gender ? 'border-red-300' : 'border-line'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-all appearance-none cursor-pointer`}
                                                required
                                            >
                                                <option value="">Pilih Jenis Kelamin</option>
                                                <option value="L">Laki-laki</option>
                                                <option value="P">Perempuan</option>
                                            </select>
                                            {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                                        </div>

                                        {/* Tempat Lahir */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-2">
                                                Tempat Lahir <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="birth_place"
                                                value={formData.birth_place}
                                                onChange={handleChange}
                                                placeholder="Kota kelahiran"
                                                className={`w-full px-4 py-3 bg-surface-muted border ${errors.birth_place ? 'border-red-300' : 'border-line'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-all`}
                                                required
                                            />
                                            {errors.birth_place && <p className="mt-1 text-sm text-red-600">{errors.birth_place}</p>}
                                        </div>

                                        {/* Tanggal Lahir */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-2">
                                                Tanggal Lahir <span className="text-red-500">*</span>
                                            </label>
                                            <DateInput
                                                value={formData.birth_date}
                                                onChange={(value) =>
                                                    setFormData((previous) => ({
                                                        ...previous,
                                                        birth_date: value,
                                                    }))
                                                }
                                                max={new Date().toISOString().split('T')[0]}
                                                hasError={Boolean(errors.birth_date)}
                                                ariaLabel="Tanggal lahir"
                                                placeholder="Pilih tanggal lahir"
                                            />
                                            {errors.birth_date && <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>}
                                        </div>

                                        {/* Asal Sekolah */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-2">
                                                Asal Sekolah <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="previous_school"
                                                value={formData.previous_school}
                                                onChange={handleChange}
                                                placeholder="Contoh: TK/RA/KB asal"
                                                maxLength={255}
                                                className={`w-full px-4 py-3 bg-surface-muted border ${errors.previous_school ? 'border-red-300' : 'border-line'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-all`}
                                                required
                                            />
                                            {errors.previous_school && <p className="mt-1 text-sm text-red-600">{errors.previous_school}</p>}
                                        </div>

                                        {/* Alamat */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-body mb-2">
                                                Alamat <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Alamat lengkap tempat tinggal"
                                                rows={4}
                                                className={`w-full px-4 py-3 bg-surface-muted border ${errors.address ? 'border-red-300' : 'border-line'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-all resize-none`}
                                                required
                                            />
                                            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Data Orang Tua */}
                                <div className="mb-10">
                                    <h2 className="text-2xl font-bold text-body mb-6 pb-3 border-b-2 border-line">
                                        Data Orang Tua
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Nama Ayah */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-2">
                                                Nama Ayah <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="father_name"
                                                value={formData.father_name}
                                                onChange={handleChange}
                                                placeholder="Nama lengkap ayah"
                                                className={`w-full px-4 py-3 bg-surface-muted border ${errors.father_name ? 'border-red-300' : 'border-line'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-all`}
                                                required
                                            />
                                            {errors.father_name && <p className="mt-1 text-sm text-red-600">{errors.father_name}</p>}
                                        </div>

                                        {/* Nama Ibu */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-2">
                                                Nama Ibu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="mother_name"
                                                value={formData.mother_name}
                                                onChange={handleChange}
                                                placeholder="Nama lengkap ibu"
                                                className={`w-full px-4 py-3 bg-surface-muted border ${errors.mother_name ? 'border-red-300' : 'border-line'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-all`}
                                                required
                                            />
                                            {errors.mother_name && <p className="mt-1 text-sm text-red-600">{errors.mother_name}</p>}
                                        </div>

                                        {/* Nomor Telepon */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-2">
                                                Nomor Telepon <span className="text-red-500">*</span>
                                            </label>
                                        <NumericInput
                                            name="phone"
                                            mode="phone"
                                            maxLength={20}
                                            value={formData.phone}
                                            onChange={(value) =>
                                                setFormData((previous) => ({
                                                    ...previous,
                                                    phone: value,
                                                }))
                                            }
                                            placeholder="Nomor telepon yang dapat dihubungi"
                                            className={`w-full px-4 py-3 bg-surface-muted border ${errors.phone ? 'border-red-300' : 'border-line'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-all`}
                                            ariaLabel="Nomor telepon"
                                        />
                                            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="contact_email"
                                                value={formData.contact_email}
                                                onChange={handleChange}
                                                placeholder="Email yang aktif"
                                                className={`w-full px-4 py-3 bg-surface-muted border ${errors.contact_email ? 'border-red-300' : 'border-line'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-all`}
                                                required
                                            />
                                            {errors.contact_email && <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Dokumen Pendukung */}
                                <div className="mb-10">
                                    <h2 className="text-2xl font-bold text-body mb-6 pb-3 border-b-2 border-line">
                                        Dokumen Pendukung
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Foto */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-4">
                                                <Camera className="w-5 h-5 inline mr-2" />
                                                Foto Calon Murid <span className="text-red-500">*</span>
                                            </label>
                                            <div className="border-2 border-dashed border-line rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-surface-muted hover:bg-blue-50">
                                                <input
                                                    type="file"
                                                    name="photo"
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="photo-upload"
                                                />
                                                <label htmlFor="photo-upload" className="cursor-pointer">
                                                    {previews.photo ? (
                                                        <div className="space-y-3">
                                                            <img
                                                                src={previews.photo}
                                                                alt="Preview Foto"
                                                                className="w-32 h-32 object-cover rounded-lg mx-auto border-2 border-blue-200"
                                                            />
                                                            <p className="text-sm text-green-600 font-medium">
                                                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                                                Foto sudah diunggah
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                                                <Camera className="w-8 h-8 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-muted">Klik untuk mengunggah foto</p>
                                                                <p className="text-xs text-muted mt-1">Format: JPG, PNG (maks. 10MB)</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                            {errors.photo && <p className="mt-2 text-sm text-red-600">{errors.photo}</p>}
                                        </div>

                                        {/* Akte Kelahiran */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-4">
                                                <FileText className="w-5 h-5 inline mr-2" />
                                                Akte Kelahiran <span className="text-red-500">*</span>
                                            </label>
                                            <div className="border-2 border-dashed border-line rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-surface-muted hover:bg-blue-50">
                                                <input
                                                    type="file"
                                                    name="birth_certificate"
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="akte-upload"
                                                />
                                                <label htmlFor="akte-upload" className="cursor-pointer">
                                                    {previews.birth_certificate ? (
                                                        <div className="space-y-3">
                                                            <img
                                                                src={previews.birth_certificate}
                                                                alt="Preview Akte"
                                                                className="w-32 h-32 object-contain mx-auto border-2 border-blue-200 rounded-lg"
                                                            />
                                                            <p className="text-sm text-green-600 font-medium">
                                                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                                                Akte sudah diunggah
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                                                <FileText className="w-8 h-8 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-muted">Klik untuk mengunggah akte</p>
                                                                <p className="text-xs text-muted mt-1">Format: JPG, PNG (maks. 10MB)</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                            {errors.birth_certificate && <p className="mt-2 text-sm text-red-600">{errors.birth_certificate}</p>}
                                        </div>

                                        {/* Kartu Keluarga */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-4">
                                                <FileText className="w-5 h-5 inline mr-2" />
                                                Kartu Keluarga <span className="text-red-500">*</span>
                                            </label>
                                            <div className="border-2 border-dashed border-line rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-surface-muted hover:bg-blue-50">
                                                <input
                                                    type="file"
                                                    name="family_card"
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="kk-upload"
                                                />
                                                <label htmlFor="kk-upload" className="cursor-pointer">
                                                    {previews.family_card ? (
                                                        <div className="space-y-3">
                                                            <img
                                                                src={previews.family_card}
                                                                alt="Preview KK"
                                                                className="w-32 h-32 object-contain mx-auto border-2 border-blue-200 rounded-lg"
                                                            />
                                                            <p className="text-sm text-green-600 font-medium">
                                                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                                                KK sudah diunggah
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                                                <FileText className="w-8 h-8 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-muted">Klik untuk mengunggah KK</p>
                                                                <p className="text-xs text-muted mt-1">Format: JPG, PNG (maks. 10MB)</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                            {errors.family_card && <p className="mt-2 text-sm text-red-600">{errors.family_card}</p>}
                                        </div>

                                        {/* Bukti Pembayaran */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-4">
                                                <FileText className="w-5 h-5 inline mr-2" />
                                                Bukti Pembayaran <span className="text-red-500">*</span>
                                            </label>
                                            <div className="border-2 border-dashed border-line rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-surface-muted hover:bg-blue-50">
                                                <input
                                                    type="file"
                                                    name="payment_proof"
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="payment-upload"
                                                />
                                                <label htmlFor="payment-upload" className="cursor-pointer">
                                                    {previews.payment_proof ? (
                                                        <div className="space-y-3">
                                                            <img
                                                                src={previews.payment_proof}
                                                                alt="Preview Bukti Bayar"
                                                                className="w-32 h-32 object-contain mx-auto border-2 border-blue-200 rounded-lg"
                                                            />
                                                            <p className="text-sm text-green-600 font-medium">
                                                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                                                Bukti bayar sudah diunggah
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                                                <FileText className="w-8 h-8 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-muted">Klik untuk mengunggah bukti</p>
                                                                <p className="text-xs text-muted mt-1">Format: JPG, PNG (maks. 10MB)</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                            {errors.payment_proof && <p className="mt-2 text-sm text-red-600">{errors.payment_proof}</p>}
                                        </div>

                                        {/* Bukti Pindahan - opsional */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-4">
                                                <FileText className="w-5 h-5 inline mr-2" />
                                                Bukti Pindahan <span className="font-normal text-muted">(opsional)</span>
                                            </label>
                                            <div className="border-2 border-dashed border-line rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-surface-muted hover:bg-blue-50">
                                                <input
                                                    type="file"
                                                    name="transfer_proof"
                                                    onChange={handleFileChange}
                                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                    className="hidden"
                                                    id="transfer-upload"
                                                />
                                                <label htmlFor="transfer-upload" className="cursor-pointer">
                                                    {files.transfer_proof ? (
                                                        <div className="space-y-3">
                                                            {previews.transfer_proof ? (
                                                                <img
                                                                    src={previews.transfer_proof}
                                                                    alt="Preview bukti pindahan"
                                                                    className="w-32 h-32 object-contain mx-auto border-2 border-blue-200 rounded-lg"
                                                                />
                                                            ) : (
                                                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                                                    <FileText className="w-8 h-8 text-green-600" />
                                                                </div>
                                                            )}
                                                            <p className="text-sm text-green-600 font-medium break-all">
                                                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                                                {files.transfer_proof.name}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                                                <Upload className="w-8 h-8 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-muted">Klik untuk mengunggah bukti pindahan</p>
                                                                <p className="text-xs text-muted mt-1">JPG, PNG, PDF, DOC, DOCX (maks. 10MB)</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                            {errors.transfer_proof && <p className="mt-2 text-sm text-red-600">{errors.transfer_proof}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Agreement Checkbox */}
                                <div className="mb-8">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            required
                                            className="mt-1 w-5 h-5 text-blue-600 border-line rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-sm text-muted leading-relaxed">
                                            Saya menyatakan bahwa data yang diisi adalah benar dan siap mengikuti aturan yang berlaku di SDI Ibu
                                        </span>
                                    </label>
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        disabled={isSubmitting}
                                        className="px-8 py-3 cursor-pointer border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Reset Form
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5" />
                                                Kirim Pendaftaran
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                )}
                    </>
                )}
            </MainLayout>

            {/* Error Modal */}
            <Modal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                onCancel={() => setShowErrorModal(false)}
                title={errorModalTitle}
                type="danger"
                confirmText="Mengerti"
                onConfirm={() => setShowErrorModal(false)}
            >
                <div className="text-body">
                    <p className="mb-4">{errorModalMessage}</p>
                    <p className="text-sm text-muted">
                        Silakan periksa kembali data yang Anda masukkan dan coba lagi.
                    </p>
                </div>
            </Modal>
        </>
    );
};

export default PendaftaranPage;
