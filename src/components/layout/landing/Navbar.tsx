import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, Home, BookOpen, Newspaper, UserPlus, Phone, LogIn } from 'lucide-react';
import logo_sdi from '@/assets/img/logo-sdi-ibu.svg';
import { useAuth } from '../../../auth/AuthContext';

const Navbar = () => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfilOpen, setIsProfilOpen] = useState(false);
    const [isProfilMobileOpen, setIsProfilMobileOpen] = useState(false);
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
                { name: 'Sejarah', path: '/profil/sejarah' },
                { name: 'Visi Misi', path: '/profil/visi-misi' },
                { name: 'Program Unggulan', path: '/profil/program' },
            ],
        },
        {
            name: 'Berita',
            path: '/berita',
            icon: <Newspaper className="w-4 h-4" />
        },
        {
            name: 'Pendaftaran',
            path: '/pendaftaran',
            icon: <UserPlus className="w-4 h-4" />
        },
        {
            name: 'Kontak',
            path: '/kontak',
            icon: <Phone className="w-4 h-4" />
        },
    ];

    const isProfilActive = location.pathname.startsWith('/profil');

    const activeClass =
        'text-blue-600 relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:bg-blue-600 after:scale-x-100 after:origin-left after:transition-transform';

    const hoverClass =
        'relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:bg-blue-600 after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100';

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isMenuOpen) {
            setIsProfilMobileOpen(false);
        }
    };

    const handleProfilMobileToggle = () => {
        setIsProfilMobileOpen(!isProfilMobileOpen);
    };

    const closeMobileMenu = () => {
        setIsMenuOpen(false);
        setIsProfilMobileOpen(false);
    };

    // Fungsi untuk mendapatkan URL dashboard berdasarkan role
    const getDashboardUrl = () => {
        if (!user) return '/login';

        const userRole = user?.role?.role_name;

        if (userRole === 'admin') {
            return '/admin/dashboard';
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
        } else if (userRole === 'user') {
            return 'Dashboard User';
        }

        return 'Dashboard';
    };

    return (
        <nav className="bg-white shadow-sm">
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
                                        onClick={() => setIsProfilOpen(!isProfilOpen)}
                                        className={`flex items-center text-sm font-medium transition-colors ${isProfilActive
                                            ? activeClass
                                            : `text-gray-600 hover:text-blue-600 ${hoverClass}`
                                            }`}
                                    >
                                        {item.name}
                                        <ChevronDown
                                            className={`w-4 h-4 ml-1 transition-transform ${isProfilOpen ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {isProfilOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsProfilOpen(false)}
                                            />
                                            <div className="absolute z-20 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                                                {item.children.map((child) => (
                                                    <NavLink
                                                        key={child.path}
                                                        to={child.path}
                                                        onClick={() => setIsProfilOpen(false)}
                                                        className={({ isActive }) =>
                                                            `block px-4 py-2 text-sm ${isActive
                                                                ? 'text-blue-600 bg-blue-50'
                                                                : 'text-gray-700 hover:bg-gray-100'
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
                                            : `text-gray-600 hover:text-blue-600 ${hoverClass}`
                                        }`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            )
                        )}

                        {/* DASHBOARD/LOGIN BUTTON */}
                        <Link
                            to={getDashboardUrl()}
                            className="px-8 py-2 text-white bg-gradient-to-b from-[#E9D21F] to-[#DF972B] rounded-full font-medium hover:shadow-md transition-shadow"
                        >
                            {getDashboardText()}
                        </Link>
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        className="md:hidden p-2 bg-gray-200 rounded-lg transition-colors z-50"
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
                <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {/* Mobile Menu Header */}
                    <div className="relative flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-white h-50">
                        {/* Close Button */}
                        <button
                            onClick={handleMenuToggle}
                            className="p-2 hover:bg-white rounded-full shadow-sm ml-auto"
                        >
                            <X className="w-5 h-5 text-gray-700" />
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
                                                onClick={handleProfilMobileToggle}
                                                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isProfilActive || isProfilMobileOpen
                                                    ? 'text-blue-700 bg-blue-50 border-l-4 border-blue-600'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <span className="text-blue-500 mr-3">{item.icon}</span>
                                                    {item.name}
                                                </div>
                                                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isProfilMobileOpen ? 'rotate-90' : ''}`} />
                                            </button>

                                            {/* Profil Submenu */}
                                            <div className={`overflow-hidden transition-all duration-300 ${isProfilMobileOpen ? 'max-h-96 mt-1' : 'max-h-0'}`}>
                                                <div className="pl-6 space-y-1">
                                                    {item.children.map((child) => (
                                                        <NavLink
                                                            key={child.path}
                                                            to={child.path}
                                                            onClick={closeMobileMenu}
                                                            className={({ isActive }) =>
                                                                `flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${isActive
                                                                    ? 'text-blue-600 bg-blue-100 border-l-4 border-blue-500'
                                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
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
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
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
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {user.role?.role_name === 'admin' ? 'Administrator' : 'Orang Tua'}
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