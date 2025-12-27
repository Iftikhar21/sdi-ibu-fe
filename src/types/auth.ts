export type RoleName = "admin" | "user";

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