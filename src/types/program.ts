export interface Program {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    thumbnail_url?: string;
    status: 'draft' | 'published';
    created_at?: string;
    updated_at?: string;
}

export interface CreateProgramDto {
    title: string;
    description: string;
    thumbnail?: File;
    status: 'draft' | 'published';
}

export interface UpdateProgramDto {
    title?: string;
    description?: string;
    thumbnail?: File | null;
    thumbnail_url?: string;
    status?: 'draft' | 'published';
}