import api from '../api/api';
import type { GalleryCategory, GalleryCategoryDto } from '../types/gallery';

export const galleryCategoryService = {
    async getAll(): Promise<GalleryCategory[]> {
        const response = await api.get('/gallery-category');
        return response.data.data;
    },

    async create(data: GalleryCategoryDto): Promise<GalleryCategory> {
        const response = await api.post('/gallery-category/create', data);
        return response.data.data;
    },

    async update(id: number, data: Partial<GalleryCategoryDto>): Promise<GalleryCategory> {
        const response = await api.put(`/gallery-category/${id}/update`, data);
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/gallery-category/${id}/delete`);
    },

    // Simpan urutan kategori sekaligus (susunan id menentukan urutannya)
    async reorder(ids: number[]): Promise<GalleryCategory[]> {
        const response = await api.post('/gallery-category/reorder', { ids });
        return response.data.data;
    },

    // Publik: kategori aktif untuk filter di halaman /galeri
    async getPublic(): Promise<GalleryCategory[]> {
        const response = await api.get('/gallery-categories');
        return response.data.data;
    },
};
