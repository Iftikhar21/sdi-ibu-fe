// services/userService.ts
import api from '../api/api';

interface ProfileData {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
}

export const userService = {
    // Get user profile - sesuai response dari controller
    getProfile: async (): Promise<any> => {
        const response = await api.get('/user/profile');
        return response.data;
    },

    // Update user profile - sesuai request controller
    updateProfile: async (data: ProfileData): Promise<any> => {
        const response = await api.put('/user/profile', data);
        return response.data;
    }
};