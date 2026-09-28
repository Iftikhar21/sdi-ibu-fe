import type { AcademicYear } from './academicYear';
import type { Classroom } from './classroom';

export interface StudentClassHistory {
    id: number;
    student_id: number | null;
    classroom_id: number;
    academic_year_id: number;
    classroom?: Classroom | null;
    academic_year?: AcademicYear | null;
    is_active: boolean;
    assigned_at?: string | null;
    unassigned_at?: string | null;
}

export interface Student {
    id: number;
    registration_id: number;
    nis: string | null;
    full_name: string;
    gender: 'L' | 'P' | null;
    birth_place: string | null;
    birth_date: string | null;
    address: string | null;
    admission_year_id: number | null;
    admission_year?: AcademicYear | null;
    status: 'active' | 'inactive' | 'graduated';
    /** Label siap tampil, mis. "Aktif". */
    status_label?: string;
    /** Kelas yang sedang ditempati, mis. "1A". */
    classroom_label?: string | null;
    active_placement?: StudentClassHistory | null;
    class_histories?: StudentClassHistory[];
    /** Data pendaftaran asal (hanya ikut pada endpoint detail). */
    registration?: {
        id: number;
        full_name?: string;
        contact_email?: string | null;
        phone?: string | null;
        status?: string;
    } | null;
    created_at?: string;
    updated_at?: string;
}

export interface StudentPayload {
    nis?: string | null;
    full_name?: string;
    gender?: 'L' | 'P' | null;
    birth_place?: string | null;
    birth_date?: string | null;
    address?: string | null;
    admission_year_id?: number | null;
    status?: 'active' | 'inactive' | 'graduated';
}

/** Pilihan status siswa yang tersedia di admin. */
export const studentStatuses: { value: Student['status']; label: string }[] = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' },
    { value: 'graduated', label: 'Lulus' },
];
