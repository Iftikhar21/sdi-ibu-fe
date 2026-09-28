import api from '../api/api';
import type { CreateFaqDto, Faq, UpdateFaqDto } from '../types/faq';

export const faqService = {
    async getAll(): Promise<Faq[]> {
        const response = await api.get('/faq');
        return response.data.data;
    },

    async getById(id: number): Promise<Faq> {
        const response = await api.get(`/faq/${id}`);
        return response.data.data;
    },

    async create(data: CreateFaqDto): Promise<Faq> {
        const response = await api.post('/faq/create', data);
        return response.data.data;
    },

    async update(id: number, data: UpdateFaqDto): Promise<Faq> {
        const response = await api.put(`/faq/${id}/update`, data);
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/faq/${id}/delete`);
    },
};
