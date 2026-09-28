import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import logo_sdi from "@/assets/img/logo-sdi-ibu.svg";
import ring_home from "@/assets/img/ring_home.svg";
import bg_6 from "@/assets/img/bg_6.svg";
import bg_1 from "@/assets/img/bg_1.svg";
import { Helmet } from "react-helmet-async";

export default function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) {
            // Wajib ganti password (akun guru baru) -> arahkan ke halaman ganti password
            if (user.must_change_password) {
                navigate("/ganti-password", { replace: true });
                return;
            }

            const redirectPath =
                user.role.role_name === "admin"
                    ? "/admin/dashboard"
                    : user.role.role_name === "guru"
                      ? "/guru/dashboard"
                      : "/user/dashboard";

            navigate(redirectPath, { replace: true });
        }
    }, [user, navigate]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(email, password);

            // Setelah login sukses, tunggu sejenak untuk state update
            setTimeout(() => {
                const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

                if (storedUser?.must_change_password) {
                    navigate("/ganti-password", { replace: true });
                } else if (storedUser?.role?.role_name === "admin") {
                    navigate("/admin/dashboard", { replace: true });
                } else if (storedUser?.role?.role_name === "guru") {
                    navigate("/guru/dashboard", { replace: true });
                } else if (storedUser?.role?.role_name === "user") {
                    navigate("/user/dashboard", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            }, 100); // Tunggu 100ms untuk state update

        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "Login gagal, silakan coba lagi."
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <Helmet>
                <title>Login | SDI IBU</title>

                <meta
                    name="description"
                    content="Halaman login SDI IBU. Masuk ke akun Anda untuk mengakses dashboard admin atau pengguna."
                />

                <meta name="keywords" content="login sdi, login sekolah islam, sdi ibu" />
                <meta name="author" content="SDI IBU" />

                {/* Open Graph */}
                <meta property="og:title" content="Login | SDI IBU" />
                <meta
                    property="og:description"
                    content="Masuk ke akun Anda untuk mengakses sistem SDI IBU."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:image" content="/logo-sdi-ibu.svg" />

                {/* Mobile */}
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Helmet>

            <div className="min-h-screen flex items-center justify-center bg-surface-muted p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full overflow-hidden">
                    {/* Left Side - Branding */}
                    <div className="relative bg-gradient-to-b from-brand to-[#001E47] p-12 flex flex-col justify-center items-center text-white rounded-3xl">
                        {/* Background Decorative Image */}
                        <img
                            src={bg_6}
                            alt="Background"
                            className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
                        />

                        {/* Star Frame with Image */}
                        <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px]">
                            {/* Ring / Frame SVG */}
                            <img
                                src={ring_home}
                                alt="Ring Frame"
                                className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
                            />

                            {/* Gambar Murid dengan clip-path */}
                            <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
                                <img
                                    src={bg_1}
                                    alt="SDI Students"
                                    className="w-[88%] h-[88%] object-cover"
                                    style={{ clipPath: "polygon(50% 0%, 65% 15%, 85% 15%, 85% 35%, 100% 50%, 85% 65%, 85% 85%, 65% 85%, 50% 100%, 35% 85%, 15% 85%, 15% 65%, 0% 50%, 15% 35%, 15% 15%, 35% 15%)" }}
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-start mt-10 mb-4 leading-tight">
                            Membentuk Generasi Islami Sejak Dini
                        </h1>
                        <p className="text-sm text-start leading-tight">
                            Pendidikan berkualitas dengan nilai-nilai Islam untuk membentuk karakter anak yang berakhlak mulia
                        </p>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                        {/* Logo */}
                        <div className="flex justify-center mb-8">
                            <img src={logo_sdi} alt="Logo SDI" className="h-16 w-auto" />
                        </div>

                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-body mb-2">
                                Masuk ke Akun Anda
                            </h2>
                            <p className="text-muted text-sm">
                                Silakan masuk ke akun Anda untuk<br />melanjutkan
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-body mb-2">
                                    Email atau Username
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Masukkan email Anda"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-body mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full pl-10 pr-12 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Masukkan password Anda"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-muted"
                                    >
                                        {showPassword ? (
                                            <Eye className="w-5 h-5" />
                                        ) : (
                                            <EyeOff className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex items-center justify-center gap-2
                                        bg-brand text-white font-semibold py-3 rounded-lg
                                        transition-colors duration-200 shadow-md
                                        ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}
                                    `}
                            >
                                {loading && (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                )}

                                {loading ? "Signing in..." : "Sign In"}
                            </button>

                            {/* Sign Up Link */}
                            <p className="text-center text-sm text-muted mt-6">
                                Belum memiliki akun?{' '}
                                <Link to="/register" className="text-brand hover:text-blue-700 font-semibold">
                                    Sign Up
                                </Link>
                            </p>

                            <p className="text-center text-sm text-muted mt-6">
                                Ingin kembali ke beranda?{' '}
                                <Link to="/" className="text-brand hover:text-blue-700 font-semibold">
                                    Beranda
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>

    );
}
