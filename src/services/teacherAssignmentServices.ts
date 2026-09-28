import api from '../api/api';
import type { TeacherAssignmentData } from '../types/teacherAssignment';

export const teacherAssignmentService = {
    // Admin: penugasan wali kelas + guru pengampu pada satu kelas & tahun ajaran
    async getData(params: {
        academic_year_id?: number;
        classroom_id?: number;
    }): Promise<TeacherAssignmentData> {
        const response = await api.get('/teacher-assignment', { params });
        return response.data.data;
    },

    // Admin: simpan / kosongkan wali kelas (teacher_id null = kosongkan)
    async saveHomeroom(
        academicYearId: number,
        classroomId: number,
        teacherId: number | null
    ): Promise<{ message: string }> {
        const response = await api.post('/teacher-assignment/homeroom', {
            academic_year_id: academicYearId,
            classroom_id: classroomId,
            teacher_id: teacherId,
        });

        return { message: response.data.message };
    },

    // Admin: simpan guru pengampu beberapa mata pelajaran sekaligus
    async saveTeaching(
        academicYearId: number,
        classroomId: number,
        assignments: Array<{ subject_id: number; teacher_id: number | null }>
    ): Promise<{ saved: number; cleared: number; message: string }> {
        const response = await api.post('/teacher-assignment/teaching', {
            academic_year_id: academicYearId,
            classroom_id: classroomId,
            assignments,
        });

        return {
            saved: response.data.data?.saved ?? 0,
            cleared: response.data.data?.cleared ?? 0,
            message: response.data.message ?? 'Penugasan tersimpan.',
        };
    },
};
