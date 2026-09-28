import type { AcademicYear } from './academicYear';

export interface Classroom {
    id: number;
    academic_year_id: number;
    academic_year?: AcademicYear | null;
    grade_level: number;
    name: string;
    /** Nama tampil, mis. "1A" */
    display_name?: string;
    quota: number;
    /** Jumlah siswa yang sudah ditempatkan di kelas ini. */
    filled_count?: number;
    /** Sisa kuota (quota - filled_count). */
    available_count?: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ClassroomPayload {
    academic_year_id: number;
    grade_level: number;
    name: string;
    quota: number;
    is_active?: boolean;
}

/** Tingkat kelas yang tersedia (1 sampai 6). */
export const gradeLevels = [1, 2, 3, 4, 5, 6];
