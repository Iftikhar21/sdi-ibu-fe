export interface AboutSchool {
    id: number;
    title: string;
    description: string;
    image?: string | null;
    image_url?: string | null;
    sort_order: number;
    is_active: boolean;
}

export interface EducationValueItem {
    id?: number;
    title: string;
    description?: string | null;
    sort_order?: number;
}

export interface EducationValue {
    id: number;
    title: string;
    description?: string | null;
    items: EducationValueItem[];
    sort_order: number;
    is_active: boolean;
}

export interface Principal {
    id: number;
    name: string;
    position: string;
    employee_number?: string | null;
    photo?: string | null;
    photo_url?: string | null;
    greeting?: string | null;
    education_history: string[];
    started_at?: string | null;
    ended_at?: string | null;
    is_active: boolean;
    sort_order: number;
}

export interface Teacher {
    id: number;
    name: string;
    email?: string | null;
    user_id?: number | null;
    has_account?: boolean;
    gender: 'L' | 'P';
    last_education?: string | null;
    position?: string | null;
    phone?: string | null;
    address?: string | null;
    photo?: string | null;
    photo_url?: string | null;
    sort_order: number;
    is_active: boolean;
}

export interface Legality {
    id: number;
    title?: string | null;
    description: string;
    image?: string | null;
    image_url?: string | null;
    sort_order: number;
    is_active: boolean;
}

export interface OrganizationStructure {
    id: number;
    name: string;
    position: string;
    photo?: string | null;
    photo_url?: string | null;
    sort_order: number;
    is_active: boolean;
}
