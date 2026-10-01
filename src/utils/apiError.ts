import type { AxiosError } from 'axios';

interface ApiErrorBody {
    message?: string;
    errors?: Record<string, string[]>;
}

/**
 * Ambil pesan error yang bisa dibaca dari response API.
 * Membantu membedakan 404 (endpoint belum ada / belum di-deploy),
 * 401 (sesi login berakhir), dan 422 (validasi gagal).
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const status = axiosError?.response?.status;
    const body = axiosError?.response?.data;

    if (status === 401) {
        return 'Sesi login Anda berakhir. Silakan login ulang.';
    }

    if (status === 404) {
        return 'Endpoint tidak ditemukan di server API. Kemungkinan backend belum di-deploy atau baseURL di src/api/api.ts masih mengarah ke server lain.';
    }

    if (status === 422 && body?.errors) {
        const firstError = Object.values(body.errors)[0]?.[0];
        if (firstError) {
            return firstError;
        }
    }

    if (status === 413) {
        return 'Ukuran total berkas terlalu besar untuk server. Pilih file yang lebih kecil lalu coba lagi.';
    }

    if (status === 408 || status === 504) {
        return 'Waktu pengiriman habis. Periksa koneksi internet lalu kirim kembali.';
    }

    if (status === 429) {
        return 'Server sedang menerima terlalu banyak permintaan. Tunggu sebentar lalu coba kembali.';
    }

    if (status === 502 || status === 503) {
        return 'Server sedang sibuk atau dalam perawatan. Silakan coba kembali beberapa saat lagi.';
    }

    if (status === 500) {
        return 'Terjadi kesalahan di server API. Cek storage/logs/laravel.log pada server.';
    }

    if (body?.message) {
        return body.message;
    }

    if (!axiosError?.response) {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return 'Perangkat sedang offline. Sambungkan ke internet lalu coba kembali.';
        }

        if (axiosError?.code === 'ECONNABORTED' || axiosError?.code === 'ETIMEDOUT') {
            return 'Koneksi ke server terlalu lama. Data form tetap tersimpan; silakan coba kirim kembali.';
        }

        return 'Koneksi ke server terputus. Pastikan sinyal stabil lalu coba kembali; data form tetap tersimpan.';
    }

    return fallback;
};
