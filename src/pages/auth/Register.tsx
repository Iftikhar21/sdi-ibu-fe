import { useEffect, useState } from "react";
import { CalendarClock, Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";

import WebsiteLogo from '../../components/common/WebsiteLogo';
import ring_home from "@/assets/img/ring_home.svg";
import image_sejarah_2 from '@/assets/img/image_sejarah_2.svg';
import bg_6 from "@/assets/img/bg_6.svg";
import { Helmet } from "react-helmet-async";
import { registrationInformationService, type RegistrationInformation } from "../../services/registrationInformationServices";
import { getApiErrorMessage } from "../../utils/apiError";

interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterData>({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [registrationPhase, setRegistrationPhase] = useState<RegistrationInformation['phase']>('closed');
    const [phaseMessage, setPhaseMessage] = useState<string | null>(null);
    const [phaseLoading, setPhaseLoading] = useState(true);

    useEffect(() => {
        registrationInformationService.getPublic()
            .then((data) => {
                setRegistrationPhase(data.phase);
                setPhaseMessage(data.phase_message);
            })
            .catch((requestError) => console.error('Error fetching registration phase:', requestError))
            .finally(() => setPhaseLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear errors when user starts typing
        if (error) setError(null);
    };

    const validateForm = (): boolean => {
        // Reset previous messages
        setError(null);
        setSuccess(null);

        // Check if all fields are filled
        if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
            setError("Harap lengkapi semua field!");
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Format email tidak valid!");
            return false;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError("Password minimal 6 karakter!");
            return false;
        }

        // Check password match
        if (formData.password !== formData.confirmPassword) {
            setError("Password dan konfirmasi password tidak sama!");
            return false;
        }

        return true;
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await api.post('/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            if (response.data) {
                setSuccess("Registrasi berhasil! Anda akan dialihkan ke halaman login...");

                // Reset form
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: ""
                });

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (err: unknown) {
            console.error("Register error:", err);
            setError(getApiErrorMessage(err, 'Terjadi kesalahan. Silakan coba lagi.'));
        } finally {
            setLoading(false);
        }
    };

    if (phaseLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-muted">Memuat status pendaftaran...</p>
                </div>
            </div>
        );
    }

    if (registrationPhase === 'closed') {
        return (
            <>
                <Helmet><title>Pendaftaran Belum Dibuka | SDI IBU</title></Helmet>
                <div className="flex min-h-screen items-center justify-center bg-surface-muted p-4">
                    <div className="w-full max-w-xl rounded-3xl border border-line bg-surface p-8 text-center shadow-lg md:p-12">
                        <WebsiteLogo className="mx-auto mb-6 h-20 w-auto object-contain" />
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <CalendarClock className="h-8 w-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-body">Pembuatan Akun Belum Dibuka</h1>
                        <p className="mt-4 leading-relaxed text-muted">
                            {phaseMessage || 'Pembuatan akun untuk pendaftaran siswa baru belum dibuka. Silakan pantau halaman pendaftaran untuk informasi berikutnya.'}
                        </p>
                        <Link
                            to="/pendaftaran"
                            className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                            Kembali ke Informasi Pendaftaran
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Daftar Akun | SDI IBU</title>

                <meta
                    name="description"
                    content="Halaman pendaftaran akun SDI Ikhlas Bakti Umat. Daftar untuk mendapatkan akses ke layanan dan informasi pendidikan."
                />

                <meta
                    name="keywords"
                    content="daftar sdi, register sdi ibu, pendaftaran akun sekolah islam"
                />

                <meta name="author" content="SDI Ikhlas Bakti Umat" />

                {/* Open Graph */}
                <meta property="og:title" content="Daftar Akun | SDI IBU" />
                <meta
                    property="og:description"
                    content="Buat akun baru dan bergabung dengan komunitas SDI Ikhlas Bakti Umat."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:image" content="/logo-sdi-ibu.svg" />

                {/* SEO extra */}
                <meta name="robots" content="index, follow" />
            </Helmet>
            
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full overflow-hidden">
                    {/* --- SEKARANG DI KIRI: Register Form --- */}
                    <div className="p-8 md:p-12 flex flex-col justify-center order-2 lg:order-1">
                        <div className="flex justify-center mb-8">
                            <WebsiteLogo className="h-16 w-auto object-contain" />
                        </div>

                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-body mb-2">
                                Buat Akun Baru
                            </h2>
                            <p className="text-muted text-sm">
                                Lengkapi data untuk membuat akun.
                            </p>
                        </div>

                        {/* Success Message */}
                        {success && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                                {success}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-body mb-2">Nama Lengkap</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                                    <input
                                        type="text"
                                        name="name"
                                        className="w-full pl-10 pr-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="Masukkan nama lengkap anda"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={loading}
                                        autoComplete="name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-body mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full pl-10 pr-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="Masukkan email anda"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={loading}
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-body mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="w-full pl-10 pr-12 py-3 border border-line rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="Masukkan password anda (min. 6 karakter)"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-muted hover:text-body disabled:cursor-not-allowed"
                                        disabled={loading}
                                    >
                                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-body mb-2">Konfirmasi Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        className="w-full pl-10 pr-12 py-3 border border-line rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="Konfirmasi password anda"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        disabled={loading}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-muted hover:text-body disabled:cursor-not-allowed"
                                        disabled={loading}
                                    >
                                        {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full cursor-pointer bg-brand hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all shadow-md mt-6 flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Mendaftarkan...
                                    </>
                                ) : (
                                    "Sign Up"
                                )}
                            </button>

                            <p className="text-center text-sm text-muted mt-6">
                                Sudah memiliki akun?{' '}
                                <Link to="/login" className="text-brand hover:text-blue-700 font-semibold">
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    </div>

                    {/* --- SEKARANG DI KANAN: Branding/Image --- */}
                    <div className="relative bg-gradient-to-b from-brand to-[#001E47] p-12 flex flex-col justify-center items-center text-white order-1 lg:order-2 rounded-3xl overflow-hidden">
                        <img
                            src={bg_6}
                            alt="Background"
                            className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
                        />

                        <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px]">
                            <img
                                src={ring_home}
                                alt="Ring Frame"
                                className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
                            />
                            <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
                                <img
                                    src={image_sejarah_2}
                                    alt="SDI Students"
                                    className="w-[88%] h-[88%] object-cover"
                                    style={{ clipPath: "polygon(50% 0%, 65% 15%, 85% 15%, 85% 35%, 100% 50%, 85% 65%, 85% 85%, 65% 85%, 50% 100%, 35% 85%, 15% 85%, 15% 65%, 0% 50%, 15% 35%, 15% 15%, 35% 15%)" }}
                                />
                            </div>
                        </div>

                        <div className="relative z-10 mt-10 text-center lg:text-right w-full">
                            <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                                Membentuk Generasi Islami Sejak Dini
                            </h1>
                            <p className="text-sm leading-tight opacity-90">
                                Bergabunglah dengan komunitas SDI Ikhlas Bakti Umat untuk mendapatkan akses ke informasi dan layanan pendidikan terbaik.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
