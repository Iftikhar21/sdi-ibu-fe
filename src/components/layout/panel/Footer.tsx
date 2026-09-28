// components/layout/Footer.tsx (Minimalis)
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-surface border-t border-line py-3 px-4">
            <div className="text-center text-sm text-muted">
                <p>© {new Date().getFullYear()} SDI Ibu. Hak cipta dilindungi.</p>
            </div>
        </footer>
    );
};

export default Footer;