import { useCallback, useMemo, useRef, useState } from 'react';
import ToastViewport from '../components/common/ToastViewport';
import { ToastContext } from './toast';
import type { ToastApi, ToastItem, ToastType } from '../types/toast';

// Durasi tampil per jenis notifikasi (ms)
const defaultDurations: Record<ToastType, number> = {
    success: 4000,
    info: 5000,
    warning: 6000,
    error: 8000,
};

// Maksimal notifikasi yang tampil bersamaan agar layar tidak penuh
const maxToasts = 5;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const nextId = useRef(1);

    const dismiss = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const dismissAll = useCallback(() => setToasts([]), []);

    const show = useCallback((type: ToastType, title: string, description?: string) => {
        const id = nextId.current++;

        setToasts((current) => [
            ...current.slice(-(maxToasts - 1)),
            {
                id,
                type,
                title,
                description: description?.trim() ? description.trim() : undefined,
                duration: defaultDurations[type],
            },
        ]);
    }, []);

    const api = useMemo<ToastApi>(
        () => ({
            success: (message, description) => show('success', message, description),
            error: (message, description) => show('error', message, description),
            warning: (message, description) => show('warning', message, description),
            info: (message, description) => show('info', message, description),
            dismiss,
            dismissAll,
        }),
        [show, dismiss, dismissAll]
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}
