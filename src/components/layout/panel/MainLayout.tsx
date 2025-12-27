// components/layout/AdminLayout.tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './Sidebar';
import AdminHeader from './Header';
import Footer from './Footer';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const Layout = ({ children, title = 'Dashboard' }: AdminLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setSidebarOpen(false);
    }, [location]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="lg:ml-80 flex-1 flex flex-col">
                <AdminHeader
                    title={title}
                    onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="flex-1 p-4 lg:p-6 bg-gray-100">
                    <div className="max-w-full pt-16">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

export default Layout;