import api from '../api/api';
import type { Activity, ActivityPayload, ActivityType } from '../types/activity';

export const activityService = {
    async getAll(type?: ActivityType): Promise<Activity[]> {
        const response = await api.get('/activity', {
            params: type ? { type } : undefined,
        });
        return response.data.data;
    },

    async getById(id: number): Promise<Activity> {
        const response = await api.get(`/activity/${id}`);
        return response.data.data;
    },

    async create(data: ActivityPayload): Promise<Activity> {
        const formData = new FormData();
        formData.append('type', data.type);
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('sort_order', String(data.sort_order ?? 0));
        formData.append('is_active', data.is_active === false ? '0' : '1');
        if (data.image) formData.append('image', data.image);

        const response = await api.post('/activity/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    async update(id: number, data: Partial<ActivityPayload>): Promise<Activity> {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        if (data.type !== undefined) formData.append('type', data.type);
        if (data.title !== undefined) formData.append('title', data.title);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.sort_order !== undefined) formData.append('sort_order', String(data.sort_order));
        if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
        if (data.image instanceof File) formData.append('image', data.image);

        const response = await api.post(`/activity/${id}/update`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/activity/${id}/delete`);
    },

    // Publik: dipakai halaman landing bila perlu memuat ulang
    async getPublic(type?: ActivityType): Promise<Activity[]> {
        const response = await api.get('/kegiatan-list', {
            params: type ? { type } : undefined,
        });
        return response.data.data;
    },
};
