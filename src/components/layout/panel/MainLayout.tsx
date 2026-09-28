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
        <div className={`min-h-screen bg-surface-muted flex flex-col ${location.pathname.startsWith('/admin') ? 'admin-panel' : ''}`}>
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
                <AdminHeader
                    title={title}
                    onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="flex-1 min-w-0 p-4 bg-surface-muted">
                    <div className="max-w-full pt-16 lg:pt-14">
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
