import api from '../api/api';
import { getFilenameFromDisposition, saveBlob } from '../utils/fileDownload';
import type { Registration } from '../types/registration';

export type PlacementCandidate = Registration;

export interface PlacementFilters {
    search?: string;
    academic_year_id?: number | 'all';
    placement?: 'all' | 'placed' | 'unplaced';
}

export const classroomPlacementService = {
    // Admin: daftar pendaftar yang sudah Diterima (kandidat penempatan kelas)
    async getAll(
        params: PlacementFilters = {}
    ): Promise<{ items: PlacementCandidate[]; withoutAcademicYear: number }> {
        const response = await api.get('/admin/classroom-placements', { params });

        return {
            items: response.data.data,
            withoutAcademicYear: response.data.meta?.without_academic_year ?? 0
        };
    },

    // Admin: isi tahun ajaran untuk semua pendaftaran yang masih kosong
    async assignAcademicYear(
        academicYearId: number
    ): Promise<{ updated: number; message: string }> {
        const response = await api.post('/admin/classroom-placements/academic-year', {
            academic_year_id: academicYearId
        });

        return {
            updated: response.data.data?.updated ?? 0,
            message: response.data.message ?? 'Tahun ajaran berhasil diisi.'
        };
    },

    // Admin: export daftar penempatan (mengikuti filter aktif)
    async exportPlacements(params: PlacementFilters = {}): Promise<void> {
        const response = await api.get('/admin/classroom-placements/export', {
            params,
            responseType: 'blob'
        });

        const filename = getFilenameFromDisposition(
            response.headers['content-disposition'] as string | undefined,
            'data-penempatan-kelas.xlsx'
        );

        saveBlob(response.data as Blob, filename);
    },

    // Admin: unduh template import penempatan kelas
    async downloadTemplate(fallbackName = 'template-penempatan-kelas.xlsx'): Promise<void> {
        const response = await api.get('/admin/classroom-placements/template', {
            responseType: 'blob'
        });

        const filename = getFilenameFromDisposition(
            response.headers['content-disposition'] as string | undefined,
            fallbackName
        );

        saveBlob(response.data as Blob, filename);
    },

    // Admin: import penempatan kelas dari file Excel/CSV
    async importPlacements(
        file: File
    ): Promise<{ placed: number; moved: number; message: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/admin/classroom-placements/import', formData);

        return {
            placed: response.data.data?.placed ?? 0,
            moved: response.data.data?.moved ?? 0,
            message: response.data.message ?? 'Penempatan selesai.'
        };
    },
};
