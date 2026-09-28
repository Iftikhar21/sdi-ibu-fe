import api from '../api/api';
import { getFilenameFromDisposition, saveBlob } from '../utils/fileDownload';
import type { Classroom, ClassroomPayload } from '../types/classroom';

export const classroomService = {
    async getAll(params: { academic_year_id?: number; search?: string } = {}): Promise<Classroom[]> {
        const response = await api.get('/classroom', { params });
        return response.data.data;
    },

    async getById(id: number): Promise<Classroom> {
        const response = await api.get(`/classroom/${id}`);
        return response.data.data;
    },

    async create(data: ClassroomPayload): Promise<Classroom> {
        const response = await api.post('/classroom/create', data);
        return response.data.data;
    },

    async update(id: number, data: Partial<ClassroomPayload>): Promise<Classroom> {
        const response = await api.put(`/classroom/${id}/update`, data);
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/classroom/${id}/delete`);
    },

    // Admin: unduh seluruh data kelas ke Excel (.xlsx)
    async exportClasses(fallbackName = 'data-kelas.xlsx'): Promise<void> {
        const response = await api.get('/classroom/export', { responseType: 'blob' });

        const filename = getFilenameFromDisposition(
            response.headers['content-disposition'] as string | undefined,
            fallbackName
        );

        saveBlob(response.data as Blob, filename);
    },

    // Admin: unduh template import kelas (.xlsx)
    async downloadTemplate(fallbackName = 'template-import-kelas.xlsx'): Promise<void> {
        const response = await api.get('/classroom/template', { responseType: 'blob' });

        const filename = getFilenameFromDisposition(
            response.headers['content-disposition'] as string | undefined,
            fallbackName
        );

        saveBlob(response.data as Blob, filename);
    },

    // Admin: import data kelas dari file Excel/CSV (upsert per tahun ajaran + tingkat + kelas)
    async importClasses(file: File): Promise<{ created: number; updated: number; message: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/classroom/import', formData);

        return {
            created: response.data.data?.created ?? 0,
            updated: response.data.data?.updated ?? 0,
            message: response.data.message ?? 'Import selesai.',
        };
    },

    // Admin: daftar siswa yang sudah ditempatkan di kelas ini
    async getStudents(id: number): Promise<{
        classroom: Classroom;
        students: {
            id: number;
            assigned_at?: string | null;
            registration?: {
                id: number;
                full_name: string;
                nickname?: string;
                gender?: 'L' | 'P';
                birth_place?: string;
                birth_date?: string;
                contact_email?: string;
                phone?: string;
                status?: string;
            };
        }[];
    }> {
        const response = await api.get(`/classroom/${id}/students`);
        return response.data.data;
    },
};
