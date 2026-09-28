import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types/auth";
import api from "../api/api";

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    changePassword: (
        currentPassword: string,
        password: string,
        confirmation: string
    ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        let parsedUser: User | null = null;
        if (storedUser) {
            try {
                parsedUser = JSON.parse(storedUser);
            } catch {
                parsedUser = null;
            }
        }

        // Jika user tidak valid (tidak ada role), hapus localStorage dan logout
        if (
            storedToken &&
            parsedUser &&
            parsedUser.role &&
            parsedUser.role.role_name
        ) {
            setToken(storedToken);
            setUser(parsedUser);
            api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
            delete api.defaults.headers.common["Authorization"];
        }

        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post("/login", { email, password });

        const { token, user } = res.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        api.defaults.headers.common[
            "Authorization"
        ] = `Bearer ${token}`;

        setToken(token);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        delete api.defaults.headers.common["Authorization"];

        setToken(null);
        setUser(null);
    };

    // Ganti password sendiri; dipakai juga untuk wajib ganti di login pertama
    const changePassword = async (
        currentPassword: string,
        password: string,
        confirmation: string
    ) => {
        await api.post("/change-password", {
            current_password: currentPassword,
            password,
            password_confirmation: confirmation,
        });

        setUser((previous) => {
            if (!previous) return previous;

            const updated = { ...previous, must_change_password: false };

            localStorage.setItem("user", JSON.stringify(updated));

            return updated;
        });
    };
    

    if (loading) return null; // atau loader

    return (
        <AuthContext.Provider value={{ user, token, login, logout, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
