import api from '../api/api';
import type { Registration, RegistrationWithUser } from '../types/registration';

export const registrationService = {
    async getAll(): Promise<Registration[]> {
        const response = await api.get("/registrations", {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.data;
    },

    async getById(id: number): Promise<Registration> {
        const response = await api.get(`/registrations/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.data;
    },

    async create(formData: FormData): Promise<Registration> {
        const response = await api.post("/registrations", formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.data;
    },

    async getAllRegistrationsWithParams(params?: string): Promise<any> {
        const url = `/admin/registrations${params ? `?${params}` : ''}`;
        const response = await api.get(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Admin: Get registration by ID
    async getRegistrationById(id: number): Promise<RegistrationWithUser> {
        const response = await api.get(`/admin/registrations/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.data;
    },

    // Admin: Update registration status
    async updateStatus(id: number, data: { status: string; notes?: string }): Promise<any> {
        const response = await api.put(`/admin/registrations/${id}/status`, data, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }
};