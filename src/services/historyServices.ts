import api from "../api/api";
import type { History } from "../types/history";


export const historyService = {
    getAll: async (): Promise<History[]> => {
        const res = await api.get("/history");
        return res.data.data;
    },

    getById: async (id: number): Promise<History> => {
        const res = await api.get(`/history/${id}`);
        return res.data.data;
    },

    create: async (data: { content: string }) => {
        const res = await api.post("/history/create", data);
        return res.data.data;
    },

    update: async (id: number, data: { content: string }) => {
        const res = await api.put(`/history/${id}/update`, data);
        return res.data.data;
    },

    delete: async (id: number) => {
        await api.delete(`/history/${id}/delete`);
    },
};
