// pages/user/profile/userProfile.tsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    User as UserIcon,
    Mail,
    Phone,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    X,
    Edit2,
    Calendar,
    Shield,
    Key,
    Eye,
    EyeOff
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import { useAuth } from '../../../auth/AuthContext';
import { userService } from '../../../services/userServices';
import { Helmet } from 'react-helmet-async';

interface ProfileData {
    name: string;
    email: string;
    password?: string;
    phone?: string;
}

export default function UserProfile() {
    const { user: authUser, login } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const location = useLocation();
    const navigate = useNavigate();

    // Form state sesuai dengan controller
    const [formData, setFormData] = useState<ProfileData>({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

    // Cek URL parameters untuk success message
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const message = params.get('message');
        const success = params.get('success') === 'true';

        if (success && message) {
            setSuccessMessage(message);
            navigate('/user/profil', { replace: true });

            // Auto-hide success message setelah 5 detik
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [location, navigate]);

    // Fetch profile data
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await userService.getProfile();

            if (response.success && response.data) {
                const { user, user_detail } = response.data;

                // Set form data sesuai response dari controller
                setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    password: '', // Password selalu kosong saat load
                    phone: user_detail?.phone || ''
                });
            } else {
                setErrorMessage(response.message || 'Gagal memuat data profil');
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            setErrorMessage(error.response?.data?.message || 'Gagal memuat data profil');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            setErrorMessage('Nama tidak boleh kosong');
            return;
        }

        if (!formData.email.trim()) {
            setErrorMessage('Email tidak boleh kosong');
            return;
        }

        if (formData.password && formData.password.length < 6) {
            setErrorMessage('Password minimal 6 karakter');
            return;
        }

        setSaving(true);
        setErrorMessage('');

        try {
            // Prepare data sesuai controller
            const updateData: any = {
                name: formData.name,
                email: formData.email,
            };

            // Hanya kirim password jika diisi
            if (formData.password && formData.password.trim()) {
                updateData.password = formData.password;
            }

            // Hanya kirim phone jika diisi
            if (formData.phone && formData.phone.trim()) {
                updateData.phone = formData.phone;
            }

            const response = await userService.updateProfile(updateData);

            if (response.success) {
                setSuccessMessage(response.message || 'Profil berhasil diperbarui');

                // Jika password diubah, re-login untuk refresh token
                if (formData.password) {
                    try {
                        // Coba login dengan password baru
                        await login(formData.email, formData.password);
                    } catch (loginError) {
                        // Jika gagal login, tetap tampilkan success message
                        console.log('Password changed, but auto-login failed');
                    }
                    // Clear password field setelah berhasil update
                    setFormData(prev => ({ ...prev, password: '' }));
                }

                // Refresh data
                fetchProfile();

                // Auto hide success message
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setErrorMessage(response.message || 'Gagal memperbarui profil');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            setErrorMessage(
                error.response?.data?.message ||
                'Gagal memperbarui profil. Silakan coba lagi.'
            );
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return '-';
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return (
        <>
            <Helmet>
                <title>User Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Profil Saya">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                            Profil Saya
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Kelola informasi akun Anda
                        </p>
                    </div>
                </div>

                {/* Success Message Banner */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                            <span className="text-green-800">{successMessage}</span>
                        </div>
                        <button
                            onClick={() => setSuccessMessage('')}
                            className="text-green-600 hover:text-green-800"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Error Message Banner */}
                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                        <span className="text-red-800">{errorMessage}</span>
                    </div>
                )}

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    {/* Avatar */}
                                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                                        <span className="text-white text-4xl font-bold">
                                            {authUser?.name?.charAt(0).toUpperCase() || 'A'}
                                        </span>
                                    </div>

                                    {/* Name & Role */}
                                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                                        {authUser?.name || 'Pengguna'}
                                    </h2>
                                    <div className="inline-flex items-center px-3 py-1 mb-4 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        <Shield className="w-3 h-3 mr-2" />
                                        Pengguna
                                    </div>
                                </div>
                            </div>

                            {/* Account Info */}
                            <div className="border-t border-gray-200 p-6 bg-gray-50">
                                <h3 className="font-semibold text-gray-800 mb-4">Informasi Akun</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm">
                                        <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700 truncate">{authUser?.email}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            ID: {authUser?.id || '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            {formData.phone || 'Belum diisi'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-800 mb-4">Informasi Penting</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-xs font-medium text-blue-800 mb-1">Nama</p>
                                    <p className="text-sm text-gray-700">{formData.name}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs font-medium text-gray-800 mb-1">Email</p>
                                    <p className="text-sm text-gray-700">{formData.email}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs font-medium text-gray-800 mb-1">Telepon</p>
                                    <p className="text-sm text-gray-700">{formData.phone || 'Belum diisi'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Edit Form */}
                    <div className="lg:col-span-2">
                        {/* Profile Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    <Edit2 className="w-5 h-5 inline mr-2 text-blue-600" />
                                    Edit Informasi Profil
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Perbarui informasi akun Anda
                                </p>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                                    <p className="text-gray-600">Memuat data profil...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="space-y-6">
                                        {/* Nama & Email */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nama Lengkap
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <div className="relative">
                                                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Nama lengkap"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="email@example.com"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Password Baru
                                                <span className="text-gray-500 ml-2 text-xs font-normal">
                                                    (Kosongkan jika tidak ingin mengubah)
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Masukkan password baru"
                                                    minLength={6}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Minimal 6 karakter
                                            </p>
                                        </div>

                                        {/* Telepon */}
                                        <div className="max-w-md">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nomor Telepon
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="08xxxxxxxxxx"
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Opsional
                                            </p>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex justify-end pt-6 border-t border-gray-200">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Simpan Perubahan
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}