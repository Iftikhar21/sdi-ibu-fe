import api from '../api/api';
import { getFilenameFromDisposition, saveBlob } from '../utils/fileDownload';
import type {
    AcademicDashboardData,
    GradeData,
    ReportCardData,
    Subject,
    SubjectPayload,
} from '../types/academic';

export const subjectService = {
    async exportSubjects(): Promise<void> {
        const response = await api.get('/subject/export', { responseType: 'blob' });
        saveBlob(
            response.data as Blob,
            getFilenameFromDisposition(
                response.headers['content-disposition'] as string | undefined,
                'data-mata-pelajaran.xlsx'
            )
        );
    },

    async downloadTemplate(): Promise<void> {
        const response = await api.get('/subject/template', { responseType: 'blob' });
        saveBlob(
            response.data as Blob,
            getFilenameFromDisposition(
                response.headers['content-disposition'] as string | undefined,
                'template-import-mata-pelajaran.xlsx'
            )
        );
    },

    async importSubjects(file: File): Promise<{ created: number; updated: number; message: string }> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/subject/import', formData);

        return {
            created: response.data.data?.created ?? 0,
            updated: response.data.data?.updated ?? 0,
            message: response.data.message ?? 'Impor mata pelajaran selesai.',
        };
    },

    async getAll(
        params: { search?: string; grade_level?: number | 'all'; is_active?: 'all' | boolean } = {}
    ): Promise<Subject[]> {
        const response = await api.get('/subject', { params });
        return response.data.data;
    },

    async getById(id: number): Promise<Subject> {
        const response = await api.get(`/subject/${id}`);
        return response.data.data;
    },

    async create(data: SubjectPayload): Promise<Subject> {
        const response = await api.post('/subject/create', data);
        return response.data.data;
    },

    async update(id: number, data: Partial<SubjectPayload>): Promise<Subject> {
        const response = await api.put(`/subject/${id}/update`, data);
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/subject/${id}/delete`);
    },
};

export const gradeService = {
    async exportGrades(
        academicYearId: number,
        classroomId: number,
        semester: number
    ): Promise<void> {
        const response = await api.get('/grade/export', {
            params: {
                academic_year_id: academicYearId,
                classroom_id: classroomId,
                semester,
            },
            responseType: 'blob',
        });
        saveBlob(
            response.data as Blob,
            getFilenameFromDisposition(
                response.headers['content-disposition'] as string | undefined,
                'nilai-siswa.xlsx'
            )
        );
    },

    async importGrades(
        file: File,
        academicYearId: number,
        classroomId: number,
        semester: number
    ): Promise<{ saved: number; cleared: number; message: string }> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('academic_year_id', String(academicYearId));
        formData.append('classroom_id', String(classroomId));
        formData.append('semester', String(semester));
        const response = await api.post('/grade/import', formData);

        return {
            saved: response.data.data?.saved ?? 0,
            cleared: response.data.data?.cleared ?? 0,
            message: response.data.message ?? 'Impor nilai selesai.',
        };
    },

    // Admin: daftar siswa + mata pelajaran + nilai pada satu kelas & tahun ajaran
    async getData(
        academicYearId?: number,
        classroomId?: number,
        semester?: number
    ): Promise<GradeData> {
        const response = await api.get('/grade', {
            params: {
                ...(academicYearId ? { academic_year_id: academicYearId } : {}),
                ...(classroomId ? { classroom_id: classroomId } : {}),
                ...(semester ? { semester } : {}),
            },
        });

        return response.data.data;
    },

    // Admin: simpan nilai (bulk) — nilai kosong berarti menghapus
    async save(
        academicYearId: number,
        classroomId: number,
        semester: number,
        scores: Array<{ student_id: number; subject_id: number; score: number | null }>
    ): Promise<{ saved: number; cleared: number; message: string }> {
        const response = await api.post('/grade', {
            academic_year_id: academicYearId,
            classroom_id: classroomId,
            semester,
            scores,
        });

        return {
            saved: response.data.data?.saved ?? 0,
            cleared: response.data.data?.cleared ?? 0,
            message: response.data.message ?? 'Nilai berhasil disimpan.',
        };
    },
};

export const reportCardService = {
    // Admin: rapor siswa (nilai per mapel + rekap absensi) untuk satu semester
    async getData(params: {
        academic_year_id?: number;
        classroom_id?: number;
        semester?: number;
        student_id?: number;
    }): Promise<ReportCardData> {
        const response = await api.get('/report-card', { params });
        return response.data.data;
    },
};

export const academicDashboardService = {
    // Admin: ringkasan akademik (siswa, kelas, nilai, absensi) per tahun ajaran
    async getData(params: {
        academic_year_id?: number;
        classroom_id?: number;
        semester?: number;
    } = {}): Promise<AcademicDashboardData> {
        const response = await api.get('/academic-dashboard', { params });
        return response.data.data;
    },
};
