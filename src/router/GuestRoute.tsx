import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { JSX } from "react";

export default function GuestRoute({ children }: { children: JSX.Element }) {
    const { user } = useAuth();

    if (user) {
        const dashboardPath = user.role.role_name === "admin"
            ? "/admin/dashboard"
            : user.role.role_name === "guru"
                ? "/guru/dashboard"
                : "/user/dashboard";

        return <Navigate to={dashboardPath} replace />;
    }

    return children;
}
