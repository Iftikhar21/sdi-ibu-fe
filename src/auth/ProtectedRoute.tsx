// components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { JSX } from "react";

export default function ProtectedRoute({
    children,
    role,
}: {
    children: JSX.Element;
    role?: string;
}) {
    const { user } = useAuth();
    const location = useLocation();


    // Jika tidak ada user, redirect ke login dengan state untuk kembali
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Jika user tidak punya role valid, anggap belum login
    if (!user.role || !user.role.role_name) {
        // Bersihkan localStorage agar tidak loop
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Jika role di-spesifikasikan dan user role tidak cocok
    if (role && user.role.role_name !== role) {
        // JANGAN redirect ke /forbidden, tapi redirect ke dashboard yang sesuai

        // Debug: console log untuk melihat apa yang terjadi
        console.log(`User role: ${user.role.role_name}, Required role: ${role}`);

        // Redirect ke dashboard sesuai role user
        if (user.role.role_name === "admin") {
            console.log("Redirecting admin to /admin/dashboard");
            return <Navigate to="/admin/dashboard" replace />;
        } else if (user.role.role_name === "user") {
            console.log("Redirecting user to /user/dashboard");
            return <Navigate to="/user/dashboard" replace />;
        }

        // Fallback ke forbidden jika role tidak dikenali
        return <Navigate to="/forbidden" replace />;
    }

    // Jika tidak ada role spesifik atau role cocok
    return children;
}