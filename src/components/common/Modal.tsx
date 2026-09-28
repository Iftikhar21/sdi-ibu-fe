import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { ModalProps } from '../../types';

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onCancel,
    title,
    children,
    size = 'md',
    type = 'default',
    confirmText = 'Ya',
    cancelText = 'Tidak',
    onConfirm,
    isLoading = false,
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    const typeClasses = {
        default: 'border-t-4 border-t-blue-500',
        warning: 'border-t-4 border-t-amber-500',
        danger: 'border-t-4 border-t-red-500',
    };

    const typeIcons = {
        default: <AlertCircle className="w-6 h-6 text-blue-500" />,
        warning: <AlertCircle className="w-6 h-6 text-amber-500" />,
        danger: <AlertCircle className="w-6 h-6 text-red-500" />,
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* OVERLAY */}
            <div
                className="absolute inset-0 backdrop-blur-sm bg-opacity-50"
                onClick={onClose}
            />

            {/* MODAL */}
            <div
                className={`relative z-10 w-full ${sizeClasses[size]} mx-4 bg-surface rounded-lg shadow-xl ${typeClasses[type]}`}
                onClick={(e) => e.stopPropagation()} // 🔥 KUNCI
            >
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        {typeIcons[type]}
                        <h3 className="text-lg font-semibold text-body">
                            {title}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-1 rounded-lg hover:bg-surface-muted"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="px-6 pb-4">{children}</div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-surface-muted">
                    {cancelText && (
                        <button
                            type="button"
                            onClick={onCancel ?? onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-body bg-surface border rounded-lg hover:bg-surface-muted"
                        >
                            {cancelText}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => {
                            console.log('Modal confirm button clicked');
                            onConfirm?.();
                        }}
                        disabled={isLoading}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Loading...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
