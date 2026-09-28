export interface GalleryCategory {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
    galleries_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface GalleryPhoto {
    id: number;
    gallery_id?: number;
    image: string;
    image_url?: string | null;
    thumb_url?: string | null;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface Gallery {
    id: number;
    gallery_category_id: number;
    category?: GalleryCategory | null;
    title: string;
    description?: string | null;
    sort_order: number;
    is_active: boolean;
    photos: GalleryPhoto[];
    cover_url?: string | null;
    photos_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface CreateGalleryDto {
    gallery_category_id: number;
    title: string;
    description?: string;
    photos: File[];
    sort_order?: number;
    is_active?: boolean;
}

export interface UpdateGalleryDto {
    gallery_category_id?: number;
    title?: string;
    description?: string;
    photos?: File[];
    deleted_photo_ids?: number[];
    sort_order?: number;
    is_active?: boolean;
}

export interface GalleryCategoryDto {
    name: string;
    sort_order?: number;
    is_active?: boolean;
}
