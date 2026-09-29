import api from '../api/api';
import type { Contact, CreateContactDto, UpdateContactDto } from '../types/contact';

export const contactService = {

    async getAll(): Promise<Contact[]> {
        try {
            const response = await api.get('/contact');
            return [response.data.data]; // Wrap in array for consistency
        } catch (error: any) {
            if (error.response?.status === 404) {
                return [];
            }
            throw error;
        }
    },

    async getById(id: number): Promise<Contact> {
        const response = await api.get(`/contact/${id}`);
        return response.data.data;
    },

    async create(data: CreateContactDto): Promise<Contact> {
        const formData = new FormData();

        if (data.logo) {
            formData.append('logo', data.logo);
        }
        if (data.deskripsi) {
            formData.append('deskripsi', data.deskripsi);
        }
        if (data.alamat) {
            formData.append('alamat', data.alamat);
        }
        if (data.telepon) {
            formData.append('telepon', data.telepon);
        }
        if (data.email) {
            formData.append('email', data.email);
        }
        if (data.map_embed) {
            formData.append('map_embed', data.map_embed);
        }
        if (data.socials) {
            data.socials.forEach((social, index) => {
                formData.append(`socials[${index}][platform]`, social.platform);
                formData.append(`socials[${index}][url]`, social.url);
            });
        }

        const response = await api.post('/contact/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    // contactServices.ts - Perbaiki update method
    async update(id: number, data: UpdateContactDto): Promise<Contact> {
        const formData = new FormData();

        // SELALU append semua field text
        if (data.deskripsi !== undefined) formData.append('deskripsi', data.deskripsi);
        if (data.alamat !== undefined) formData.append('alamat', data.alamat);
        if (data.telepon !== undefined) formData.append('telepon', data.telepon);
        if (data.email !== undefined) formData.append('email', data.email);
        if (data.map_embed !== undefined) formData.append('map_embed', data.map_embed);

        // SOCIALS: Kirim sebagai JSON string
        console.log('Socials data to send:', data.socials);
        if (data.socials !== undefined) {
            formData.append('socials', JSON.stringify(data.socials));
        } else {
            formData.append('socials', '[]'); // Kirim array kosong jika undefined
        }

        // LOGO
        if (data.logo instanceof File) {
            formData.append('logo', data.logo);
        }
        if (data.remove_logo) {
            formData.append('remove_logo', '1');
        }

        // Debug: Tampilkan semua entries
        console.log('=== FORM DATA CONTENTS ===');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(key, ':', 'File -', value.name, '(', value.size, 'bytes)');
            } else {
                console.log(key, ':', value);
            }
        }

        const response = await api.post(`/contact/${id}/update`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Update response:', response.data);
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/contact/${id}/delete`);
    }
};
