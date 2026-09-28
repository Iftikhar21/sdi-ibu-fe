export interface Subject {
    id: number;
    code: string;
    name: string;
    grade_level: number | null;
    grade_label?: string;
    is_active: boolean;
}

export interface SubjectPayload {
    code: string;
    name: string;
    grade_level?: number | null;
    is_active?: boolean;
}

export interface GradeClassroom {
    id: number;
    display_name: string;
    grade_level: number;
    filled: number;
}

export interface GradeStudent {
    id: number;
    full_name: string;
    nis: string | null;
    status: string;
    status_label: string;
}

export interface GradeSubject {
    id: number;
    code: string;
    name: string;
    grade_level: number | null;
    grade_label: string;
}

export interface GradeEntry {
    student_id: number;
    subject_id: number;
    score: number;
}

export interface GradeData {
    academic_years: Array<{ id: number; name: string; is_active: boolean }>;
    academic_year: { id: number; name: string } | null;
    classrooms: GradeClassroom[];
    classroom: { id: number; display_name: string; grade_level: number } | null;
    semester: number;
    semesters: Record<string, string>;
    students: GradeStudent[];
    subjects: GradeSubject[];
    grades: GradeEntry[];
}

export interface ReportCardSubject {
    subject_id: number;
    code: string;
    name: string;
    score: number | null;
}

export interface ReportCardStudentRow {
    id: number;
    full_name: string;
    nis: string | null;
    filled: number;
    average: number | null;
}

export interface ReportCardData {
    academic_years: Array<{ id: number; name: string; is_active: boolean }>;
    academic_year: { id: number; name: string } | null;
    classrooms: GradeClassroom[];
    classroom: { id: number; display_name: string; grade_level: number } | null;
    semester: number;
    semesters: Record<string, string>;
    period: { from: string | null; to: string | null };
    students: ReportCardStudentRow[];
    student: {
        id: number;
        full_name: string;
        nis: string | null;
        classroom: string;
    } | null;
    subjects: ReportCardSubject[];
    attendance: {
        hadir: number;
        izin: number;
        sakit: number;
        alpa: number;
        total: number;
    } | null;
    average: number | null;
    /** Nama wali kelas dari penugasan guru (bila sudah diatur). */
    homeroom_teacher: string | null;
}

export interface AcademicDashboardClassRow {
    id: number;
    display_name: string;
    grade_level: number;
    quota: number;
    filled: number;
    available: number;
    students: number;
}

export interface AcademicDashboardData {
    academic_years: Array<{ id: number; name: string; is_active: boolean }>;
    academic_year: { id: number; name: string } | null;
    semester: number;
    semesters: Record<string, string>;
    period: { from: string | null; to: string | null };
    classrooms: Array<{ id: number; display_name: string; grade_level: number }>;
    classroom: { id: number; display_name: string; grade_level: number } | null;
    students: {
        active_in_year: number;
        active_total: number;
        inactive: number;
        graduated: number;
    };
    unplaced_students: number;
    classes: {
        total: number;
        capacity: number;
        filled: number;
        available: number;
        students: number;
        rows: AcademicDashboardClassRow[];
    };
    grades: {
        filled: number;
        average: number | null;
        students_without_score: number;
        by_subject: Array<{
            subject_id: number | null;
            code: string | null;
            name: string | null;
            filled: number;
            average: number;
            highest: number;
            lowest: number;
        }>;
        by_class: Array<{
            classroom_id: number;
            display_name: string;
            filled: number;
            average: number | null;
        }>;
    };
    attendance: {
        hadir: number;
        izin: number;
        sakit: number;
        alpa: number;
        total: number;
        rate: number | null;
        by_class: Array<{
            classroom_id: number;
            display_name: string;
            hadir: number;
            izin: number;
            sakit: number;
            alpa: number;
            total: number;
            rate: number | null;
        }>;
    };
}
