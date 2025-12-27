import { useState, useRef, useEffect } from 'react';
import { Save, Loader2, Upload, Image as ImageIcon, X, Plus, Trash2, Building, MapPin, Phone, Mail, Globe, FileText } from 'lucide-react';

interface Props {
    title: string;
    initialData?: {
        logo?: string;
        logo_url?: string;
        deskripsi?: string;
        alamat?: string;
        telepon?: string;
        email?: string;
        map_embed?: string;
        socials?: Array<{ platform: string; url: string }>;
    };
    onSubmit: (data: {
        logo?: File | null;
        deskripsi?: string;
        alamat?: string;
        telepon?: string;
        email?: string;
        map_embed?: string;
        socials?: Array<{ platform: string; url: string }>;
    }) => void;
    loading?: boolean;
}

export default function ContactForm({
    title,
    initialData = {
        deskripsi: '',
        alamat: '',
        telepon: '',
        email: '',
        map_embed: '',
        socials: []
    },
    onSubmit,
    loading,
}: Props) {
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logo_url || null);
    const [deskripsi, setDeskripsi] = useState(initialData.deskripsi || '');
    const [alamat, setAlamat] = useState(initialData.alamat || '');
    const [telepon, setTelepon] = useState(initialData.telepon || '');
    const [email, setEmail] = useState(initialData.email || '');
    const [mapEmbed, setMapEmbed] = useState(initialData.map_embed || '');
    const [socials, setSocials] = useState<Array<{ platform: string; url: string }>>(
        initialData.socials || []
    );
    const [newSocialPlatform, setNewSocialPlatform] = useState('');
    const [newSocialUrl, setNewSocialUrl] = useState('');

    const logoRef = useRef<HTMLInputElement>(null);

    // Handle logo upload
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (logoRef.current) {
            logoRef.current.value = '';
        }
    };

    // Handle social media
    const addSocial = () => {
        if (newSocialPlatform.trim() && newSocialUrl.trim()) {
            setSocials([...socials, { platform: newSocialPlatform.trim(), url: newSocialUrl.trim() }]);
            setNewSocialPlatform('');
            setNewSocialUrl('');
        }
    };

    const removeSocial = (index: number) => {
        setSocials(socials.filter((_, i) => i !== index));
    };

    // GANTI handleSubmit function dengan ini:
    // Di ContactForm.tsx - handleSubmit function
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Debug: Tampilkan data yang akan dikirim
        console.log('Socials to submit:', socials);
        console.log('Total socials:', socials.length);

        // Pastikan semua field memiliki nilai
        const payload = {
            deskripsi: deskripsi || '', // String kosong jika tidak diisi
            alamat: alamat || '',
            telepon: telepon || '',
            email: email || '',
            map_embed: mapEmbed || '',
            socials: socials, // Socials array (bisa kosong)
            logo: logoFile || undefined // undefined jika tidak ada file baru
        };

        console.log('Payload sebelum submit:', payload);
        onSubmit(payload);
    };

    // Clean up object URLs
    useEffect(() => {
        return () => {
            if (logoPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    // Tambahkan useEffect setelah state declarations
    // Di ContactForm.tsx - tambahkan useEffect yang lebih baik
    useEffect(() => {
        // hanya set preview dari server JIKA belum upload file
        if (!logoFile) {
            setLogoPreview(initialData?.logo_url || null);
        }

        setDeskripsi(initialData?.deskripsi || '');
        setAlamat(initialData?.alamat || '');
        setTelepon(initialData?.telepon || '');
        setEmail(initialData?.email || '');
        setMapEmbed(initialData?.map_embed || '');
        setSocials(initialData?.socials || []);
    }, [
        initialData?.logo_url,
        initialData?.deskripsi,
        initialData?.alamat,
        initialData?.telepon,
        initialData?.email,
        initialData?.map_embed,
        JSON.stringify(initialData?.socials),
    ]);

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form Header */}
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                <p className="text-gray-600 mt-2">
                    Isi informasi kontak dengan lengkap dan akurat
                </p>
            </div>

            {/* Logo Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                        <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Logo Organisasi
                    </div>
                </label>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {logoPreview ? (
                        <div className="relative">
                            <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="w-full h-full object-contain p-2"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={removeLogo}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50">
                            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500">No Logo</span>
                        </div>
                    )}
                    <div>
                        <label className="cursor-pointer">
                            <div className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                                <Upload className="w-4 h-4 mr-2" />
                                {logoPreview ? 'Ganti Logo' : 'Upload Logo'}
                            </div>
                            <input
                                ref={logoRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoChange}
                            />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                            Ukuran maksimal 2MB. Format: JPG, PNG, WebP
                        </p>
                    </div>
                </div>
            </div>

            {/* Deskripsi */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        Deskripsi Singkat
                    </div>
                </label>
                <textarea
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-sm hover:border-gray-400"
                    placeholder="Deskripsi singkat tentang organisasi..."
                />
            </div>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Alamat */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                            Alamat
                        </div>
                    </label>
                    <textarea
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-sm hover:border-gray-400"
                        placeholder="Alamat lengkap..."
                    />
                </div>

                {/* Telepon & Email */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center">
                                <Phone className="w-5 h-5 mr-2 text-blue-600" />
                                Telepon
                            </div>
                        </label>
                        <input
                            type="text"
                            value={telepon}
                            onChange={(e) => setTelepon(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-400"
                            placeholder="Nomor telepon..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center">
                                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                                Email
                            </div>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-400"
                            placeholder="Alamat email..."
                        />
                    </div>
                </div>
            </div>

            {/* Map Embed */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                        Embed Peta (Google Maps)
                    </div>
                </label>
                <textarea
                    value={mapEmbed}
                    onChange={(e) => setMapEmbed(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-sm hover:border-gray-400 font-mono text-sm"
                    placeholder='<iframe src="https://www.google.com/maps/embed?..."></iframe>'
                />
                <p className="text-xs text-gray-500 mt-2">
                    Tempel kode embed dari Google Maps
                </p>
            </div>

            {/* Social Media */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    <div className="flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-blue-600" />
                        Media Sosial (Opsional)
                        <span className="ml-2 text-xs font-normal text-gray-500">
                            {socials.length} media sosial ditambahkan
                        </span>
                    </div>
                </label>

                {/* Existing Socials */}
                {socials.length > 0 ? (
                    <div className="space-y-3 mb-4">
                        {socials.map((social, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-800">{social.platform}</div>
                                        <div className="text-xs text-gray-600 truncate max-w-xs">{social.url}</div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeSocial(index)}
                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                        <p className="text-sm text-gray-500">Belum ada media sosial ditambahkan</p>
                    </div>
                )}

                {/* Add New Social */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <input
                            type="text"
                            value={newSocialPlatform}
                            onChange={(e) => setNewSocialPlatform(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-400"
                            placeholder="Platform (e.g., Instagram)"
                            onKeyPress={(e) => e.key === 'Enter' && addSocial()}
                        />
                    </div>
                    <div>
                        <input
                            type="url"
                            value={newSocialUrl}
                            onChange={(e) => setNewSocialUrl(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-400"
                            placeholder="URL (e.g., https://instagram.com/...)"
                            onKeyPress={(e) => e.key === 'Enter' && addSocial()}
                        />
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={addSocial}
                            disabled={!newSocialPlatform.trim() || !newSocialUrl.trim()}
                            className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 inline-flex items-center justify-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Media Sosial
                        </button>
                    </div>
                </div>
                <p className="text-xs text-gray-500">
                    Contoh: Instagram, Facebook, Twitter, YouTube, LinkedIn, dll.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 shadow-sm"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Simpan Kontak
                        </>
                    )}
                </button>
            </div>

            {/* Info Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start">
                    <Building className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-1">
                            Informasi Kontak
                        </h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Hanya dapat memiliki 1 informasi kontak aktif</li>
                            <li>• Semua informasi akan ditampilkan di halaman kontak website</li>
                            <li>• Logo akan muncul di header/footer website</li>
                            <li>• Map embed harus dari Google Maps</li>
                        </ul>
                    </div>
                </div>
            </div>
        </form>
    );
}