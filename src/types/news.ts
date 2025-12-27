export interface NewsPhoto {
    id: number;
    news_id: number;
    path: string;
    photo_url: string;
    created_at?: string;
    updated_at?: string;
}

export interface News {
    id: number;
    title: string;
    slug: string;
    content: string;
    thumbnail?: string;
    thumbnail_url: string;
    photos?: NewsPhoto[];
    views: number;
    created_at?: string;
    updated_at?: string;
}

export interface CreateNewsDto {
    title: string;
    content: string;
    thumbnail?: File;
    photos?: File[];
}

export interface UpdateNewsDto {
    title?: string;
    content?: string;
    thumbnail?: File;
    remove_thumbnail?: boolean;
    photos?: File[];
    deleted_photos?: number[];
}