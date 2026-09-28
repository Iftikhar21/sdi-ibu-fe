import api from '../api/api';
import type { AcademicYear, AcademicYearPayload } from '../types/academicYear';

export const academicYearService = {
    async getAll(): Promise<AcademicYear[]> {
        const response = await api.get('/academic-year');
        return response.data.data;
    },

    async getById(id: number): Promise<AcademicYear> {
        const response = await api.get(`/academic-year/${id}`);
        return response.data.data;
    },

    async create(data: AcademicYearPayload): Promise<AcademicYear> {
        const response = await api.post('/academic-year/create', data);
        return response.data.data;
    },

    async update(id: number, data: Partial<AcademicYearPayload>): Promise<AcademicYear> {
        const response = await api.put(`/academic-year/${id}/update`, data);
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/academic-year/${id}/delete`);
    },

    // Admin: copy struktur kelas (kelas + kuota) dari tahun ajaran lain
    async copyClassrooms(
        toId: number,
        fromAcademicYearId: number
    ): Promise<{ created: number; skipped: number; message: string }> {
        const response = await api.post(`/academic-year/${toId}/copy-classrooms`, {
            from_academic_year_id: fromAcademicYearId,
        });

        return {
            created: response.data.data?.created ?? 0,
            skipped: response.data.data?.skipped ?? 0,
            message: response.data.message ?? 'Copy struktur kelas selesai.',
        };
    },
};
