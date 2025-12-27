import api from "../api/api";

export interface VisionMision {
    id: number;
    vision?: string;
    missions?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface CreateVisionMisionDto {
    vision?: string;
    missions?: string[];
}

export interface UpdateVisionMisionDto {
    vision?: string;
    missions?: string[];
}

export const visionMisionService = {
    async getAll(): Promise<VisionMision[]> {
        const response = await api.get('/vision-mision');
        return response.data.data;
    },

    async getById(id: number): Promise<VisionMision> {
        const response = await api.get(`/vision-mision/${id}`);
        return response.data.data;
    },

    async create(data: CreateVisionMisionDto): Promise<VisionMision> {
        const response = await api.post('/vision-mision/create', data);
        return response.data.data;
    },

    async update(id: number, data: UpdateVisionMisionDto): Promise<VisionMision> {
        const response = await api.put(`/vision-mision/${id}/update`, data);
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/vision-mision/${id}/delete`);
    }
};