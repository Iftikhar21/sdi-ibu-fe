import {
    AlertCircle,
    ArrowLeft,
    FileQuestion,
    Home,
    LogIn,
    RefreshCw,
    ServerCrash,
    ShieldAlert,
} from 'lucide-react';

interface ErrorContent {
    title: string;
    description: string;
    icon: React.ElementType;
    iconClass: string;
    badgeClass: string;
    showLoginButton?: boolean;
    showReloadButton?: boolean;
}

const errorContents: Record<string, ErrorContent> = {
    '400': {
        title: 'Permintaan Tidak Valid',
        description:
            'Data yang dikirim tidak dapat diproses oleh server. Silakan kembali dan ulangi dari halaman sebelumnya.',
        icon: AlertCircle,
        iconClass: 'text-amber-600',
        badgeClass: 'bg-amber-50 border-amber-200 text-amber-700',
    },
    '401': {
        title: 'Belum Masuk',
        description:
            'Sesi kamu belum aktif atau sudah berakhir. Silakan login kembali untuk melanjutkan.',
        icon: ShieldAlert,
        iconClass: 'text-red-600',
        badgeClass: 'bg-red-50 border-red-200 text-red-700',
        showLoginButton: true,
    },
    '403': {
        title: 'Akses Dibatasi',
        description:
            'Halaman ini hanya dapat diakses oleh pengguna tertentu. Pastikan kamu memakai akun dengan hak akses yang sesuai.',
        icon: ShieldAlert,
        iconClass: 'text-red-600',
        badgeClass: 'bg-red-50 border-red-200 text-red-700',
        showLoginButton: true,
    },
    '404': {
        title: 'Halaman Tidak Ditemukan',
        description:
            'Alamat yang kamu tuju tidak ada atau sudah dipindahkan. Periksa kembali penulisan URL-nya, atau kembali ke beranda.',
        icon: FileQuestion,
        iconClass: 'text-brand',
        badgeClass: 'bg-blue-50 border-blue-200 text-brand',
    },
    '419': {
        title: 'Sesi Berakhir',
        description:
            'Sesi kamu berakhir karena tidak ada aktivitas dalam waktu tertentu. Silakan login ulang untuk melanjutkan.',
        icon: ShieldAlert,
        iconClass: 'text-red-600',
        badgeClass: 'bg-red-50 border-red-200 text-red-700',
        showLoginButton: true,
    },
    '429': {
        title: 'Terlalu Banyak Permintaan',
        description:
            'Kamu mengirim permintaan terlalu sering. Tunggu beberapa saat, lalu coba lagi.',
        icon: AlertCircle,
        iconClass: 'text-amber-600',
        badgeClass: 'bg-amber-50 border-amber-200 text-amber-700',
        showReloadButton: true,
    },
    '500': {
        title: 'Terjadi Kesalahan di Server',
        description:
            'Server gagal memproses permintaan ini. Coba muat ulang halaman; jika masih terjadi, hubungi administrator.',
        icon: ServerCrash,
        iconClass: 'text-red-600',
        badgeClass: 'bg-red-50 border-red-200 text-red-700',
        showReloadButton: true,
    },
    '503': {
        title: 'Layanan Tidak Tersedia',
        description:
            'Layanan sedang tidak dapat diakses, mungkin karena pemeliharaan. Silakan coba beberapa saat lagi.',
        icon: ServerCrash,
        iconClass: 'text-amber-600',
        badgeClass: 'bg-amber-50 border-amber-200 text-amber-700',
        showReloadButton: true,
    },
};

const fallbackContent: ErrorContent = {
    title: 'Terjadi Kesalahan',
    description:
        'Terjadi kesalahan yang tidak terduga saat membuka halaman ini. Silakan coba lagi atau kembali ke beranda.',
    icon: AlertCircle,
    iconClass: 'text-red-600',
    badgeClass: 'bg-red-50 border-red-200 text-red-700',
};

interface ErrorPageProps {
    code: number | string;
    title?: string;
    description?: string;
    /** `standalone` memenuhi satu layar (default), `embedded` untuk di dalam layout. */
    variant?: 'standalone' | 'embedded';
    /** Sembunyikan tombol default (mis. halaman menampilkan tombol sendiri). */
    hideActions?: boolean;
}

export default function ErrorPage({
    code,
    title,
    description,
    variant = 'standalone',
    hideActions = false,
}: ErrorPageProps) {
    const key = String(code);
    const content = errorContents[key] ?? fallbackContent;
    const Icon = content.icon;

    return (
        <div
            className={`flex items-center justify-center px-4 ${
                variant === 'standalone' ? 'min-h-screen bg-surface-muted py-16' : 'py-20'
            }`}
        >
            <div className="w-full max-w-lg text-center">
                <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full border-8 border-white bg-surface shadow-lg">
                    <Icon className={`h-12 w-12 ${content.iconClass}`} aria-hidden="true" />
                </div>

                <p className="mb-2 text-6xl font-bold text-body">{key}</p>
                <h1 className="mb-4 text-2xl font-semibold text-body">
                    {title ?? content.title}
                </h1>

                <div className="mb-8 rounded-xl border border-line bg-surface p-6 shadow-sm">
                    <p className="text-lg leading-relaxed text-body">
                        {description ?? content.description}
                    </p>
                </div>

                {!hideActions && (
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-6 py-3 font-medium text-body shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-gray-200"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Halaman Sebelumnya
                        </button>

                        <a
                            href="/"
                            className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-strong focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                        >
                            <Home className="mr-2 h-5 w-5" />
                            Kembali ke Beranda
                        </a>
                    </div>
                )}

                {(content.showLoginButton || content.showReloadButton) && !hideActions && (
                    <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                        {content.showLoginButton && (
                            <a
                                href="/login"
                                className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-medium text-body transition-colors duration-200 hover:bg-surface-muted"
                            >
                                <LogIn className="mr-2 h-4 w-4" />
                                Login
                            </a>
                        )}

                        {content.showReloadButton && (
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-medium text-body transition-colors duration-200 hover:bg-surface-muted"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Muat Ulang Halaman
                            </button>
                        )}
                    </div>
                )}

                <div className="mt-10 border-t border-line pt-6">
                    <span
                        className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${content.badgeClass}`}
                    >
                        Kode kesalahan: {key}
                    </span>
                </div>
            </div>
        </div>
    );
}
