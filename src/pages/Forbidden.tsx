import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";

export default function Forbidden() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center max-w-lg">
                {/* Icon utama */}
                <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full border-8 border-white shadow-lg">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>

                {/* Judul */}
                <h1 className="text-6xl font-bold text-gray-900 mb-3">403</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Akses Dibatasi</h2>

                {/* Pesan */}
                <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-200">
                    <p className="text-gray-700 text-lg leading-relaxed">
                        Maaf, halaman yang kamu coba akses dibatasi untuk pengguna tertentu.
                        Pastikan kamu memiliki kredensial yang tepat atau hubungi administrator.
                    </p>
                </div>

                {/* Tombol aksi */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-800 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Kembali ke Beranda
                    </Link>

                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                    >
                        <LogIn className="w-5 h-5 mr-2" />
                        Login dengan Akun Lain
                    </Link>
                </div>

                {/* Info tambahan */}
                <div className="mt-10 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        <span className="font-medium">Tips:</span> Periksa kembali URL atau coba login dengan akun yang berbeda.
                    </p>
                    <div className="mt-2">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            Status: Unauthorized Access
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}