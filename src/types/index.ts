export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    avatar?: string;
}

export interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    roles: ('admin' | 'user')[];
    children?: MenuItem[];
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCancel?: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    type?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'danger';
    showConfirmButton?: boolean;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    isLoading?: boolean;
}