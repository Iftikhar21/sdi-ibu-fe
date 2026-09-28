import api from '../api/api';
import { getFilenameFromDisposition, saveBlob } from '../utils/fileDownload';
import type {
    AboutSchool,
    EducationValue,
    Legality,
    OrganizationStructure,
    Principal,
    Teacher,
} from '../types/schoolProfile';

/* ------------------------------------------------------------------ */
/* Tentang Sekolah IBU                                                 */
/* ------------------------------------------------------------------ */

export interface AboutSchoolPayload {
    title: string;
    description: string;
    image?: File | null;
    sort_order?: number;
    is_active?: boolean;
}

export const aboutSchoolService = {
    async getPublic(): Promise<AboutSchool[]> {
        const response = await api.get('/profil/tentang-sekolah');
        return response.data.data;
    },

    async getAll(): Promise<AboutSchool[]> {
        const response = await api.get('/about-school');
        return response.data.data;
    },

    async create(data: AboutSchoolPayload): Promise<AboutSchool> {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('sort_order', String(data.sort_order ?? 0));
        formData.append('is_active', data.is_active === false ? '0' : '1');
        if (data.image) formData.append('image', data.image);

        const response = await api.post('/about-school/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    async update(id: number, data: Partial<AboutSchoolPayload>): Promise<AboutSchool> {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        if (data.title !== undefined) formData.append('title', data.title);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.sort_order !== undefined) formData.append('sort_order', String(data.sort_order));
        if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
        if (data.image instanceof File) formData.append('image', data.image);

        const response = await api.post(`/about-school/${id}/update`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/about-school/${id}/delete`);
    },
};

/* ------------------------------------------------------------------ */
/* Nilai Pendidikan                                                    */
/* ------------------------------------------------------------------ */

export interface EducationValuePayload {
    title: string;
    description?: string;
    items: { title: string; description?: string }[];
    sort_order?: number;
    is_active?: boolean;
}

export const educationValueService = {
    async getById(id: number): Promise<EducationValue> {
        const response = await api.get(`/education-value/${id}`);
        return response.data.data;
    },

    async getPublic(): Promise<EducationValue[]> {
        const response = await api.get('/profil/nilai-pendidikan');
        return response.data.data;
    },

    async getAll(): Promise<EducationValue[]> {
        const response = await api.get('/education-value');
        return response.data.data;
    },

    async create(data: EducationValuePayload): Promise<EducationValue> {
        const response = await api.post('/education-value/create', data);
        return response.data.data;
    },

    async update(id: number, data: Partial<EducationValuePayload>): Promise<EducationValue> {
        const response = await api.put(`/education-value/${id}/update`, data);
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/education-value/${id}/delete`);
    },
};

/* ------------------------------------------------------------------ */
/* Kepala Sekolah                                                      */
/* ------------------------------------------------------------------ */

export interface PrincipalPayload {
    name: string;
    position?: string;
    employee_number?: string;
    photo?: File | null;
    greeting?: string;
    education_history?: string[];
    started_at?: string;
    ended_at?: string;
    is_active?: boolean;
    sort_order?: number;
}

export const principalService = {
    async getById(id: number): Promise<Principal> {
        const response = await api.get(`/principal/${id}`);
        return response.data.data;
    },

    async getPublic(): Promise<Principal[]> {
        const response = await api.get('/profil/kepala-sekolah');
        return response.data.data;
    },

    async getAll(): Promise<Principal[]> {
        const response = await api.get('/principal');
        return response.data.data;
    },

    async create(data: PrincipalPayload): Promise<Principal> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('position', data.position ?? 'Kepala Sekolah');
        formData.append('employee_number', data.employee_number ?? '');
        formData.append('greeting', data.greeting ?? '');
        formData.append('started_at', data.started_at ?? '');
        formData.append('ended_at', data.ended_at ?? '');
        formData.append('sort_order', String(data.sort_order ?? 0));
        formData.append('is_active', data.is_active === false ? '0' : '1');
        (data.education_history ?? []).forEach((item, index) =>
            formData.append(`education_history[${index}]`, item)
        );
        if (data.photo) formData.append('photo', data.photo);

        const response = await api.post('/principal/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    async update(id: number, data: Partial<PrincipalPayload>): Promise<Principal> {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        if (data.name !== undefined) formData.append('name', data.name);
        if (data.position !== undefined) formData.append('position', data.position);
        if (data.employee_number !== undefined) formData.append('employee_number', data.employee_number);
        if (data.greeting !== undefined) formData.append('greeting', data.greeting);
        if (data.started_at !== undefined) formData.append('started_at', data.started_at);
        if (data.ended_at !== undefined) formData.append('ended_at', data.ended_at);
        if (data.sort_order !== undefined) formData.append('sort_order', String(data.sort_order));
        if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
        if (data.education_history !== undefined) {
            data.education_history.forEach((item, index) =>
                formData.append(`education_history[${index}]`, item)
            );
        }
        if (data.photo instanceof File) formData.append('photo', data.photo);

        const response = await api.post(`/principal/${id}/update`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/principal/${id}/delete`);
    },
};

/* ------------------------------------------------------------------ */
/* Guru & Tenaga Kependidikan                                          */
/* ------------------------------------------------------------------ */

export interface TeacherPayload {
    name: string;
    email?: string;
    gender: 'L' | 'P';
    last_education?: string;
    position?: string;
    phone?: string;
    address?: string;
    photo?: File | null;
    sort_order?: number;
    is_active?: boolean;
}

export const teacherService = {
    async exportTeachers(): Promise<void> {
        const response = await api.get('/teacher/export', { responseType: 'blob' });
        saveBlob(
            response.data as Blob,
            getFilenameFromDisposition(response.headers['content-disposition'] as string | undefined, 'data-guru.xlsx')
        );
    },

    async downloadTemplate(): Promise<void> {
        const response = await api.get('/teacher/template', { responseType: 'blob' });
        saveBlob(
            response.data as Blob,
            getFilenameFromDisposition(response.headers['content-disposition'] as string | undefined, 'template-import-guru.xlsx')
        );
    },

    async importTeachers(file: File): Promise<{ created: number; updated: number; message: string }> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/teacher/import', formData);

        return {
            created: response.data.data?.created ?? 0,
            updated: response.data.data?.updated ?? 0,
            message: response.data.message ?? 'Impor guru selesai.',
        };
    },

    async getById(id: number): Promise<Teacher> {
        const response = await api.get(`/teacher/${id}`);
        return response.data.data;
    },

    async getPublic(): Promise<Teacher[]> {
        const response = await api.get('/profil/guru');
        return response.data.data;
    },

    async getAll(): Promise<Teacher[]> {
        const response = await api.get('/teacher');
        return response.data.data;
    },

    async create(data: TeacherPayload): Promise<Teacher> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email ?? '');
        formData.append('gender', data.gender);
        formData.append('last_education', data.last_education ?? '');
        formData.append('position', data.position ?? '');
        formData.append('phone', data.phone ?? '');
        formData.append('address', data.address ?? '');
        formData.append('sort_order', String(data.sort_order ?? 0));
        formData.append('is_active', data.is_active === false ? '0' : '1');
        if (data.photo) formData.append('photo', data.photo);

        const response = await api.post('/teacher/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    async update(id: number, data: Partial<TeacherPayload>): Promise<Teacher> {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        if (data.name !== undefined) formData.append('name', data.name);
        if (data.email !== undefined) formData.append('email', data.email);
        if (data.gender !== undefined) formData.append('gender', data.gender);
        if (data.last_education !== undefined) formData.append('last_education', data.last_education);
        if (data.position !== undefined) formData.append('position', data.position);
        if (data.phone !== undefined) formData.append('phone', data.phone);
        if (data.address !== undefined) formData.append('address', data.address);
        if (data.sort_order !== undefined) formData.append('sort_order', String(data.sort_order));
        if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
        if (data.photo instanceof File) formData.append('photo', data.photo);

        const response = await api.post(`/teacher/${id}/update`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/teacher/${id}/delete`);
    },

    // Admin: buatkan akun login untuk guru (password awal ditampilkan sekali)
    async createAccount(
        id: number,
        email: string
    ): Promise<{ email: string; password: string; message: string }> {
        const response = await api.post(`/teacher/${id}/account`, { email });

        return {
            email: response.data.data?.email ?? email,
            password: response.data.data?.password ?? '',
            message: response.data.message ?? 'Akun berhasil dibuat.',
        };
    },

    // Admin: buat ulang password akun guru
    async resetPassword(
        id: number
    ): Promise<{ email: string; password: string; message: string }> {
        const response = await api.post(`/teacher/${id}/reset-password`);

        return {
            email: response.data.data?.email ?? '',
            password: response.data.data?.password ?? '',
            message: response.data.message ?? 'Password berhasil dibuat ulang.',
        };
    },

    // Guru: profil sendiri beserta penugasannya
    async getMyProfile(): Promise<{
        teacher: { id: number; name: string; email: string | null; position: string | null };
        homerooms: Array<{
            academic_year_id: number;
            academic_year: string | null;
            classroom_id: number;
            classroom: string | null;
        }>;
        teachings: Array<{
            academic_year_id: number;
            academic_year: string | null;
            classroom_id: number;
            classroom: string | null;
            subject_id: number;
            subject: string | null;
            subject_code: string | null;
        }>;
    }> {
        const response = await api.get('/guru/profile');
        return response.data.data;
    },
};

/* ------------------------------------------------------------------ */
/* Legalitas / NPSN                                                    */
/* ------------------------------------------------------------------ */

export interface LegalityPayload {
    title?: string;
    description: string;
    image?: File | null;
    sort_order?: number;
    is_active?: boolean;
}

export const legalityService = {
    async getPublic(): Promise<Legality[]> {
        const response = await api.get('/profil/legalitas');
        return response.data.data;
    },

    async getAll(): Promise<Legality[]> {
        const response = await api.get('/legality');
        return response.data.data;
    },

    async create(data: LegalityPayload): Promise<Legality> {
        const formData = new FormData();
        formData.append('title', data.title ?? '');
        formData.append('description', data.description);
        formData.append('sort_order', String(data.sort_order ?? 0));
        formData.append('is_active', data.is_active === false ? '0' : '1');
        if (data.image) formData.append('image', data.image);

        const response = await api.post('/legality/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    async update(id: number, data: Partial<LegalityPayload>): Promise<Legality> {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        if (data.title !== undefined) formData.append('title', data.title);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.sort_order !== undefined) formData.append('sort_order', String(data.sort_order));
        if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
        if (data.image instanceof File) formData.append('image', data.image);

        const response = await api.post(`/legality/${id}/update`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/legality/${id}/delete`);
    },
};

/* ------------------------------------------------------------------ */
/* Struktur Organisasi                                                 */
/* ------------------------------------------------------------------ */

export interface OrganizationStructurePayload {
    name: string;
    position: string;
    photo?: File | null;
    sort_order?: number;
    is_active?: boolean;
}

export const organizationStructureService = {
    async getById(id: number): Promise<OrganizationStructure> {
        const response = await api.get(`/organization-structure/${id}`);
        return response.data.data;
    },

    async getPublic(): Promise<OrganizationStructure[]> {
        const response = await api.get('/profil/struktur-organisasi');
        return response.data.data;
    },

    async getAll(): Promise<OrganizationStructure[]> {
        const response = await api.get('/organization-structure');
        return response.data.data;
    },

    async create(data: OrganizationStructurePayload): Promise<OrganizationStructure> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('position', data.position);
        formData.append('sort_order', String(data.sort_order ?? 0));
        formData.append('is_active', data.is_active === false ? '0' : '1');
        if (data.photo) formData.append('photo', data.photo);

        const response = await api.post('/organization-structure/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    async update(
        id: number,
        data: Partial<OrganizationStructurePayload>
    ): Promise<OrganizationStructure> {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        if (data.name !== undefined) formData.append('name', data.name);
        if (data.position !== undefined) formData.append('position', data.position);
        if (data.sort_order !== undefined) formData.append('sort_order', String(data.sort_order));
        if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
        if (data.photo instanceof File) formData.append('photo', data.photo);

        const response = await api.post(`/organization-structure/${id}/update`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/organization-structure/${id}/delete`);
    },
};
