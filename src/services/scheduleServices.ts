import api from '../api/api';
import type { ScheduleData, ScheduleEntry, SchedulePayload } from '../types/schedule';

export const scheduleService = {
    // Admin: jadwal per tahun ajaran + kelas (+ filter hari)
    async getData(params: {
        academic_year_id?: number;
        classroom_id?: number;
        day?: string;
    }): Promise<ScheduleData> {
        const response = await api.get('/schedule', { params });
        return response.data.data;
    },

    async create(data: SchedulePayload): Promise<ScheduleEntry> {
        const response = await api.post('/schedule/create', data);
        return response.data.data;
    },

    async update(id: number, data: SchedulePayload): Promise<ScheduleEntry> {
        const response = await api.put(`/schedule/${id}/update`, data);
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/schedule/${id}/delete`);
    },
};
