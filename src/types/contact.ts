export interface Social {
    id?: number;
    platform: string;
    url: string;
    created_at?: string;
    updated_at?: string;
}

export interface Contact {
    id: number;
    logo?: string;
    logo_url?: string;
    deskripsi?: string;
    alamat?: string;
    telepon?: string;
    email?: string;
    map_embed?: string;
    socials?: Social[];
    created_at?: string;
    updated_at?: string;
}

export interface CreateContactDto {
    logo?: File;
    deskripsi?: string;
    alamat?: string;
    telepon?: string;
    email?: string;
    map_embed?: string;
    socials?: Array<{ platform: string; url: string }>;
}

export interface UpdateContactDto {
    logo?: File | null;
    deskripsi?: string;
    alamat?: string;
    telepon?: string;
    email?: string;
    map_embed?: string;
    socials?: Array<{ platform: string; url: string }>;
}