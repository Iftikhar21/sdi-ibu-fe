import { useState, useEffect } from 'react';
import { Save, Loader2, Eye, EyeOff } from 'lucide-react';
import SearchableSelect from '../../../components/common/SearchableSelect';

interface Props {
    title: string;
    initialData?: {
        name: string;
        email: string;
        role: string;
    };
    onSubmit: (data: {
        name: string;
        email: string;
        password?: string;
        role: string;
    }) => void;
    loading?: boolean;
    isEdit?: boolean;
}

export default function UserForm({
    title,
    initialData,
    onSubmit,
    loading,
    isEdit = false
}: Props) {

    const safeInitialData = initialData ?? {
        name: '',
        email: '',
        role: 'user'
    };

    const [formData, setFormData] = useState({
        name: safeInitialData.name,
        email: safeInitialData.email,
        password: '',
        role: safeInitialData.role,
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!initialData) return;

        setFormData({
            name: initialData.name,
            email: initialData.email,
            password: '',
            role: initialData.role,
            confirmPassword: ''
        });
    }, [initialData]);


    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nama wajib diisi';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email tidak valid';
        }

        if (!isEdit && !formData.password) {
            newErrors.password = 'Password wajib diisi';
        } else if (!isEdit && formData.password.length < 6) {
            newErrors.password = 'Password minimal 6 karakter';
        }

        if (!isEdit && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Password tidak cocok';
        }

        if (!formData.role) {
            newErrors.role = 'Role wajib dipilih';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitData: any = {
            name: formData.name,
            email: formData.email,
            role: formData.role
        };

        if (!isEdit || formData.password) {
            submitData.password = formData.password;
        }

        await onSubmit(submitData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama */}
                <div>
                    <label className="block text-sm font-medium text-body mb-2">
                        Nama Lengkap
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.name ? 'border-red-300' : 'border-line'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-400`}
                        placeholder="Masukkan nama lengkap"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-body mb-2">
                        Email
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-line'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-400`}
                        placeholder="contoh@email.com"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                {/* Password - hanya untuk create atau jika mau ganti password */}
                {!isEdit ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-body mb-2">
                                Password
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${errors.password ? 'border-red-300' : 'border-line'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-400`}
                                    placeholder="Minimal 6 karakter"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-muted hover:text-muted"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-body mb-2">
                                Konfirmasi Password
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-line'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-400`}
                                    placeholder="Ulangi password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-muted hover:text-muted"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </>
                ) : (
                    // Password update untuk edit (opsional)
                    <div>
                        <label className="block text-sm font-medium text-body mb-2">
                            Password Baru (Opsional)
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-400`}
                                placeholder="Kosongkan jika tidak ingin mengubah"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-muted hover:text-muted"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-muted">Isi hanya jika ingin mengubah password</p>
                    </div>
                )}

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-body mb-2">
                        Role
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <SearchableSelect
                        options={[
                            { value: 'admin', label: 'Admin', description: 'Akses penuh ke panel admin' },
                            { value: 'user', label: 'User', description: 'Portal pengguna / orang tua' },
                        ]}
                        value={formData.role}
                        onChange={(value) => {
                            setFormData((previous) => ({ ...previous, role: String(value) }));
                            setErrors((previous) => ({ ...previous, role: '' }));
                        }}
                        placeholder="Pilih Role"
                        searchPlaceholder="Cari role..."
                        ariaLabel="Role pengguna"
                    />
                    {errors.role && (
                        <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-line">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-5 py-2.5 text-sm font-medium text-body bg-surface border border-line rounded-lg hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {isEdit ? 'Simpan Perubahan' : 'Tambah User'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
