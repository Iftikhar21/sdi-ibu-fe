import api from '../api/api';
import type { Student, StudentPayload } from '../types/student';

export const studentService = {
    async getAll(
        params: { search?: string; status?: string; admission_year_id?: number | 'all' } = {}
    ): Promise<Student[]> {
        const response = await api.get('/student', { params });
        return response.data.data;
    },

    async getById(id: number): Promise<Student> {
        const response = await api.get(`/student/${id}`);
        return response.data.data;
    },

    async update(id: number, data: StudentPayload): Promise<Student> {
        const response = await api.put(`/student/${id}/update`, data);
        return response.data.data;
    },

    // Admin: bentuk data siswa dari pendaftaran yang sudah Diterima (idempotent)
    async createFromRegistration(
        registrationId: number
    ): Promise<{ student: Student; message: string; created: boolean }> {
        const response = await api.post(`/admin/registrations/${registrationId}/student`);

        return {
            student: response.data.data,
            message: response.data.message,
            created: response.status === 201,
        };
    },
};
