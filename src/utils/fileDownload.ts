import type { AxiosError } from 'axios';
import { getApiErrorMessage } from './apiError';

/**
 * Simpan blob (hasil download dari API) sebagai file di komputer pengguna.
 */
export const saveBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

/**
 * Ambil nama file dari header Content-Disposition.
 */
export const getFilenameFromDisposition = (
    disposition: string | undefined,
    fallback = 'download'
): string => {
    if (!disposition) return fallback;

    const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1].replace(/"/g, ''));
    }

    const basicMatch = /filename="?([^";]+)"?/i.exec(disposition);
    return basicMatch?.[1]?.trim() || fallback;
};

/**
 * Endpoint download membalas blob, jadi pesan error dari server
 * perlu dibaca dulu sebagai teks sebelum bisa ditampilkan.
 */
export const getDownloadErrorMessage = async (error: unknown, fallback: string): Promise<string> => {
    const axiosError = error as AxiosError<Blob | { message?: string }>;
    const data = axiosError?.response?.data;

    if (data instanceof Blob) {
        try {
            const text = await data.text();
            const parsed = JSON.parse(text) as { message?: string };

            if (parsed?.message) {
                return parsed.message;
            }
        } catch {
            // bukan JSON, lanjut ke pesan standar di bawah
        }
    }

    return getApiErrorMessage(error, fallback);
};
