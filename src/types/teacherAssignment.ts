export interface AssignmentClassroom {
    id: number;
    display_name: string;
    grade_level: number;
    filled: number;
}

export interface AssignmentTeacher {
    id: number;
    name: string;
    position: string | null;
}

export interface AssignmentSubject {
    subject_id: number;
    code: string;
    name: string;
    teacher_id: number | null;
    teacher: string | null;
}

export interface TeacherAssignmentData {
    academic_years: Array<{ id: number; name: string; is_active: boolean }>;
    academic_year: { id: number; name: string } | null;
    classrooms: AssignmentClassroom[];
    classroom: { id: number; display_name: string; grade_level: number } | null;
    teachers: AssignmentTeacher[];
    homeroom: { id: number; teacher_id: number; teacher: string | null } | null;
    subjects: AssignmentSubject[];
}
