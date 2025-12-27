// services/adminService.ts
import api from '../api/api';

interface ProfileData {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
}

export const adminService = {
    // Get admin profile - sesuai response dari controller
    getProfile: async (): Promise<any> => {
        const response = await api.get('/admin/profile');
        return response.data;
    },

    // Update admin profile - sesuai request controller
    updateProfile: async (data: ProfileData): Promise<any> => {
        const response = await api.put('/admin/profile', data);
        return response.data;
    }
};