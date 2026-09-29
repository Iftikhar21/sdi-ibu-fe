import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, Home, BookOpen, Newspaper, UserPlus, Phone, Images } from 'lucide-react';
import logo_sdi from '@/assets/img/logo-sdi-ibu.svg';
import { useAuth } from '../../../auth/AuthContext';
import ThemeToggle from '../../common/ThemeToggle';

const Navbar = () => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
    const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);
    const location = useLocation();

    const navLinks = [
        {
            name: 'Beranda',
            path: '/',
            end: true,
            icon: <Home className="w-4 h-4" />
        },
        {
            name: 'Profil',
            icon: <BookOpen className="w-4 h-4" />,
            children: [
                { name: 'Tentang Sekolah IBU', path: '/profil/tentang-sekolah' },
                { name: 'Sejarah', path: '/profil/sejarah' },
                { name: 'Visi Misi', path: '/profil/visi-misi' },
                { name: 'Struktur Organisasi', path: '/profil/struktur-organisasi' },
                { name: 'Nilai Pendidikan', path: '/profil/nilai-pendidikan' },
                { name: 'Program Unggulan', path: '/profil/program' },
                { name: 'Kepala Sekolah', path: '/profil/kepala-sekolah' },
                { name: 'Guru & Tenaga Kependidikan', path: '/profil/guru' },
                { name: 'Legalitas & NPSN', path: '/profil/legalitas' },
                { name: 'Lulusan', path: '/profil/lulusan' },
            ],
        },
        {
            name: 'Berita',
            path: '/berita',
            icon: <Newspaper className="w-4 h-4" />
        },
        {
            name: 'Galeri',
            path: '/galeri',
            icon: <Images className="w-4 h-4" />
        },
        {
            name: 'SPMB',
            icon: <UserPlus className="w-4 h-4" />,
            children: [
                { name: 'Status & Kuota Kelas', path: '/pendaftaran#kuota-kelas' },
                { name: 'Persyaratan', path: '/pendaftaran#persyaratan' },
                { name: 'Biaya', path: '/pendaftaran#biaya' },
                { name: 'Alur Pendaftaran', path: '/pendaftaran#alur' },
                { name: 'Formulir Pendaftaran', path: '/pendaftaran#formulir' },
            ],
        },
        {
            name: 'Kontak',
            path: '/kontak',
            icon: <Phone className="w-4 h-4" />
        },
    ];

    const isSectionActive = (name: string) => (
        name === 'Profil'
            ? location.pathname.startsWith('/profil')
            : name === 'SPMB' && location.pathname === '/pendaftaran'
    );

    const isChildActive = (path: string) => {
        const [pathname, hash] = path.split('#');
        return location.pathname === pathname && (!hash || location.hash === `#${hash}`);
    };

    const activeClass =
        'text-blue-600 relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:bg-blue-600 after:scale-x-100 after:origin-left after:transition-transform';

    const hoverClass =
        'relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:bg-blue-600 after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100';

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isMenuOpen) {
            setOpenMobileMenu(null);
        }
    };

    const handleMobileSubmenuToggle = (name: string) => {
        setOpenMobileMenu((current) => current === name ? null : name);
    };

    const closeMobileMenu = () => {
        setIsMenuOpen(false);
        setOpenMobileMenu(null);
    };

    // Fungsi untuk mendapatkan URL dashboard berdasarkan role
    const getDashboardUrl = () => {
        if (!user) return '/login';

        const userRole = user?.role?.role_name;

        if (userRole === 'admin') {
            return '/admin/dashboard';
        } else if (userRole === 'guru') {
            return '/guru/dashboard';
        } else if (userRole === 'user') {
            return '/user/dashboard';
        }

        // Default fallback
        return '/';
    };

    // Fungsi untuk mendapatkan teks dashboard berdasarkan role
    const getDashboardText = () => {
        if (!user) return 'Login';

        const userRole = user?.role?.role_name;

        if (userRole === 'admin') {
            return 'Dashboard Admin';
        } else if (userRole === 'guru') {
            return 'Dashboard Guru';
        } else if (userRole === 'user') {
            return 'Dashboard User';
        }

        return 'Dashboard';
    };

    return (
        <nav className="bg-surface shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-20">
                    {/* LOGO */}
                    <Link to="/" className="flex items-center">
                        <img src={logo_sdi} className="h-14 w-auto" alt="Logo SDI" />
                    </Link>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((item) =>
                            item.children ? (
                                <div key={item.name} className="relative">
                                    <button
                                        onClick={() => setOpenDesktopMenu((current) => current === item.name ? null : item.name)}
                                        className={`flex cursor-pointer items-center text-sm font-medium transition-colors ${isSectionActive(item.name)
                                            ? activeClass
                                            : `text-muted hover:text-blue-600 ${hoverClass}`
                                            }`}
                                    >
                                        {item.name}
                                        <ChevronDown
                                            className={`w-4 h-4 ml-1 transition-transform ${openDesktopMenu === item.name ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {openDesktopMenu === item.name && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setOpenDesktopMenu(null)}
                                            />
                                            <div className="scroll-slim absolute z-20 mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-lg border bg-surface py-1 shadow-lg">
                                                {item.children.map((child) => (
                                                    <NavLink
                                                        key={child.path}
                                                        to={child.path}
                                                        onClick={() => setOpenDesktopMenu(null)}
                                                        className={() =>
                                                            `block cursor-pointer px-4 py-2 text-sm ${isChildActive(child.path)
                                                                ? 'text-blue-600 bg-blue-50'
                                                                : 'text-body hover:bg-surface-muted'
                                                            }`
                                                        }
                                                    >
                                                        {child.name}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <NavLink
                                    key={item.path}
                                    to={item.path!}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `text-sm font-medium transition-colors ${isActive
                                            ? activeClass
                                            : `text-muted hover:text-blue-600 ${hoverClass}`
                                        }`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            )
                        )}

                        {/* DASHBOARD/LOGIN BUTTON */}
                        <ThemeToggle className="text-muted hover:bg-surface-muted" />

                        <Link
                            to={getDashboardUrl()}
                            className="px-8 py-2 text-white bg-gradient-to-b from-[#E9D21F] to-[#DF972B] rounded-full font-medium hover:shadow-md transition-shadow"
                        >
                            {getDashboardText()}
                        </Link>
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        className="md:hidden cursor-pointer p-2 bg-line rounded-lg transition-colors z-50"
                        onClick={handleMenuToggle}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* MOBILE MENU OVERLAY */}
                {isMenuOpen && (
                    <div className="fixed inset-0 backdrop-blur-[2px] bg-opacity-50 z-40 md:hidden" onClick={closeMobileMenu} />
                )}

                {/* MOBILE MENU SIDEBAR */}
                <div className={`fixed top-0 left-0 h-full w-72 bg-surface z-50 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {/* Mobile Menu Header */}
                    <div className="relative flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-surface h-50">
                        {/* Close Button */}
                        <button
                            onClick={handleMenuToggle}
                            className="cursor-pointer p-2 hover:bg-surface rounded-full shadow-sm ml-auto"
                        >
                            <X className="w-5 h-5 text-body" />
                        </button>

                        {/* Logo */}
                        <Link
                            to="/"
                            onClick={closeMobileMenu}
                            className="absolute left-1/2 -translate-x-1/2"
                        >
                            <img src={logo_sdi} className="h-32 w-auto" alt="Logo SDI" />
                        </Link>
                    </div>

                    {/* Mobile Menu Content */}
                    <div className="h-[calc(100%-70px)] overflow-y-auto py-4">
                        {/* Navigation Links */}
                        <div className="space-y-1 px-2">
                            {navLinks.map((item) => {
                                if (item.children) {
                                    return (
                                        <div key={item.name}>
                                            <button
                                                onClick={() => handleMobileSubmenuToggle(item.name)}
                                                className={`w-full cursor-pointer flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isSectionActive(item.name) || openMobileMenu === item.name
                                                    ? 'text-blue-700 bg-blue-50 border-l-4 border-blue-600'
                                                    : 'text-body hover:bg-surface-muted hover:text-body'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <span className="text-blue-500 mr-3">{item.icon}</span>
                                                    {item.name}
                                                </div>
                                                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${openMobileMenu === item.name ? 'rotate-90' : ''}`} />
                                            </button>

                                            <div className={`overflow-hidden transition-all duration-300 ${openMobileMenu === item.name ? 'max-h-96 mt-1' : 'max-h-0'}`}>
                                                <div className="pl-6 space-y-1">
                                                    {item.children.map((child) => (
                                                        <NavLink
                                                            key={child.path}
                                                            to={child.path}
                                                            onClick={closeMobileMenu}
                                                            className={() =>
                                                                `flex cursor-pointer items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${isChildActive(child.path)
                                                                    ? 'text-blue-600 bg-blue-100 border-l-4 border-blue-500'
                                                                    : 'text-muted hover:bg-surface-muted hover:text-body'
                                                                }`
                                                            }
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-3"></div>
                                                            {child.name}
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path!}
                                        end={item.end}
                                        onClick={closeMobileMenu}
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                                ? 'text-blue-700 bg-blue-50 border-l-4 border-blue-600'
                                                : 'text-body hover:bg-surface-muted hover:text-body'
                                            }`
                                        }
                                    >
                                        <span className="text-blue-500 mr-3">{item.icon}</span>
                                        {item.name}
                                    </NavLink>
                                );
                            })}

                            {/* Dashboard/Login Button */}
                            <div className="mt-6 px-4">
                                <Link
                                    to={getDashboardUrl()}
                                    onClick={closeMobileMenu}
                                    className="flex items-center justify-center px-4 py-3 bg-gradient-to-b from-[#E9D21F] to-[#DF972B] text-white font-medium rounded-3xl shadow hover:shadow-md transition-all duration-200"
                                >
                                    {getDashboardText()}
                                </Link>
                            </div>

                            {/* Pengalih tema */}
                            <div className="mt-4 px-4">
                                <ThemeToggle
                                    variant="text"
                                    className="rounded-lg px-4 py-3 text-body hover:bg-surface-muted"
                                />
                            </div>

                            {/* User Info jika sudah login */}
                            {user && (
                                <div className="mt-4 px-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3">
                                            <span className="text-white text-xs font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-body truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-muted">
                                                {user.role?.role_name === 'admin'
                                                    ? 'Administrator'
                                                    : user.role?.role_name === 'guru'
                                                      ? 'Guru'
                                                      : 'Orang Tua'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
