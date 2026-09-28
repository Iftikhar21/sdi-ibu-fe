import { createContext, useContext } from 'react';
import type { ToastApi } from '../types/toast';

export const ToastContext = createContext<ToastApi | null>(null);

/**
 * Akses notifikasi (toast) dari komponen mana pun.
 *
 * Contoh:
 *   toast.success('FAQ berhasil ditambahkan');
 *   toast.error('Gagal menambahkan FAQ', 'Pertanyaan wajib diisi');
 */
export function useToast(): ToastApi {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast harus dipakai di dalam <ToastProvider>');
    }

    return context;
}
