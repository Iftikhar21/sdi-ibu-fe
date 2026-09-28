// components/layout/AdminHeader.tsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { ChevronDown, LogOut, Menu, User, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../common/Modal';
import ThemeToggle from '../../common/ThemeToggle';

interface AdminHeaderProps {
    title: string;
    onMenuToggle: () => void;
}

const Header = ({ title, onMenuToggle }: AdminHeaderProps) => {
    const { user, logout } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
        setProfileOpen(false); // Tutup dropdown saat membuka modal
    };

    const confirmLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            logout();
            navigate('/login');
            setIsLoggingOut(false);
            setShowLogoutModal(false);
        }, 500);
    };

    const goToHome = () => {
        navigate('/');
        setShowLogoutModal(false);
        setProfileOpen(false);
    };

    const handleProfileClick = () => {
        // Tentukan route profile berdasarkan role
        const profileRoute = user?.role?.role_name === 'admin'
            ? '/admin/profil'
            : '/user/profil';
        navigate(profileRoute);
        setProfileOpen(false);
    };

    // Tentukan teks profile berdasarkan role
    const getProfileText = () => {
        if (user?.role?.role_name === 'admin') return 'Profil Admin';
        if (user?.role?.role_name === 'user') return 'Profil Saya';
        return 'Profil';
    };

    return (
        <>
            <header className="fixed top-0 right-0 left-0 lg:left-64 bg-surface border-b border-line z-30">
                <div className="flex items-center justify-between px-4 py-4 lg:px-6 lg:py-3">
                    {/* Kiri */}
                    <div className="flex items-center gap-3">
                        <button
                            id="mobileMenuBtn"
                            className="lg:hidden text-slate-900 dark:text-white"
                            onClick={onMenuToggle}
                            aria-label="Buka menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg lg:text-base font-semibold text-body truncate max-w-[150px] lg:max-w-none">
                            {title}
                        </h1>
                    </div>

                    {/* Kanan */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle className="text-muted hover:bg-surface-muted" />

                        <div className="relative" ref={profileRef}>
                        <button
                            id="profileBtn"
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setProfileOpen(!profileOpen)}
                        >
                            <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs lg:text-sm font-bold">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="hidden lg:block text-left">
                                <span className="text-xs font-medium text-body truncate max-w-[120px] block">
                                    {user?.name || 'Unknown'}
                                </span>
                                <span className="text-xs text-muted block">
                                    {user?.role?.role_name === 'admin' ? 'Administrator' : 'Pengguna'}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-muted flex-shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Profile */}
                        {profileOpen && (
                            <div id="profileDropdown" className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-lg shadow-lg border border-line z-50 overflow-hidden">
                                {/* Header Dropdown */}
                                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                                    <p className="text-sm font-semibold text-body truncate" title={user?.name}>
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs text-muted truncate" title={user?.email}>
                                        {user?.email || 'user@example.com'}
                                    </p>
                                </div>

                                {/* Menu Items */}
                                <div className="py-1">
                                    <button
                                        onClick={handleProfileClick}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-body hover:bg-surface-muted transition-colors"
                                    >
                                        <User className="w-4 h-4 text-muted" />
                                        <span>{getProfileText()}</span>
                                    </button>

                                    <button
                                        onClick={handleLogoutClick}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-body hover:bg-surface-muted transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 text-muted" />
                                        <span>Keluar</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Modal Konfirmasi Logout */}
            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Keluar dari Sistem"
                type="warning"
                confirmText="Ya, Logout"
                cancelText="Ke Beranda"
                onConfirm={confirmLogout}
                onCancel={goToHome}
                isLoading={isLoggingOut}
                size="sm"
            >
                <div className="py-4">
                    <p className="text-body mb-4 text-center">
                        Apa yang ingin Anda lakukan?
                    </p>
                    <div className="space-y-3">
                        {/* Opsi Logout */}
                        <button
                            onClick={confirmLogout}
                            disabled={isLoggingOut}
                            className={`flex items-start gap-3 w-full p-3 rounded-lg border transition-all ${isLoggingOut
                                ? 'bg-blue-100 border-blue-300 cursor-wait'
                                : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'}`}
                        >
                            <div className={`p-2 rounded-full ${isLoggingOut ? 'bg-blue-200' : 'bg-blue-100'}`}>
                                <LogOut className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="font-medium text-blue-800">Logout</p>
                                <p className="text-sm text-blue-600 mt-1">
                                    Keluar dari akun Anda dan kembali ke halaman login
                                </p>
                            </div>
                            {isLoggingOut && (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mt-1"></div>
                            )}
                        </button>

                        {/* Opsi Ke Beranda */}
                        <button
                            onClick={goToHome}
                            className="flex items-start gap-3 w-full p-3 bg-surface-muted border border-line rounded-lg hover:bg-surface-muted hover:border-line transition-all"
                        >
                            <div className="p-2 rounded-full bg-surface-muted">
                                <Home className="w-4 h-4 text-muted" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="font-medium text-body">Ke Beranda</p>
                                <p className="text-sm text-muted mt-1">
                                    Kembali ke halaman utama tanpa logout
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Header;
