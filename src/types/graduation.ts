export interface GraduationCandidate {
    id: number;
    full_name: string;
    nis: string | null;
}

export interface GraduationGroup {
    classroom_id: number | null;
    classroom_label: string;
    students: GraduationCandidate[];
}

export interface GraduationYear {
    id: number;
    name: string;
    is_active?: boolean;
    total?: number;
}

export interface GraduationCandidatesResult {
    academic_years: GraduationYear[];
    academic_year: GraduationYear | null;
    total: number;
    groups: GraduationGroup[];
}

export interface Graduate {
    id: number;
    student_id: number | null;
    full_name: string | null;
    nis: string | null;
    gender: 'L' | 'P' | null;
    admission_year?: string | null;
    last_class?: string | null;
    graduation_year_id: number;
    graduation_year?: string | null;
    graduation_date?: string | null;
}

export interface GraduateListResult {
    academic_years: GraduationYear[];
    total: number;
    graduates: Graduate[];
}

/** Data lulusan untuk halaman publik (hanya field yang aman ditampilkan). */
export interface PublicGraduate {
    id: number | null;
    name: string | null;
    last_class: string | null;
}

export interface PublicGraduatesResult {
    years: GraduationYear[];
    academic_year: GraduationYear | null;
    total: number;
    graduates: PublicGraduate[];
}
