// components/layout/AdminSidebar.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Box, ChevronDown, Database, LayoutDashboard, User, ChevronRight, School, Newspaper, Phone, BookText, LogOut, Shield, Users as UsersIcon, Home } from 'lucide-react';
import logo_sdi from "@/assets/img/logo-sdi-ibu.svg";
import { useAuth } from '../../../auth/AuthContext';
import Modal from '../../common/Modal';

interface MenuItem {
    route?: string;
    label: string;
    icon: React.ElementType;
    roles?: string[]; // ['admin', 'user']
    children?: MenuItem[];
}

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

    // State untuk modal logout
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Menu berdasarkan role - HAPUS MENU PROFIL DARI SINI
    const getMenusByRole = (): MenuItem[] => {
        const userRole = user?.role?.role_name;

        // Menu khusus ADMIN
        const adminMenus: MenuItem[] = [
            {
                route: '/admin/dashboard',
                label: 'Dashboard',
                icon: LayoutDashboard,
                roles: ['admin'],
            },
            {
                label: 'Konten Website',
                icon: Database,
                roles: ['admin'],
                children: [
                    { route: '/admin/news', label: 'Berita', icon: Newspaper, roles: ['admin'] },
                    { route: '/admin/program', label: 'Program', icon: School, roles: ['admin'] },
                    { route: '/admin/sejarah', label: 'Sejarah', icon: BookText, roles: ['admin'] },
                    { route: '/admin/visi-misi', label: 'Visi & Misi', icon: BookText, roles: ['admin'] },
                ],
            },
            {
                route: '/admin/contacts',
                label: 'Kontak',
                icon: Phone,
                roles: ['admin'],
            },
            {
                route: '/admin/registrations',
                label: 'Pendaftaran',
                icon: BookText,
                roles: ['admin'],
            },
            {
                label: 'Manajemen Pengguna',
                icon: UsersIcon,
                roles: ['admin'],
                children: [
                    { route: '/admin/kelola-pengguna', label: 'Semua Pengguna', icon: User, roles: ['admin'] },
                    { route: '/admin/kelola-admin', label: 'Admin', icon: Shield, roles: ['admin'] },
                    { route: '/admin/kelola-user', label: 'User', icon: User, roles: ['admin'] },
                ],
            },
        ];

        // Menu khusus USER
        const userMenus: MenuItem[] = [
            {
                route: '/user/dashboard',
                label: 'Dashboard',
                icon: LayoutDashboard,
                roles: ['user'],
            },
            {
                route: '/user/registrations',
                label: 'Pendaftaran',
                icon: BookText,
                roles: ['user'],
            },
        ];

        // Return menu berdasarkan role
        if (userRole === 'admin') {
            return adminMenus;
        } else if (userRole === 'user') {
            return userMenus;
        }

        return [];
    };

    const menus = getMenusByRole();

    // Auto buka menu parent jika child aktif
    useEffect(() => {
        const newOpenMenus: { [key: string]: boolean } = {};

        menus.forEach(menu => {
            if (menu.children) {
                const isChildActive = menu.children.some(child =>
                    child.route && isActive(child.route)
                );
                if (isChildActive) {
                    newOpenMenus[menu.label] = true;
                }
            }
        });

        setOpenMenus(prev => ({ ...prev, ...newOpenMenus }));
    }, [location.pathname]);

    const toggleMenu = (label: string) => {
        setOpenMenus(prev => {
            const newState: { [key: string]: boolean } = {};
            Object.keys(prev).forEach(key => {
                newState[key] = false;
            });
            newState[label] = !prev[label];
            return newState;
        });
    };

    const isActive = (route: string) => {
        if (route === '/admin/dashboard' || route === '/user/dashboard') {
            return location.pathname === route;
        }
        return location.pathname === route || location.pathname.startsWith(route + '/');
    };

    const isParentActive = (menu: MenuItem) => {
        if (menu.route) return isActive(menu.route);
        if (menu.children) {
            return menu.children.some(child => child.route && isActive(child.route));
        }
        return false;
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
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
    };

    const handleProfileClick = () => {
        const userRole = user?.role?.role_name;
        const profileRoute = userRole === 'admin' ? '/admin/profil' : '/user/profil';
        navigate(profileRoute);
        onClose(); // Tutup sidebar di mobile
    };

    const userRole = user?.role?.role_name;

    const filteredMenus = menus
        .filter(menu => !menu.roles || menu.roles.includes(userRole!))
        .map(menu => {
            if (!menu.children) return menu;

            const filteredChildren = menu.children.filter(
                child => !child.roles || child.roles.includes(userRole!)
            );

            return { ...menu, children: filteredChildren };
        })
        .filter(menu => !menu.children || menu.children.length > 0);

    // Tentukan title berdasarkan role
    const getSidebarTitle = () => {
        if (userRole === 'admin') return 'Admin Panel';
        if (userRole === 'user') return 'Portal User';
        return 'Dashboard';
    };

    // Tentukan subtitle berdasarkan role
    const getSidebarSubtitle = () => {
        if (userRole === 'admin') return 'SDI Ikhlas Bakti Umat';
        if (userRole === 'user') return 'SDI Ikhlas Bakti Umat';
        return '';
    };

    // Tentukan role display text
    const getRoleDisplay = () => {
        if (userRole === 'admin') return 'Administrator';
        if (userRole === 'user') return 'Pengguna';
        return 'Pengguna';
    };

    return (
        <>
            <aside
                className={`fixed top-0 left-0 h-screen w-80 
                        bg-gradient-to-b from-[#004AAD] to-[#004AAD]
                        backdrop-blur-xl bg-opacity-90
                        text-white z-40 transform transition-transform duration-300 
                        flex flex-col border-r border-white/10 shadow-2xl
                        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >

                {/* Logo */}
                <div className="p-6 border-b border-white/10 flex-shrink-0 bg-white/5 backdrop-blur-md">
                    <div className="w-40 h-40 mx-auto flex flex-col items-center justify-center">
                        <img src={logo_sdi} className="w-24 h-24 opacity-90" />
                        <div className="mt-4 text-center">
                            <h2 className="text-lg font-bold">{getSidebarTitle()}</h2>
                            <p className="text-xs text-white/70">{getSidebarSubtitle()}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Container dengan Scroll */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <nav className="p-4 flex-1 overflow-y-auto">
                        <ul className="space-y-2">
                            {filteredMenus.map((menu, index) => (
                                <li key={index} className="relative">
                                    {menu.children ? (
                                        // Dropdown Menu
                                        <div>
                                            <button
                                                onClick={() => toggleMenu(menu.label)}
                                                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-300 group
        ${isParentActive(menu)
                                                        ? 'bg-white/20 text-white shadow-lg'
                                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <menu.icon
                                                        className={`w-5 h-5 ${isParentActive(menu)
                                                            ? 'text-white'
                                                            : 'text-white/70 group-hover:text-white'
                                                            }`}
                                                    />
                                                    <span className="font-medium text-sm">{menu.label}</span>
                                                </div>

                                                <ChevronDown
                                                    className={`w-4 h-4 transition-transform duration-300
            ${openMenus[menu.label] ? 'rotate-180' : ''}
            ${isParentActive(menu) ? 'text-white' : 'text-white/60 group-hover:text-white'}
        `}
                                                />
                                            </button>

                                            {/* Dropdown Content */}
                                            {openMenus[menu.label] && (
                                                <div className="ml-4 mt-2 space-y-1 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                                                    {menu.children.map((child, childIndex) => {
                                                        const active = child.route && isActive(child.route);
                                                        return (
                                                            <div key={childIndex} className="relative">
                                                                <Link
                                                                    to={child.route!}
                                                                    onClick={onClose}
                                                                    className={`block px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ${active
                                                                        ? 'bg-[#003A8C] text-white shadow-md border-l-4 border-white'
                                                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <div className={`w-1.5 h-1.5 rounded-full mr-3 ${active ? 'bg-white' : 'bg-white/40 group-hover:bg-white'
                                                                            }`}></div>
                                                                        <span className="truncate">{child.label}</span>
                                                                        {active && (
                                                                            <ChevronRight className="w-3 h-3 ml-auto text-blue-200" />
                                                                        )}
                                                                    </div>
                                                                </Link>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // Single Menu
                                        <Link
                                            to={menu.route!}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${menu.route && isActive(menu.route)
                                                ? 'bg-white/20 text-white shadow-lg border-r-4 border-white'
                                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            <menu.icon className={`w-5 h-5 flex-shrink-0 ${menu.route && isActive(menu.route) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                                                }`} />
                                            <span className="font-medium text-sm">{menu.label}</span>
                                            {menu.route && isActive(menu.route) && (
                                                <ChevronRight className="w-4 h-4 ml-auto text-blue-200" />
                                            )}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* User Info & Logout - DIPINDAH KE SINI (setelah semua menu) */}
                    <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
                        <button
                            onClick={handleProfileClick}
                            className="flex items-center gap-3 w-full px-2 py-2 text-white/90 hover:bg-white/10 rounded-lg transition-colors duration-200 mb-4"
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                {user?.name ? (
                                    <span className="text-white font-medium text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                ) : (
                                    <User className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium truncate">{user?.name || 'Pengguna'}</p>
                                <p className="text-xs text-white/70 truncate">{getRoleDisplay()}</p>
                            </div>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Keluar</span>
                        </button>

                        {/* Home Button untuk mobile */}
                        <button
                            onClick={goToHome}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 mt-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 lg:hidden"
                        >
                            <Home className="w-4 h-4" />
                            <span className="text-sm font-medium">Ke Beranda</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Modal Konfirmasi Logout */}
            <Modal
                isOpen={showLogoutModal}
                title="Keluar dari Dashboard"
                type="warning"
                confirmText="Ya, Logout"
                cancelText="Ke Beranda"
                onConfirm={confirmLogout}
                onCancel={goToHome}
                onClose={() => setShowLogoutModal(false)}
                isLoading={isLoggingOut}
                size="sm"
            >
                <div className="py-4">
                    <p className="text-gray-700 mb-2">Apa yang ingin Anda lakukan?</p>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <LogOut className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-800">Logout</p>
                                <p className="text-sm text-blue-600">Keluar dari akun Anda dan kembali ke halaman login</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Home className="w-5 h-5 text-gray-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-800">Ke Beranda</p>
                                <p className="text-sm text-gray-600">Kembali ke halaman utama tanpa logout</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Sidebar;