import api from '../api/api';

export interface PromotionClassroom {
    id: number;
    display_name: string;
    grade_level: number;
    quota: number;
    filled: number;
    available: number;
}

export interface PromotionRow {
    student_id: number;
    full_name: string;
    nis: string | null;
    status: string;
    status_label: string;
    from_classroom_id: number;
    from_classroom_label: string;
    from_grade_level: number;
    suggested_classroom_id: number | null;
    suggested_classroom_label: string | null;
}

export interface PromotionSourceClassroom {
    id: number;
    display_name: string;
    grade_level: number;
}

export interface PromotionData {
    academic_years: Array<{ id: number; name: string; is_active: boolean }>;
    from_academic_year: { id: number; name: string } | null;
    to_academic_year: { id: number; name: string } | null;
    classrooms: PromotionClassroom[];
    from_classrooms: PromotionSourceClassroom[];
    rows: PromotionRow[];
    total: number;
}

export const promotionService = {
    // Admin: daftar siswa yang bisa dinaikkan beserta usulan kelas tujuannya
    async getCandidates(
        fromAcademicYearId?: number,
        toAcademicYearId?: number
    ): Promise<PromotionData> {
        const response = await api.get('/admin/promotions', {
            params: {
                ...(fromAcademicYearId ? { from_academic_year_id: fromAcademicYearId } : {}),
                ...(toAcademicYearId ? { to_academic_year_id: toAcademicYearId } : {})
            }
        });

        return response.data.data;
    },

    // Admin: proses kenaikan kelas (bulk)
    async promote(
        fromAcademicYearId: number,
        toAcademicYearId: number,
        promotions: Array<{ student_id: number; classroom_id: number }>
    ): Promise<{ promoted: number; message: string }> {
        const response = await api.post('/admin/promotions', {
            from_academic_year_id: fromAcademicYearId,
            to_academic_year_id: toAcademicYearId,
            promotions
        });

        return {
            promoted: response.data.data?.promoted ?? 0,
            message: response.data.message ?? 'Kenaikan kelas berhasil diproses.'
        };
    }
};
