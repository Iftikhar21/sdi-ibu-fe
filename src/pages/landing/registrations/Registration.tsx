import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, FileText, CheckCircle, AlertCircle, Users, X } from 'lucide-react';
import MainLayout from "../../../components/layout/landing/MainLayout";
import { registrationService } from '../../../services/registrationServices';
import Modal from '../../../components/common/Modal';

const PendaftaranPage = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState('');

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
    });

    const [previews, setPreviews] = useState({
        photo: '',
        birth_certificate: '',
        family_card: '',
        payment_proof: '',
    });

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

            // Reset form
            handleReset();

            // Show success message
            setSuccessMessage(`Pendaftaran untuk ${formData.full_name} berhasil dikirim! Status dapat dilihat di dashboard.`);

        } catch (error: any) {
            console.error('Error submitting registration:', error);

            let errorMessage = 'Gagal mengirim pendaftaran. Silakan coba lagi.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                // Handle Laravel validation errors
                const validationErrors = error.response.data.errors;
                const firstError = Object.values(validationErrors)[0];
                errorMessage = Array.isArray(firstError) ? firstError[0] : 'Terjadi kesalahan validasi';
            }

            // Ganti alert dengan modal
            showError('Gagal Mengirim Pendaftaran', errorMessage);
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
        });

        setPreviews({
            photo: '',
            birth_certificate: '',
            family_card: '',
            payment_proof: '',
        });

        setErrors({});
    };

    return (
        <>
            <MainLayout>
                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 py-16 overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center text-white">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                Pendaftaran Peserta Didik Baru
                            </h1>
                            <p className="text-blue-100 text-lg">
                                Silakan lengkapi formulir di bawah ini dengan data yang benar dan valid.
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
                                    <span className="text-green-800">{successMessage}</span>
                                </div>
                                <button
                                    onClick={() => setSuccessMessage('')}
                                    className="text-green-600 hover:text-green-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Section */}
                <div className="container mx-auto px-4 py-12">
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

                        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                            {/* Badge */}
                            <div className="inline-block bg-blue-100 text-blue-600 px-5 py-2 rounded-full text-sm font-medium mb-8">
                                Form Pendaftaran
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Data Calon Murid */}
                                <div className="mb-10">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
                                        Data Calon Murid
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Nama Lengkap */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nama Lengkap <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                placeholder="Masukkan nama lengkap sesuai akte"
                                                className={`w-full px-4 py-3 bg-gray-50 border ${errors.full_name ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`}
                                                required
                                            />
                                            {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
                                        </div>

                                        {/* Nama Panggilan */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nama Panggilan <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="nickname"
                                                value={formData.nickname}
                                                onChange={handleChange}
                                                placeholder="Nama yang biasa dipanggil"
                                                className={`w-full px-4 py-3 bg-gray-50 border ${errors.nickname ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`}
                                                required
                                            />
                                            {errors.nickname && <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>}
                                        </div>

                                        {/* Jenis Kelamin */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Jenis Kelamin <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 bg-gray-50 border ${errors.gender ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer`}
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
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tempat Lahir <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="birth_place"
                                                value={formData.birth_place}
                                                onChange={handleChange}
                                                placeholder="Kota kelahiran"
                                                className={`w-full px-4 py-3 bg-gray-50 border ${errors.birth_place ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`}
                                                required
                                            />
                                            {errors.birth_place && <p className="mt-1 text-sm text-red-600">{errors.birth_place}</p>}
                                        </div>

                                        {/* Tanggal Lahir */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tanggal Lahir <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                name="birth_date"
                                                value={formData.birth_date}
                                                onChange={handleChange}
                                                placeholder="dd/mm/yyyy"
                                                max={new Date().toISOString().split('T')[0]}
                                                className={`w-full px-4 py-3 bg-gray-50 border ${errors.birth_date ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`}
                                                required
                                            />
                                            {errors.birth_date && <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>}
                                        </div>

                                        {/* Alamat */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Alamat <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Alamat lengkap tempat tinggal"
                                                rows={4}
                                                className={`w-full px-4 py-3 bg-gray-50 border ${errors.address ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none`}
                                                required
                                            />
                                            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Data Orang Tua */}
                                <div className="mb-10">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
                                        Data Orang Tua
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Nama Ayah */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nama Ayah <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="father_name"
                                                value={formData.father_name}
                                                onChange={handleChange}
                                                placeholder="Nama lengkap ayah"
                                                className={`w-full px-4 py-3 bg-gray-50 border ${errors.father_name ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`}
                                                required
                                            />
                                            {errors.father_name && <p className="mt-1 text-sm text-red-600">{errors.father_name}</p>}
                                        </div>

                                        {/* Nama Ibu */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nama Ibu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="mother_name"
                                                value={formData.mother_name}
                                                onChange={handleChange}
                                                placeholder="Nama lengkap ibu"
                                                className={`w-full px-4 py-3 bg-gray-50 border ${errors.mother_name ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`}
                                                required
                                            />
                                            {errors.mother_name && <p className="mt-1 text-sm text-red-600">{errors.mother_name}</p>}
                                        </div>

                                        {/* Nomor Telepon */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nomor Telepon <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Nomor telepon yang dapat dihubungi"
                                                className={`w-full px-4 py-3 bg-gray-50 border ${errors.phone ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`}
                                                required
                                            />
                                            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="contact_email"
                                                value={formData.contact_email}
                                                onChange={handleChange}
                                                placeholder="Email yang aktif"
                                                className={`w-full px-4 py-3 bg-gray-50 border ${errors.contact_email ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`}
                                                required
                                            />
                                            {errors.contact_email && <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Dokumen Pendukung */}
                                <div className="mb-10">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
                                        Dokumen Pendukung
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Foto */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                                <Camera className="w-5 h-5 inline mr-2" />
                                                Foto Calon Murid <span className="text-red-500">*</span>
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50">
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
                                                                <p className="text-gray-600">Klik untuk mengunggah foto</p>
                                                                <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (maks. 10MB)</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                            {errors.photo && <p className="mt-2 text-sm text-red-600">{errors.photo}</p>}
                                        </div>

                                        {/* Akte Kelahiran */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                                <FileText className="w-5 h-5 inline mr-2" />
                                                Akte Kelahiran <span className="text-red-500">*</span>
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50">
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
                                                                <p className="text-gray-600">Klik untuk mengunggah akte</p>
                                                                <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (maks. 10MB)</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                            {errors.birth_certificate && <p className="mt-2 text-sm text-red-600">{errors.birth_certificate}</p>}
                                        </div>

                                        {/* Kartu Keluarga */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                                <FileText className="w-5 h-5 inline mr-2" />
                                                Kartu Keluarga <span className="text-red-500">*</span>
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50">
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
                                                                <p className="text-gray-600">Klik untuk mengunggah KK</p>
                                                                <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (maks. 10MB)</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                            {errors.family_card && <p className="mt-2 text-sm text-red-600">{errors.family_card}</p>}
                                        </div>

                                        {/* Bukti Pembayaran */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                                <FileText className="w-5 h-5 inline mr-2" />
                                                Bukti Pembayaran <span className="text-red-500">*</span>
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50">
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
                                                                <p className="text-gray-600">Klik untuk mengunggah bukti</p>
                                                                <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (maks. 10MB)</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                            {errors.payment_proof && <p className="mt-2 text-sm text-red-600">{errors.payment_proof}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Agreement Checkbox */}
                                <div className="mb-8">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            required
                                            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600 leading-relaxed">
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
                                        className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Reset Form
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <div className="text-gray-700">
                    <p className="mb-4">{errorModalMessage}</p>
                    <p className="text-sm text-gray-500">
                        Silakan periksa kembali data yang Anda masukkan dan coba lagi.
                    </p>
                </div>
            </Modal>
        </>
    );
};

export default PendaftaranPage;