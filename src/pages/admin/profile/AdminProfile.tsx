// pages/admin/profile/AdminProfile.tsx
import { useEffect, useState } from 'react';
import {
    User as UserIcon,
    Mail,
    Phone,
    Save,
    Loader2,
    Edit2,
    Calendar,
    Shield,
    Key,
    Eye,
    EyeOff
} from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import { useAuth } from '../../../auth/AuthContext';
import { adminService } from '../../../services/adminServices';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

interface ProfileData {
    name: string;
    email: string;
    password?: string;
    phone?: string;
}

export default function AdminProfile() {
    const { user: authUser, login } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form state sesuai dengan controller
    const [formData, setFormData] = useState<ProfileData>({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

    // Fetch profile data
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await adminService.getProfile();

            if (response.success && response.data) {
                const { user, admin } = response.data;

                // Set form data sesuai response dari controller
                setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    password: '', // Password selalu kosong saat load
                    phone: admin?.phone || ''
                });
            } else {
                toast.error('Gagal memuat data profil', response.message);
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            toast.error('Gagal memuat data profil', getApiErrorMessage(error, 'silakan coba lagi'));
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
            toast.warning('Nama tidak boleh kosong');
            return;
        }

        if (!formData.email.trim()) {
            toast.warning('Email tidak boleh kosong');
            return;
        }

        if (formData.password && formData.password.length < 6) {
            toast.warning('Password minimal 6 karakter');
            return;
        }

        setSaving(true);

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

            const response = await adminService.updateProfile(updateData);

            if (response.success) {
                toast.success(response.message || 'Profil berhasil diperbarui');

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
            } else {
                toast.error('Gagal memperbarui profil', response.message);
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error('Gagal memperbarui profil', getApiErrorMessage(error, 'silakan coba lagi'));
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
                <title>Admin Dashboard | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Profil Admin">
                {/* Header Dashboard Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-xl shadow-sm p-6 mb-6">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-body mb-2">
                            Profil Administrator
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            Kelola informasi akun Anda
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Info Card */}
                        <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    {/* Avatar */}
                                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                                        <span className="text-white text-4xl font-bold">
                                            {authUser?.name?.charAt(0).toUpperCase() || 'A'}
                                        </span>
                                    </div>

                                    {/* Name & Role */}
                                    <h2 className="text-xl font-bold text-body mb-1">
                                        {authUser?.name || 'Administrator'}
                                    </h2>
                                    <div className="inline-flex items-center px-3 py-1 mb-4 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        <Shield className="w-3 h-3 mr-2" />
                                        Administrator
                                    </div>
                                </div>
                            </div>

                            {/* Account Info */}
                            <div className="border-t border-line p-6 bg-surface-muted">
                                <h3 className="font-semibold text-body mb-4">Informasi Akun</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm">
                                        <Mail className="w-4 h-4 text-muted mr-3 flex-shrink-0" />
                                        <span className="text-body truncate">{authUser?.email}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Calendar className="w-4 h-4 text-muted mr-3 flex-shrink-0" />
                                        <span className="text-body">
                                            ID: {authUser?.id || '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Phone className="w-4 h-4 text-muted mr-3 flex-shrink-0" />
                                        <span className="text-body">
                                            {formData.phone || 'Belum diisi'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="bg-surface rounded-xl shadow-sm border border-line p-6">
                            <h3 className="font-semibold text-body mb-4">Informasi Penting</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-xs font-medium text-blue-800 mb-1">Nama</p>
                                    <p className="text-sm text-body">{formData.name}</p>
                                </div>
                                <div className="p-3 bg-surface-muted rounded-lg">
                                    <p className="text-xs font-medium text-body mb-1">Email</p>
                                    <p className="text-sm text-body">{formData.email}</p>
                                </div>
                                <div className="p-3 bg-surface-muted rounded-lg">
                                    <p className="text-xs font-medium text-body mb-1">Telepon</p>
                                    <p className="text-sm text-body">{formData.phone || 'Belum diisi'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Edit Form */}
                    <div className="lg:col-span-2">
                        {/* Profile Form */}
                        <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
                            <div className="p-6 border-b border-line">
                                <h3 className="text-lg font-semibold text-body">
                                    <Edit2 className="w-5 h-5 inline mr-2 text-blue-600" />
                                    Edit Informasi Profil
                                </h3>
                                <p className="text-sm text-muted mt-1">
                                    Perbarui informasi akun Anda
                                </p>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                                    <p className="text-muted">Memuat data profil...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="space-y-6">
                                        {/* Nama & Email */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-body mb-2">
                                                    Nama Lengkap
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <div className="relative">
                                                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-2.5 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Nama lengkap"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-body mb-2">
                                                    Email
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-2.5 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="email@example.com"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-body mb-2">
                                                Password Baru
                                                <span className="text-muted ml-2 text-xs font-normal">
                                                    (Kosongkan jika tidak ingin mengubah)
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-10 py-2.5 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Masukkan password baru"
                                                    minLength={6}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-muted"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="mt-1 text-xs text-muted">
                                                Minimal 6 karakter
                                            </p>
                                        </div>

                                        {/* Telepon */}
                                        <div className="max-w-md">
                                            <label className="block text-sm font-medium text-body mb-2">
                                                Nomor Telepon
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="08xxxxxxxxxx"
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-muted">
                                                Opsional
                                            </p>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex justify-end pt-6 border-t border-line">
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
