import api from '../api/api';
import type { Registration, RegistrationWithUser } from '../types/registration';
import { getFilenameFromDisposition, saveBlob } from '../utils/fileDownload';

// Nama file cadangan dipakai bila header Content-Disposition tidak terbaca
// (mis. dibatasi CORS), supaya file tetap tersimpan dengan nama yang jelas.
const buildExportFallbackName = () => {
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;

    return `data-pendaftaran-${stamp}.xlsx`;
};

export const registrationService = {
    async getAll(): Promise<Registration[]> {
        const response = await api.get("/registrations", {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.data;
    },

    async getById(id: number): Promise<Registration> {
        const response = await api.get(`/registrations/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.data;
    },

    async create(formData: FormData): Promise<Registration> {
        const response = await api.post("/registrations", formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.data;
    },

    async getAllRegistrationsWithParams(params?: string): Promise<any> {
        const url = `/admin/registrations${params ? `?${params}` : ''}`;
        const response = await api.get(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Admin: Get registration by ID
    async getRegistrationById(id: number): Promise<RegistrationWithUser> {
        const response = await api.get(`/admin/registrations/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.data;
    },

    // Admin: Update registration status
    async updateStatus(id: number, data: { status: string; notes?: string }): Promise<any> {
        const response = await api.put(`/admin/registrations/${id}/status`, data, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Admin: tempatkan / pindahkan siswa ke kelas tertentu
    async assignClassroom(id: number, classroomId: number): Promise<{
        success: boolean;
        message: string;
    }> {
        const response = await api.post(`/admin/registrations/${id}/classroom`, {
            classroom_id: classroomId
        });

        return response.data;
    },

    // Admin: isi / ubah tahun ajaran pada satu pendaftaran
    async setAcademicYear(id: number, academicYearId: number): Promise<{
        success: boolean;
        message: string;
    }> {
        const response = await api.put(`/admin/registrations/${id}/academic-year`, {
            academic_year_id: academicYearId
        });

        return response.data;
    },

    // Admin: Export data pendaftar ke CSV (mengikuti filter yang aktif)
    async exportRegistrations(params?: string): Promise<void> {
        const url = `/admin/registrations/export${params ? `?${params}` : ''}`;
        const response = await api.get(url, { responseType: 'blob' });

        const filename = getFilenameFromDisposition(
            response.headers['content-disposition'] as string | undefined,
            buildExportFallbackName()
        );

        saveBlob(response.data as Blob, filename);
    },

    // Admin: unduh semua dokumen pendukung pendaftar dalam bentuk ZIP
    async downloadRegistrationDocuments(id: number, fallbackName = 'dokumen-pendaftaran.zip'): Promise<void> {
        const response = await api.get(`/admin/registrations/${id}/documents/download`, {
            responseType: 'blob'
        });

        const filename = getFilenameFromDisposition(
            response.headers['content-disposition'] as string | undefined,
            fallbackName
        );

        saveBlob(response.data as Blob, filename);
    }
};
