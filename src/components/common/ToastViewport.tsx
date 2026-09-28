import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { ToastItem, ToastType } from '../../types/toast';

interface ToastViewportProps {
    toasts: ToastItem[];
    onDismiss: (id: number) => void;
}

const toastStyles: Record<
    ToastType,
    { icon: React.ElementType; iconClass: string; barClass: string; borderClass: string }
> = {
    success: {
        icon: CheckCircle2,
        iconClass: 'text-green-600',
        barClass: 'bg-green-500',
        borderClass: 'border-l-green-500',
    },
    error: {
        icon: XCircle,
        iconClass: 'text-red-600',
        barClass: 'bg-red-500',
        borderClass: 'border-l-red-500',
    },
    warning: {
        icon: AlertTriangle,
        iconClass: 'text-amber-600',
        barClass: 'bg-amber-500',
        borderClass: 'border-l-amber-500',
    },
    info: {
        icon: Info,
        iconClass: 'text-blue-600',
        barClass: 'bg-blue-500',
        borderClass: 'border-l-blue-500',
    },
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
    const [isClosing, setIsClosing] = useState(false);
    const style = toastStyles[toast.type];
    const Icon = style.icon;

    const startClosing = () => setIsClosing(true);

    // Tutup otomatis sesuai durasi
    useEffect(() => {
        if (toast.duration <= 0) return;

        const timer = window.setTimeout(() => setIsClosing(true), toast.duration);
        return () => window.clearTimeout(timer);
    }, [toast.duration]);

    // Hapus dari daftar setelah animasi keluar selesai
    useEffect(() => {
        if (!isClosing) return;

        const timer = window.setTimeout(() => onDismiss(toast.id), 180);
        return () => window.clearTimeout(timer);
    }, [isClosing, onDismiss, toast.id]);

    return (
        <div
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto relative overflow-hidden rounded-xl border border-line border-l-4 bg-surface shadow-lg shadow-gray-900/10 ${style.borderClass} ${
                isClosing ? 'toast-leave' : 'toast-enter'
            }`}
        >
            <div className="flex items-start gap-3 p-4 pr-10">
                <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${style.iconClass}`} aria-hidden="true" />

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-body">{toast.title}</p>
                    {toast.description && (
                        <p className="mt-1 whitespace-pre-line break-words text-sm text-muted">
                            {toast.description}
                        </p>
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={startClosing}
                aria-label="Tutup notifikasi"
                className="absolute right-2 top-2 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-muted hover:text-muted"
            >
                <X className="h-4 w-4" />
            </button>

            {toast.duration > 0 && !isClosing && (
                <span
                    className={`toast-progress absolute bottom-0 left-0 h-0.5 w-full ${style.barClass}`}
                    style={{ animationDuration: `${toast.duration}ms` }}
                />
            )}
        </div>
    );
}

export default function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
    if (toasts.length === 0) return null;

    return (
        <div
            aria-live="polite"
            aria-atomic="false"
            className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[min(92vw,24rem)] flex-col gap-3"
        >
            {toasts.map((toast) => (
                <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}
