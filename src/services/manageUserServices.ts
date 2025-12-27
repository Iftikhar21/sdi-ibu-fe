import api from "../api/api";
import type { User } from "../types";
import type { Role } from "../types/auth";
import type { UserFormData } from "../types/user";

export const userService = {

    getRoles: async (): Promise<Role[]> => {
        const response = await api.get('/manage-user/roles');
        return response.data;
    },

    async getAll(): Promise<User[]> {
        const response = await api.get("/manage-user");
        return response.data.data;
    },

    async getById(id: number): Promise<User> {
        const response = await api.get(`/manage-user/${id}`);
        return response.data.data;
    },

    async getAdmins(): Promise<User[]> {
        const response = await api.get("/manage-user/admin");
        return response.data.data;
    },

    async getUsers(): Promise<User[]> {
        const response = await api.get("/manage-user/pengguna");
        return response.data.data;
    },

    async create(data: UserFormData): Promise<User> {
        const response = await api.post("/manage-user/create", data);
        return response.data.data;
    },

    async update(id: number, data: Partial<UserFormData>): Promise<User> {
        const response = await api.put(`/manage-user/${id}/update`, data);
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/manage-user/${id}/delete`);
    },
    async resetPassword(id: number) {
        return api.post(`/manage-user/${id}/reset-password`);
    }

};