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

    if (status === 500) {
        return 'Terjadi kesalahan di server API. Cek storage/logs/laravel.log pada server.';
    }

    if (body?.message) {
        return body.message;
    }

    if (!axiosError?.response) {
        return 'Tidak dapat terhubung ke server API. Periksa koneksi internet atau konfigurasi baseURL.';
    }

    return fallback;
};
