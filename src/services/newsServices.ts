import api from '../api/api';
import type { CreateNewsDto, News, UpdateNewsDto } from '../types/news';

export const newsService = {
    async getAll(): Promise<News[]> {
        const response = await api.get('/news');
        return response.data.data;
    },

    async getById(id: number): Promise<News> {
        const response = await api.get(`/news/${id}`);
        return response.data.data;
    },

    async create(data: CreateNewsDto): Promise<News> {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('content', data.content);

        if (data.thumbnail) {
            formData.append('thumbnail', data.thumbnail);
        }

        if (data.photos && data.photos.length > 0) {
            data.photos.forEach((photo, index) => {
                formData.append(`photos[${index}]`, photo);
            });
        }

        const response = await api.post('/news/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    async update(id: number, data: UpdateNewsDto): Promise<News> {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        // 🔥 WAJIB KIRIM (AMAN)
        if (data.title !== undefined) {
            formData.append('title', data.title);
        }

        if (data.content !== undefined) {
            formData.append('content', data.content);
        }

        // 🔥 REMOVE THUMBNAIL DULU
        if (data.remove_thumbnail) {
            formData.append('remove_thumbnail', '1');
        }

        // 🔥 BARU UPLOAD THUMBNAIL
        if (data.thumbnail instanceof File) {
            formData.append('thumbnail', data.thumbnail);
        }

        // ✅ FOTO BARU (PAKAI [])
        if (data.photos?.length) {
            data.photos.forEach(photo => {
                formData.append('photos[]', photo);
            });
        }

        // ✅ HAPUS FOTO (PAKAI [])
        if (data.deleted_photos?.length) {
            data.deleted_photos.forEach(id => {
                formData.append('deleted_photos[]', String(id));
            });
        }

        const response = await api.post(`/news/${id}/update`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/news/${id}/delete`);
    }
};