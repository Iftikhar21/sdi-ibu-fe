import api from '../api/api';
import type {
    GraduateListResult,
    GraduationCandidatesResult,
    PublicGraduatesResult
} from '../types/graduation';

export const graduationService = {
    // Admin: calon lulusan (siswa aktif kelas 6) pada tahun ajaran tertentu
    async getCandidates(academicYearId?: number): Promise<GraduationCandidatesResult> {
        const response = await api.get('/admin/graduations', {
            params: academicYearId ? { academic_year_id: academicYearId } : {}
        });

        return response.data.data;
    },

    // Admin: proses kelulusan massal
    async graduate(
        studentIds: number[],
        academicYearId: number,
        graduationDate?: string
    ): Promise<{ graduated: number; message: string }> {
        const response = await api.post('/admin/graduations', {
            student_ids: studentIds,
            academic_year_id: academicYearId,
            graduation_date: graduationDate || null
        });

        return {
            graduated: response.data.data?.graduated ?? 0,
            message: response.data.message ?? 'Kelulusan berhasil diproses.'
        };
    },

    // Admin: daftar lulusan
    async getGraduates(params: { academic_year_id?: number | 'all'; search?: string } = {}) {
        const response = await api.get<{ data: GraduateListResult }>(
            '/admin/graduations/graduates',
            { params }
        );

        return response.data.data;
    },

    // Admin: batalkan kelulusan (siswa kembali aktif)
    async cancel(studentId: number): Promise<{ message: string }> {
        const response = await api.delete(`/admin/graduations/${studentId}`);

        return { message: response.data.message };
    },

    // Publik: profil lulusan untuk website
    async getPublic(academicYearId?: number): Promise<PublicGraduatesResult> {
        const response = await api.get('/profil/lulusan', {
            params: academicYearId ? { academic_year_id: academicYearId } : {}
        });

        return response.data.data;
    }
};
