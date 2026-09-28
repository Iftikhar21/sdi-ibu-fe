export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
    id: number;
    type: ToastType;
    title: string;
    description?: string;
    /** Milidetik sebelum notifikasi menutup sendiri. 0 = tidak menutup otomatis. */
    duration: number;
}

export interface ToastApi {
    success: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
    warning: (message: string, description?: string) => void;
    info: (message: string, description?: string) => void;
    dismiss: (id: number) => void;
    dismissAll: () => void;
}
