export type RoleName = "admin" | "user" | "guru";

export interface Role {
    id: number;
    role_name: RoleName;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role_id: number;
    role: Role;
    /** Wajib ganti password saat login pertama (akun baru dari admin). */
    must_change_password?: boolean;
}

export interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

export interface AuthStorage {
    user: User;
    token: string;
    expired_at: string;
}
