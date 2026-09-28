import api from '../api/api';
import type { AttendanceData, AttendanceRecap, AttendanceStatus } from '../types/attendance';

export const attendanceService = {
    // Admin: absensi satu kelas pada satu tanggal
    async getData(params: {
        academic_year_id?: number;
        classroom_id?: number;
        date?: string;
    }): Promise<AttendanceData> {
        const response = await api.get('/attendance', { params });
        return response.data.data;
    },

    // Admin: simpan absensi (bulk)
    async save(
        academicYearId: number,
        classroomId: number,
        date: string,
        records: Array<{ student_id: number; status: AttendanceStatus; notes?: string }>
    ): Promise<{ saved: number; summary: Record<AttendanceStatus, number>; message: string }> {
        const response = await api.post('/attendance', {
            academic_year_id: academicYearId,
            classroom_id: classroomId,
            date,
            records,
        });

        return {
            saved: response.data.data?.saved ?? 0,
            summary: response.data.data?.summary ?? { hadir: 0, izin: 0, sakit: 0, alpa: 0 },
            message: response.data.message ?? 'Absensi berhasil disimpan.',
        };
    },

    // Admin: rekap kehadiran per siswa pada periode tertentu
    async getRecap(params: {
        academic_year_id: number;
        classroom_id: number;
        from?: string;
        to?: string;
    }): Promise<AttendanceRecap> {
        const response = await api.get('/attendance/recap', { params });
        return response.data.data;
    },
};
