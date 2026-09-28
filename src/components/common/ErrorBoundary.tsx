import { Component, type ErrorInfo, type ReactNode } from 'react';
import ServerError from '../../pages/ServerError';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

/**
 * Menangkap error saat render supaya aplikasi tidak menampilkan layar putih,
 * melainkan halaman kesalahan 500.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Terjadi kesalahan pada aplikasi:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return <ServerError />;
        }

        return this.props.children;
    }
}
