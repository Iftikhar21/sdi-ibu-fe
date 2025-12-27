import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { JSX } from "react";

export default function GuestRoute({ children }: { children: JSX.Element }) {
    const { user } = useAuth();

    if (user) {
        return user.role.role_name === "admin"
            ? <Navigate to="/admin/dashboard" replace />
            : <Navigate to="/" replace />;
    }

    return children;
}
