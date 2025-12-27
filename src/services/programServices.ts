import api from "../api/api";
import type { CreateProgramDto, Program, UpdateProgramDto } from "../types/program";

export const programService = {
    async getAll(): Promise<Program[]> {
        const response = await api.get('/program');
        return response.data.data;
    },

    async getById(id: number): Promise<Program> {
        const response = await api.get(`/program/${id}`);
        return response.data.data;
    },

    async create(data: CreateProgramDto): Promise<Program> {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('status', data.status);

        if (data.thumbnail) {
            formData.append('thumbnail', data.thumbnail);
        }

        const response = await api.post('/program/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    async update(id: number, data: UpdateProgramDto): Promise<Program> {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        if (data.title !== undefined) {
            formData.append('title', data.title);
        }
        if (data.description !== undefined) {
            formData.append('description', data.description);
        }
        if (data.status !== undefined) {
            formData.append('status', data.status);
        }
        if (data.thumbnail !== undefined) {
            if (data.thumbnail === null) {
                formData.append('thumbnail', '');
            } else if (data.thumbnail instanceof File) {
                formData.append('thumbnail', data.thumbnail);
            }
        }

        const response = await api.post(`/program/${id}/update`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/program/${id}/delete`);
    }
};