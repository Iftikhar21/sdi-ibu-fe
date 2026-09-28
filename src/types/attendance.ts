export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpa';

export interface AttendanceClassroom {
    id: number;
    display_name: string;
    grade_level: number;
    filled: number;
}

export interface AttendanceStudent {
    id: number;
    full_name: string;
    nis: string | null;
    status: AttendanceStatus | null;
    notes: string | null;
}

export interface AttendanceSummary {
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
}

export interface AttendanceData {
    academic_years: Array<{ id: number; name: string; is_active: boolean }>;
    academic_year: { id: number; name: string } | null;
    classrooms: AttendanceClassroom[];
    classroom: { id: number; display_name: string; grade_level: number } | null;
    date: string;
    statuses: Record<AttendanceStatus, string>;
    students: AttendanceStudent[];
    attendances: Array<{
        student_id: number;
        status: AttendanceStatus;
        status_label: string;
        notes: string | null;
    }>;
    summary: AttendanceSummary;
}

export interface AttendanceRecapRow {
    student_id: number;
    full_name: string;
    nis: string | null;
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
    total: number;
}

export interface AttendanceRecap {
    academic_year: { id: number; name: string } | null;
    classroom: { id: number; display_name: string } | null;
    from: string | null;
    to: string | null;
    summary: AttendanceSummary;
    students: AttendanceRecapRow[];
}
