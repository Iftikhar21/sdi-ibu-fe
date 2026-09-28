import api from '../api/api';
import type { CreateGalleryDto, Gallery, UpdateGalleryDto } from '../types/gallery';

export const galleryService = {
    async getAll(): Promise<Gallery[]> {
        const response = await api.get('/gallery');
        return response.data.data;
    },

    async getById(id: number): Promise<Gallery> {
        const response = await api.get(`/gallery/${id}`);
        return response.data.data;
    },

    async create(data: CreateGalleryDto): Promise<Gallery> {
        const formData = new FormData();

        formData.append('gallery_category_id', String(data.gallery_category_id));
        formData.append('title', data.title);
        formData.append('description', data.description ?? '');
        formData.append('sort_order', String(data.sort_order ?? 0));
        formData.append('is_active', data.is_active === false ? '0' : '1');

        data.photos.forEach((photo) => formData.append('photos[]', photo));

        const response = await api.post('/gallery/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data;
    },

    async update(id: number, data: UpdateGalleryDto): Promise<Gallery> {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        if (data.gallery_category_id !== undefined) {
            formData.append('gallery_category_id', String(data.gallery_category_id));
        }
        if (data.title !== undefined) {
            formData.append('title', data.title);
        }
        if (data.description !== undefined) {
            formData.append('description', data.description);
        }
        if (data.sort_order !== undefined) {
            formData.append('sort_order', String(data.sort_order));
        }
        if (data.is_active !== undefined) {
            formData.append('is_active', data.is_active ? '1' : '0');
        }

        data.photos?.forEach((photo) => formData.append('photos[]', photo));

        data.deleted_photo_ids?.forEach((photoId) =>
            formData.append('deleted_photo_ids[]', String(photoId))
        );

        const response = await api.post(`/gallery/${id}/update`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/gallery/${id}/delete`);
    },

    // Publik: daftar album untuk halaman /galeri (dengan filter & paging)
    async getPublicList(
        params: { page?: number; per_page?: number; category?: string | number } = {}
    ): Promise<{
        data: Gallery[];
        meta: { current_page: number; last_page: number; per_page: number; total: number };
    }> {
        const search = new URLSearchParams();

        if (params.page) search.set('page', String(params.page));
        if (params.per_page) search.set('per_page', String(params.per_page));
        if (params.category && params.category !== 'all') {
            search.set('category', String(params.category));
        }

        const query = search.toString();
        const response = await api.get(`/gallery-list${query ? `?${query}` : ''}`);

        return {
            data: response.data.data,
            meta: response.data.meta,
        };
    },

    // Publik: detail satu album beserta seluruh fotonya (dipakai lightbox)
    async getPublicDetail(id: number): Promise<Gallery> {
        const response = await api.get(`/gallery-detail/${id}`);
        return response.data.data;
    },
};
