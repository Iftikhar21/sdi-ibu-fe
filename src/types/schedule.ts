export interface ScheduleEntry {
    id: number;
    day: string;
    day_label: string;
    start_time: string;
    end_time: string;
    subject_id: number;
    subject: string | null;
    subject_code: string | null;
    teacher_id: number;
    teacher: string | null;
    classroom_id: number;
    classroom: string | null;
}

export interface ScheduleData {
    academic_years: Array<{ id: number; name: string; is_active: boolean }>;
    academic_year: { id: number; name: string } | null;
    classrooms: Array<{ id: number; display_name: string; grade_level: number }>;
    classroom: { id: number; display_name: string; grade_level: number } | null;
    teachers: Array<{ id: number; name: string; position: string | null }>;
    subjects: Array<{ id: number; code: string; name: string; grade_level: number | null }>;
    homeroom_teacher: string | null;
    /** Map subject_id -> teacher_id dari penugasan guru (STEP 16). */
    subject_teachers: Record<string, number>;
    days: Record<string, string>;
    schedules: ScheduleEntry[];
}

export interface SchedulePayload {
    academic_year_id: number;
    classroom_id: number;
    subject_id: number;
    teacher_id: number;
    day: string;
    start_time: string;
    end_time: string;
}
